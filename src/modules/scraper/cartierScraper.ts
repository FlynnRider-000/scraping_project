import { BrowserInterface } from '../browser/browserInterface';
import { ScraperInterface } from './scraperInterface';
import axios from 'axios';
import { RetryUtils, ScraperUtils } from './utils';
import { ScraperOptions } from './scraperFactory';
import winston from 'winston';
export class CartierScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private readonly baseUrl = 'http://www.cartier.com';
  private logger: winston.Logger;
  constructor(options: ScraperOptions) {
    this.browser = options.browser;
    this.logger = options.logger.child({ class: 'CartierScraper' });
  }
  async scrapeSeed(seed: string): Promise<any[]> {
    this.logger.info(`Beginning with seed ${seed}`);
    await this.browser.navigatePage(seed);
    const allItemsUrl = await this.calculateAllItemsUrl();
    this.logger.info(`Url for all items: ${allItemsUrl}`);
    await this.browser.navigatePage(allItemsUrl);
    const output: any[] = [];
    const itemUrlElements = await this.browser.findByXpath(
      "//a[@class='product-tile__anchor']",
    );
    console.debug(`Items found on page: ${itemUrlElements.length}`);
    const itemUrls: string[] = [];
    for (const element of itemUrlElements) {
      const url = await element.getAttribute('href');
      if (url) {
        itemUrls.push(url);
      }
    }
    for (const url of itemUrls) {
      const productMethod = async (): Promise<any> => {
        return await this.processProductInfo(url);
      };
      output.push(
        await RetryUtils.retryWithDelay<Promise<any>>(productMethod, (e) => {
          this.logger.error(`Failed to retrieve product data ${url}`, e);
        }),
      );
    }
    return output;
  }

  async processProductInfo(url: string): Promise<any> {
    await this.browser.navigatePage(`${this.baseUrl}${url}`, 'productPage');
    const jsonElements = await this.browser.findByXpath(
      "//script[@type='application/ld+json']",
      'productPage',
    );
    const longDescription = await (
      await this.browser.findByXpath(
        "//span[@class='pdp-main__description-full']",
        'productPage',
      )
    )[0]?.getText();
    for (const jsonElement of jsonElements) {
      const text = await jsonElement.getText();
      if (text) {
        const data: any = JSON.parse(text);
        if (data['@type'] == 'Product') {
          const productId = data?.mpn;
          const url = `https://www.cartier.com/on/demandware.store/Sites-CartierUS-Site/en_US/Gtm-EventViewDataLayer?eventType=productReadMore&reqPath=Product-Show&qString=pid%3D${productId}&eventParams=%7B%22pid%22%3A%22${productId}%22%7D`;
          const response = (
            await axios.get<any>(url, {
              timeout: 10000,
              withCredentials: true,
            })
          ).data;
          return {
            ...data,
            ...response,
            longDescription,
          };
        }
      }
    }
  }

  async calculateAllItemsUrl(): Promise<string> {
    const loadMoreText = await (
      await this.browser.findByXpath(
        "//p[contains(@class, 'search-results__footer')]",
      )
    )[0]?.getText();
    const itemCount = loadMoreText?.split(' ')[3];

    const originalLoadMoreLink = await (
      await this.browser.findByXpath(
        "//button[contains(@class, 'search-results__footer')]",
      )
    )[0].getAttribute('data-url');
    if (!originalLoadMoreLink || !itemCount) {
      throw new Error();
    }
    return ScraperUtils.updateQueryParameter(originalLoadMoreLink, {
      start: '0',
      sz: itemCount,
    });
  }
}
