import { BrowserInterface } from '../browser/browserInterface';
import { ScraperInterface } from './scraperInterface';
import axios from 'axios';
import { ScraperOptions } from './scraperFactory';
import { RetryUtils } from './utils';
import winston from 'winston';

export class PradaScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private readonly pradaGetItemBase =
    'https://www.prada.com/us/en/women/bags/totes/products.nux.getProductsByPartNumbers.json?partNumbers=';

  private logger: winston.Logger;

  constructor(options: ScraperOptions) {
    this.browser = options.browser;
    this.logger = options.logger.child({ class: 'PradaScraper' });
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    let nextLink: string | undefined = seed;
    const output: any[] = [];
    while (nextLink) {
      this.logger.debug(`Navigating to link ${nextLink}`);
      await this.browser.navigatePage(nextLink);
      await this.browser.errorHandler();
      const results: string[] = [];
      const productElements = await this.browser.findByXpath(
        "//div[contains(@class, 'gridCategory__item')]",
      );
      this.logger.info(
        `Found ${productElements.length} products to go through`,
      );
      for (const element of productElements) {
        const partNumber = await element.getAttribute('data-part-number');
        if (partNumber) {
          results.push(partNumber);
        }
      }
      for (const part of results) {
        const productMethod = async (): Promise<any> => {
          return await this.retreiveProductInfoForPart(part);
        };
        output.push(
          await RetryUtils.retryWithDelay<Promise<any>>(productMethod, (e) => {
            this.logger.error(`Failed for ${part}`, e);
          }),
        );
      }
      nextLink = await (
        await this.browser.findByXpath("//link[@rel='next']")
      )[0]?.getAttribute('href');
    }
    return output;
  }

  async retreiveProductInfoForPart(part: string): Promise<any> {
    const url = `${this.pradaGetItemBase}${part}`;
    this.logger.debug('Retrieving product info', { url, part });
    const response = (
      await axios.get<any>(url, {
        timeout: 10000,
        withCredentials: true,
      })
    ).data;
    this.logger.debug('Recieved response for product info', { url, part });
    const variant = response?.response?.catalogEntryView[0]?.sKUs;
    const attributesList = response?.response?.catalogEntryView[0]?.attributes;
    const attributeDict: { [key: string]: any } = {};
    for (const attribute of attributesList) {
      attributeDict[attribute.name as string] = attribute;
    }
    return {
      ...response?.response,
      productInfo: variant,
      attributeDict,
    };
  }
}
