import axios from 'axios';
import { BrowserInterface } from '../browser/browserInterface';
import { ScraperOptions } from './scraperFactory';
import { ScraperInterface } from './scraperInterface';
import { RestUtils } from './utils';

export class BvlgariScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private pagination: number;
  private readonly baseUrl = 'https://www.bulgari.com/';

  constructor(options: ScraperOptions) {
    this.browser = options.browser;
    this.pagination = options.paginationStart;
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    const baseUrl = new RestUtils(seed);
    let nextLink: string | undefined = baseUrl.getUrlWithUpdatedParameters({
      sz: this.pagination.toString(),
    });
    let current = 0;
    const productList: any[] = [];
    while (nextLink) {
      await this.browser.navigatePage(nextLink);
      const itemsUrls: Set<string> = new Set<string>(
        await this.browser.extract<string[]>((...elements) => {
          return elements.map((e) => e.getAttribute('href'));
        }, "//a[contains(@class, 'product-url still-image')]"),
      );
      const seenVariantUrls = new Set<string>();
      for (const url of itemsUrls) {
        productList.push(
          ...(await this.getItemAndVariants(
            BvlgariScraper.convertUrlToUSLink(url),
            seenVariantUrls,
          )),
        );
      }
      current += this.pagination;
      nextLink = await this.calculateNextUrl(baseUrl, current);
    }
    return productList;
  }

  async getItemAndVariants(
    url: string,
    seenProductIds: Set<string>,
  ): Promise<any[]> {
    const productInfoPageIdentifier = 'productInfoPage';
    await this.browser.navigatePage(
      `${this.baseUrl}${url}`,
      productInfoPageIdentifier,
    );
    const productDataList: any[] = [];
    const variantUrls: Set<string> = new Set(
      await this.browser.extract<string[]>(
        (...variants) => {
          return variants.map((variant) => {
            const productUrl = variant.getAttribute('href');
            return productUrl;
          });
        },
        "//a[@title='Product Variation']",
        productInfoPageIdentifier,
      ),
    );
    for (const variantUrl of variantUrls) {
      const newUrl = BvlgariScraper.convertUrlToUSLink(variantUrl);
      const response = await axios.get<any>(newUrl);
      const productId = await response.data.product.id;
      if (!seenProductIds.has(productId)) {
        productDataList.push(
          await this.updateProductImagesIfMissing(response.data),
        );
        seenProductIds.add(productId);
      }
    }
    return productDataList;
  }

  private static convertUrlToUSLink(originalLink: string) {
    // Though I do not see this problem in the browser,
    // it looks like link localization is getting messed up in the scraper.
    // Localizing links to US
    const aeStoreResource = 'Sites-AE-Site/ar_AE';
    const aeLocalization = 'ar-ae';
    let newLink = originalLink;
    if (newLink.includes(aeStoreResource)) {
      newLink = newLink.replace(aeStoreResource, 'Sites-US-Site/en_US');
    }
    if (newLink.includes(aeLocalization)) {
      newLink = newLink.replace(aeLocalization, 'en-US');
    }
    return newLink;
  }

  private async calculateNextUrl(
    base: RestUtils,
    newStart: number,
  ): Promise<string | undefined> {
    // We are controlling pagination ourselves but
    // we should still check that there is not more to load
    const nextLink = await (
      await this.browser.findByXpath("//button[@data-pos='1']")
    )[0]?.getAttribute('data-url');
    if (!nextLink) {
      return undefined;
    }
    return base.getUrlWithUpdatedParameters({
      start: newStart.toString(),
      sz: this.pagination.toString(),
    });
  }

  private async updateProductImagesIfMissing(productData: any) {
    // Links missing the proper color query parameter are missing the product Images
    // This happens on the default product of each page
    // Pulling the proper images from the variant section that matches color
    if (productData.productImages.length == 0) {
      const productColor =
        productData.product.bulgariTech.refinementColor.value;
      for (const colorVariant of productData.product.variationAttributes[0]
        .values) {
        if (colorVariant.id == productColor) {
          productData.productImages = colorVariant.images.large;
        }
      }
    }

    return productData;
  }
}
