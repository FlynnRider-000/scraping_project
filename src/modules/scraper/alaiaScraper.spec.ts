import { BrowserElement, BrowserInterface } from '../browser/browserInterface';
import { mockDeep } from 'jest-mock-extended';
import { AlaiaScraper } from './alaiaScraper';
import { ScraperOptions } from './scraperFactory';
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing Alaia Scraper', () => {
  let scraper: AlaiaScraper;
  let mockBrowser: any & BrowserInterface;

  beforeEach(async () => {
    mockBrowser = mockDeep<BrowserInterface>();
    scraper = new AlaiaScraper({ browser: mockBrowser } as ScraperOptions);
  });

  it('testing calculate url with all items', async () => {
    mockBrowser.extract = jest.fn().mockImplementation(() => 5);
    mockBrowser.findByXpath = jest.fn().mockImplementation(() => [
      mockDeep<BrowserElement>({
        getAttribute: async () =>
          JSON.stringify({
            options: { apiRequest: 'productsPerPage=10' },
          }),
      }),
    ]);
    const url = await scraper.calculateUrlWithAllItems('https://fake-page.com');
    expect(url).toEqual('https://fake-page.com?productsPerPage=50&');
  });

  it('test retrieving more productInfo', async () => {
    mockedAxios.get.mockImplementation(async (productUrl: string) => {
      expect(productUrl).toEqual(
        'https://www.maison-alaia.com/yTos/api/Plugins/ItemPluginApi/GetCombinationsAsync/?siteCode=ALAIA_US&code10=testProduct',
      );
      return { data: { category: 'handbags' } };
    });
    const productInfo = await scraper.retrieveMoreProductInfo('testProduct', {
      color: 'black',
    });
    expect(productInfo).toEqual({
      category: 'handbags',
      color: 'black',
    });
  });

  it('test scrapeSeed looping logic', async () => {
    jest
      .spyOn(scraper, 'calculateUrlWithAllItems')
      .mockImplementation(
        async (seed: string) => `${seed}?productsPerPage=250`,
      );
    jest
      .spyOn(scraper, 'retrieveMoreProductInfo')
      .mockImplementation(async (productId, baseProductInfo) => {
        return {
          sku: productId,
          ...baseProductInfo,
        };
      });
    mockBrowser.extract.mockImplementation(async () => [
      {
        product_cod10: 'product1',
        color: 'red',
      },

      {
        product_cod10: 'product2',
        color: 'black',
      },
      {
        product_cod10: 'product30',
        color: 'blue',
      },
    ]);
    const productData = await scraper.scrapeSeed('http://fake-url.com');
    expect(productData).toEqual([
      {
        product_cod10: 'product1',
        color: 'red',
        sku: 'product1',
      },
      {
        product_cod10: 'product2',
        color: 'black',
        sku: 'product2',
      },
      {
        product_cod10: 'product30',
        color: 'blue',
        sku: 'product30',
      },
    ]);
  });
});
