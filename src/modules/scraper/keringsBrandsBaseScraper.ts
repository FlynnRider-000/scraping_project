import axios from 'axios';
import { BrowserInterface } from '../browser/browserInterface';
import { ScraperOptions } from './scraperFactory';
import { ScraperInterface } from './scraperInterface';
import { ScraperUtils } from './utils';
import winston from 'winston';

type KeringsBrandsOptions = {
  baseUrl: string;
  loadMoreTextXpath: string;
  loadMoreButtonXpath: string;
  productLinkXpath: string;
  productVariantXpath: string;
};

/**
 * Several brands belonging to the Kerings Group use the same backend technology.
 * This only variance is where things are located on the page
 */
export class KeringBrandsBaseScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private logger: winston.Logger;
  private baseUrl: string;
  private loadMoreTextXpath: string;
  private loadMoreButtonXpath: string;
  private productLinkXpath: string;
  private productVariantXpath: string;

  constructor(
    baseOptions: ScraperOptions,
    keringsOptions: KeringsBrandsOptions,
  ) {
    this.browser = baseOptions.browser;
    this.logger = baseOptions.logger;
    this.baseUrl = keringsOptions.baseUrl;
    this.loadMoreTextXpath = keringsOptions.loadMoreTextXpath;
    this.loadMoreButtonXpath = keringsOptions.loadMoreButtonXpath;
    this.productLinkXpath = keringsOptions.productLinkXpath;
    this.productVariantXpath = keringsOptions.productVariantXpath;
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    await this.browser.navigatePage(seed);
    const allItemsUrl = await this.calculateUrlForAllItems();
    await this.browser.navigatePage(allItemsUrl);

    const itemsUrls: string[] = await this.browser.extract<string[]>(
      (...elements) => {
        return elements.map((e) => e.getAttribute('href'));
      },
      this.productLinkXpath,
    );
    const seenProducts = new Set<string>();
    const productData: any[] = [];
    for (const url of itemsUrls) {
      productData.push(...(await this.getItemAndVariants(url, seenProducts)));
    }
    return productData;
  }

  async calculateUrlForAllItems() {
    const loadMoreText = await (
      await this.browser.findByXpath(this.loadMoreTextXpath)
    )[0].getText();
    if (!loadMoreText) {
      throw new Error('Cannot determine how many items to query for');
    }
    const itemCount = loadMoreText.trim().split(' ')[3];
    const originalLoadLink = await (
      await this.browser.findByXpath(this.loadMoreButtonXpath)
    )[0].getAttribute('data-historyurl');
    if (!originalLoadLink) {
      throw new Error('Cannot determine what to query');
    }

    return ScraperUtils.updateQueryParameter(originalLoadLink, {
      sz: itemCount,
    });
  }

  async getItemAndVariants(
    url: string,
    seenProducts: Set<string>,
  ): Promise<any[]> {
    const productInfoPageIdentifier = 'productInfoPage';
    await this.browser.navigatePage(
      `${this.baseUrl}${url}`,
      productInfoPageIdentifier,
    );
    const productDataList: any[] = [];
    const variantUrls = await this.browser.extract<string[]>(
      (...variants) => {
        return variants.map((variant) => {
          const productUrl = variant.getAttribute('data-attr-href');
          return productUrl;
        });
      },
      this.productVariantXpath,
      productInfoPageIdentifier,
    );
    for (const variantUrl of variantUrls) {
      const response = await axios.get<any>(variantUrl);
      const productId = response.data.product.productSMC;
      if (!seenProducts.has(productId)) {
        productDataList.push(response.data);
        seenProducts.add(productId);
      }
    }
    return productDataList;
  }
}
