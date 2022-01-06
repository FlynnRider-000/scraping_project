import winston from 'winston';
import { BrowserElement, BrowserInterface } from '../browser/browserInterface';
import { KeringBrandsBaseScraper } from './keringsBrandsBaseScraper';
import { mockDeep } from 'jest-mock-extended';
import { ScraperOptions } from './scraperFactory';
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing base browser for Kerings group', () => {
  let scraper: KeringBrandsBaseScraper;
  let mockBrowser: any & BrowserInterface;
  const logger = mockDeep<winston.Logger>();
  const baseUrl = 'http://fake-url';
  const loadMoreTextXpath = '//a[@class="loadMoreText]"';
  const loadMoreButtonXpath = '//a[@class="loadMoreButton]"';
  const productLinkXpath = '//a[@class="productLinkXpath]"';
  const productVariantXpath = '//a[@class="productVariantXpath]"';

  beforeEach(async () => {
    mockBrowser = mockDeep<BrowserInterface>();
    scraper = new KeringBrandsBaseScraper(
      {
        browser: mockBrowser,
        logger,
        paginationStart: 1,
      } as ScraperOptions,
      {
        baseUrl,
        loadMoreTextXpath,
        loadMoreButtonXpath,
        productLinkXpath,
        productVariantXpath,
      },
    );
  });

  it('test calculate url for all items', async () => {
    mockBrowser.findByXpath.mockImplementation(async (path: string) => {
      if (path == loadMoreTextXpath) {
        return [
          mockDeep<BrowserElement>({
            getText: async () => '10 out of 200',
          }),
        ];
      } else if (path == loadMoreButtonXpath) {
        return [
          mockDeep<BrowserElement>({
            getAttribute: async () => `${baseUrl}?sz=10`,
          }),
        ];
      }
      throw new Error('Unexpected input');
    });
    const url = await scraper.calculateUrlForAllItems();
    expect(url).toEqual(`${baseUrl}?sz=200&`);
  });

  it('test getItemsAndVariants', async () => {
    mockBrowser.extract.mockImplementation(async () => [
      `${baseUrl}/products/product1`,
      `${baseUrl}/products/product2`,
      `${baseUrl}/products/product30`,
      `${baseUrl}/products/product30`,
    ]);
    mockedAxios.get.mockImplementation(async (url) => {
      const urlParts = url.split('/');
      const productId = urlParts[urlParts.length - 1];
      let productData: any = { productId, productSMC: productId };
      if (productId == 'product1') {
        productData = {
          ...productData,
          color: 'black',
          category: 'handbag',
        };
      } else if (productId == 'product2') {
        productData = {
          ...productData,
          color: 'red',
          category: 'handbag',
        };
      } else if (productId == 'product30') {
        productData = {
          ...productData,
          color: 'blue',
          category: 'handbag',
        };
      } else {
        throw new Error('Unexpected productId');
      }
      return { data: { product: productData } };
    });
    const productWithVariants = await scraper.getItemAndVariants(
      `${baseUrl}?product=product1`,
      new Set<string>(),
    );
    expect(productWithVariants).toEqual([
      {
        product: {
          productId: 'product1',
          productSMC: 'product1',
          color: 'black',
          category: 'handbag',
        },
      },
      {
        product: {
          productId: 'product2',
          productSMC: 'product2',
          color: 'red',
          category: 'handbag',
        },
      },
      {
        product: {
          productId: 'product30',
          productSMC: 'product30',
          color: 'blue',
          category: 'handbag',
        },
      },
    ]);
  });

  it('test getItemsAndVariants does checks productIds were already processed', async () => {
    mockBrowser.extract.mockImplementation(async () => [
      `${baseUrl}/products/product1`,
    ]);
    mockedAxios.get.mockImplementation(async (url) => {
      const urlParts = url.split('/');
      const productId = urlParts[urlParts.length - 1];
      let productData: any = { productId, productSMC: productId };
      if (productId == 'product1') {
        productData = {
          ...productData,
          color: 'black',
          category: 'handbag',
        };
      } else {
        throw new Error('Unexpected productId');
      }
      return { data: { product: productData } };
    });
    const alreadySeen = new Set<string>();
    alreadySeen.add('product1');
    const productWithVariants = await scraper.getItemAndVariants(
      `${baseUrl}?product=product1`,
      alreadySeen,
    );
    expect(productWithVariants).toEqual([]);
  });
});
