import { Browser, ElementHandle, Page } from 'puppeteer';
import winston from 'winston';
import puppeteer from 'puppeteer';
import { BrowserInterface, NoPageFoundError } from './browserInterface';
import { PuppeteerBrowser, PuppeteerBrowserElement } from './puppeteerBrowser';
import { mockDeep } from 'jest-mock-extended';

describe('Testing puppeteer implementation of BrowserInterface', () => {
  let browser: BrowserInterface;
  const mockLogger = mockDeep<winston.Logger>();
  let mockPuppeteerPage: any & Page;
  let mockPuppeteer: any & Browser;

  beforeEach(async () => {
    mockPuppeteerPage = mockDeep<Page>();
    mockPuppeteer = mockDeep<Browser>({
      newPage: jest.fn().mockImplementation(async () => mockPuppeteerPage),
    });
    browser = new PuppeteerBrowser(mockPuppeteer, mockLogger);
  });

  it('new page created onlyif doesnt already exist', async () => {
    // First time creates a new page
    const pageName = await browser.navigatePage('fake-page.com', 'newPage');
    expect(pageName).toEqual('newPage');
    expect(mockPuppeteer.newPage.mock.calls.length).toBe(1);
    expect(mockPuppeteerPage.goto).toBeCalledWith('fake-page.com', {
      waitUntil: 'networkidle2',
    });

    // page already exists so it should not newPage should not be called again
    await browser.navigatePage('second-page.com', 'newPage');
    expect(mockPuppeteer.newPage.mock.calls.length).toBe(1);
    expect(mockPuppeteerPage.goto).toBeCalledWith('second-page.com', {
      waitUntil: 'networkidle2',
    });

    // Given a new page identifier, a new page will be created
    await browser.navigatePage('third-page.com', 'newPage2');
    expect(mockPuppeteer.newPage.mock.calls.length).toBe(2);
    expect(mockPuppeteerPage.goto).toBeCalledWith('third-page.com', {
      waitUntil: 'networkidle2',
    });
  });

  it('find by xpath on page that does not exist throws error', async () => {
    await expect(async () => {
      await browser.findByXpath('//a[@class="testxpath"]');
    }).rejects.toThrow(NoPageFoundError);
  });

  it('test find by xpath on page', async () => {
    const mockElementHandle = mockDeep<ElementHandle>();
    const returnElemnts = [new PuppeteerBrowserElement(mockElementHandle)];
    mockPuppeteerPage.$x = jest.fn().mockImplementation(() => returnElemnts);
    await browser.navigatePage('fake-page.com');
    const elements = await browser.findByXpath('//a[@class="testxpath"]');
    expect(mockPuppeteerPage.$x).toBeCalledWith('//a[@class="testxpath"]');
    expect(elements.length).toEqual(1);
  });

  it('extract on page that does not exist throws error', async () => {
    await expect(async () => {
      await browser.extract<void>('some.value');
    }).rejects.toThrow(NoPageFoundError);
  });

  it('testing element extraction without xpath', async () => {
    await browser.navigatePage('fake-page.com', 'newPage');
    const mockExtractFunction = (): string => {
      return 'found';
    };
    await browser.extract<void>(mockExtractFunction, undefined, 'newPage');
    expect(mockPuppeteerPage.evaluate).toBeCalledWith(mockExtractFunction);
  });

  it('testing element extraction with xpath', async () => {
    await browser.navigatePage('fake-page.com', 'newPage');
    const mockExtractFunction = (): string => {
      return 'found';
    };
    mockPuppeteerPage.$x = jest.fn().mockImplementation(async () => []);
    await browser.extract<void>(
      mockExtractFunction,
      'a[@class="testxpath"]',
      'newPage',
    );
    expect(mockPuppeteerPage.evaluate).toBeCalledWith(
      mockExtractFunction,
      ...[],
    );
    expect(mockPuppeteerPage.$x).toBeCalledWith('a[@class="testxpath"]');
  });
  it('get cookies on page that does not exist throws error', async () => {
    await expect(async () => {
      await browser.getCookies();
    }).rejects.toThrow(NoPageFoundError);
  });

  it('test get cookies', async () => {
    await browser.navigatePage('fake-page.com', 'newPage');
    const returnCookie = mockDeep<puppeteer.Protocol.Network.Cookie>();
    returnCookie.name = 'my-site';
    returnCookie.value = 'my-cookie';
    mockPuppeteerPage.cookies = jest
      .fn()
      .mockImplementation(async () => [returnCookie]);
    const cookieString = await browser.getCookies('newPage');
    expect(cookieString).toBe('my-site=my-cookie');
  });
});
