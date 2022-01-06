import axios from 'axios';
import winston from 'winston';
import { ScraperOptions } from './scraperFactory';
import { ScraperInterface } from './scraperInterface';

export class LouisVuittonScraper implements ScraperInterface {
  private paginationStart: number;
  private apiUrl = 'https://api.louisvuitton.com';
  private logger: winston.Logger;

  constructor(options: ScraperOptions) {
    this.paginationStart = options.paginationStart
      ? options.paginationStart
      : 50;
    this.logger = options.logger.child({ class: 'LouisVuittonScraper' });
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    const seedUrlParts = seed.split('/');
    const resourceId = seedUrlParts[seedUrlParts.length - 1].split('-')[1];
    let searchLink:
      | string
      | null = `${this.apiUrl}/api/eng-us/catalog/filter/${resourceId}?range=0-${this.paginationStart}`;
    let lastNumber = this.paginationStart;
    const output: any[] = [];
    while (searchLink) {
      const response = (
        await axios.get<any>(searchLink, {
          timeout: 10000,
          withCredentials: true,
        })
      ).data as any;
      const searchResults = response?.searchResults;
      for (const record of searchResults?.recordList) {
        const productUrl = `${this.apiUrl}${record['_links']['self']['href']}`;
        const productInfo = this.getProductInfo(productUrl);
        if (productInfo) {
          output.push(productInfo);
        }
      }
      const nextUrl = searchResults['_links']['next']['href'];
      const nextUrlParts = nextUrl.split('-');
      const nextLastNumber = parseInt(nextUrlParts[nextUrlParts.length - 1]);
      if (nextLastNumber > lastNumber) {
        searchLink = `${this.apiUrl}${nextUrl}`;
        lastNumber = nextLastNumber;
      } else {
        searchLink = null;
      }
    }
    return output;
  }

  modifyPropertyValue(raw_property_value: any[]): { [key: string]: string } {
    const properties: { [key: string]: string } = {};
    for (const property of raw_property_value) {
      properties[property.name] = property.value;
    }
    return properties;
  }

  async getProductInfo(productUrl: string): Promise<any> {
    const product_info = (
      await axios.get<any>(productUrl, {
        timeout: 10000,
        withCredentials: true,
      })
    ).data;
    const baseProductInfo = product_info?.model
      ? product_info?.model[0]
      : undefined;
    if (baseProductInfo) {
      baseProductInfo.additionalProperties = this.modifyPropertyValue(
        baseProductInfo?.additionalProperty,
      );
      return baseProductInfo;
    } else {
      // TODO: error handling
      const product_url_parts = productUrl.split('/');
      this.logger.error('Unable to process product', {
        productId: product_url_parts[product_url_parts.length - 1],
      });
    }
  }
}
