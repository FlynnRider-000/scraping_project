import { ScraperInterface } from './scraperInterface';
import axios from 'axios';
import { BrowserInterface } from '../browser/browserInterface';
import { RetryUtils, ScraperUtils } from './utils';
import { ScraperOptions } from './scraperFactory';
import winston from 'winston';
export class ChanelScraper implements ScraperInterface {
  private readonly baseUrl = 'https://www.chanel.com';
  private browser: BrowserInterface;
  private logger: winston.Logger;

  constructor(options: ScraperOptions) {
    this.browser = options.browser;
    this.logger = options.logger.child({ class: 'ChanelScraper' });
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    let currentPage = 1;
    let numberOfPages = 0;
    const output: any[] = [];
    while (currentPage == 1 || currentPage <= numberOfPages) {
      this.logger.info('Scraping page', { seed, currentPage, numberOfPages });
      const response = (
        await axios.get<any>(`${seed}&page=${currentPage}`, {
          timeout: 10000,
          withCredentials: true,
        })
      ).data.landingAxisSearchData;
      for (const product of response.productListData.products) {
        output.push(await this.productInfoPromise(product));
        await ScraperUtils.delay(500);
      }
      currentPage++;
      numberOfPages = response.productListData.pagination.numberOfPages;
    }
    return output;
  }

  async productInfoPromise(product: any): Promise<any | undefined> {
    const productId = product.code;
    try {
      return await RetryUtils.retryWithDelay<Promise<any>>(
        async (): Promise<any> => {
          const additionalProductData = (
            await axios.get<any>(
              `${this.baseUrl}/us/yapi/product/${productId}?options=basic,stock,vto,variants&site=chanel`,
              {
                timeout: 10000,
                withCredentials: true,
              },
            )
          ).data;

          const productPage = `${this.baseUrl}${product.link}`;
          await this.browser.navigatePage(productPage, productId);
          const dimensions = await (
            await this.browser.findByXpath(
              "//span[@class='js-dimension']",
              productId,
            )
          )[0].getText();
          return {
            ...product,
            ...additionalProductData,
            dimensions: dimensions,
          };
        },
        (e): void => {
          this.logger.error('Unable to lookup product info', { productId, e });
        },
      );
    } catch (e) {
      this.logger.error('Skipping product', { productId, e });
    }
  }
}
