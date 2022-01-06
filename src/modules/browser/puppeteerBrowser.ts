import { Browser, ElementHandle, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import {
  BrowserElement,
  BrowserExtractionFunctionType,
  BrowserInterface,
  NoPageFoundError,
} from './browserInterface';
import { S3ScreenshotHelper } from './helpers/s3ScreenshotHelper';
import winston from 'winston';

/**
 * Puppeteer implementation of [[BrowserInterface]]
 */
export class PuppeteerBrowser implements BrowserInterface {
  private pages: { [key: string]: Page };
  private static readonly primaryPageIdentifier = 'primary';

  constructor(
    private browser: Browser,
    private logger: winston.Logger,
    private s3ScreenshotHelper?: S3ScreenshotHelper,
  ) {
    this.pages = {};
  }

  async navigatePage(
    url: string,
    pageIdentifier: string = PuppeteerBrowser.primaryPageIdentifier,
  ): Promise<string> {
    if (!this.pages[pageIdentifier]) {
      this.pages[pageIdentifier] = await this.browser.newPage();
    }
    await this.pages[pageIdentifier].goto(url, {
      waitUntil: 'networkidle2',
    });
    return pageIdentifier;
  }

  async findByXpath(
    xpath: string,
    pageIdentifier: string = PuppeteerBrowser.primaryPageIdentifier,
  ): Promise<BrowserElement[]> {
    if (!this.pages[pageIdentifier]) {
      throw new NoPageFoundError();
    }
    const handles = await this.pages[pageIdentifier].$x(xpath);
    return PuppeteerBrowserElement.buildElementsFromList(handles);
  }

  async extract<T>(
    extractFunction: BrowserExtractionFunctionType<T> | string,
    xpath?: string,
    pageIdentifier: string = PuppeteerBrowser.primaryPageIdentifier,
  ): Promise<T> {
    const page = this.pages[pageIdentifier];
    if (!page) {
      throw new NoPageFoundError();
    }
    if (xpath) {
      return await page.evaluate(extractFunction, ...(await page.$x(xpath)));
    } else {
      return await page.evaluate(extractFunction);
    }
  }

  async getCookies(
    pageIdentifier: string = PuppeteerBrowser.primaryPageIdentifier,
  ): Promise<string> {
    const page = this.pages[pageIdentifier];
    if (!page) {
      throw new NoPageFoundError();
    }
    const cookies = await page.cookies();
    const cookiePairs: string[] = [];
    cookies.forEach((cookie) => {
      cookiePairs.push(`${cookie.name}=${cookie.value}`);
    });
    return cookiePairs.join(';');
  }

  async errorHandler(): Promise<void> {
    try {
      for (const [identifier, page] of Object.entries(this.pages)) {
        if (!page.isClosed()) {
          if (this.s3ScreenshotHelper) {
            const screenshot = await page.screenshot();
            if (!screenshot) {
              throw new Error('Empty value screenshot');
            }
            await this.s3ScreenshotHelper.saveScreenshot(
              screenshot,
              identifier,
            );
          } else {
            await page.screenshot({
              path: `error_${identifier}.png`,
            });
          }
        }
      }
    } catch (e) {
      this.logger.error('Unable to screenshot pages', e);
    }
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  public static async initialize(
    logger: winston.Logger,
    headlessMode = true,
    s3ScreenshotHelper?: S3ScreenshotHelper,
  ): Promise<PuppeteerBrowser> {
    const browser = await puppeteer.launch({
      headless: headlessMode,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    return new PuppeteerBrowser(
      browser,
      logger.child({ class: 'PuppeteerBrowser' }),
      s3ScreenshotHelper,
    );
  }
}

export class PuppeteerBrowserElement implements BrowserElement {
  private elemenetHandle: ElementHandle;

  constructor(element: ElementHandle) {
    this.elemenetHandle = element;
  }
  async getAttribute(attr: string): Promise<string | undefined> {
    const attribute = await this.elemenetHandle?.evaluate(
      (el, attr) => el.getAttribute(attr),
      attr,
    );
    return attribute ? attribute : undefined;
  }
  async getText(): Promise<string | undefined> {
    const text = await this.elemenetHandle?.evaluate((el) => el.textContent);
    return text ? text : undefined;
  }

  async getRawElement(): Promise<ElementHandle> {
    return this.elemenetHandle;
  }

  static buildElementsFromList(
    elemenetHandles: ElementHandle[],
  ): PuppeteerBrowserElement[] {
    const newElements: PuppeteerBrowserElement[] = [];
    elemenetHandles.forEach((element) => {
      newElements.push(new PuppeteerBrowserElement(element));
    });
    return newElements;
  }
}
