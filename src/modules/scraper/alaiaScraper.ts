import axios from 'axios';
import { BrowserInterface } from '../browser/browserInterface';
import { ScraperOptions } from './scraperFactory';
import { ScraperInterface } from './scraperInterface';
import { RestUtils } from './utils';

export class AlaiaScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private static readonly productInfoUrl =
    'https://www.maison-alaia.com/yTos/api/Plugins/ItemPluginApi/GetCombinationsAsync/?siteCode=ALAIA_US&code10=';
  constructor(options: ScraperOptions) {
    this.browser = options.browser;
  }
  async scrapeSeed(seed: string): Promise<any[]> {
    const productData: any[] = [];
    await this.browser.navigatePage(seed);
    const url = await this.calculateUrlWithAllItems(seed);
    await this.browser.navigatePage(url);
    const productsBaseInfo = await this.browser.extract<any[]>(
      (...elements) => {
        return elements.map((e) =>
          JSON.parse(e.getAttribute('data-ytos-track-product-data')),
        );
      },
      '//article[contains(@class, "product-box")]',
    );
    for (const product of productsBaseInfo) {
      const productCode: string = product.product_cod10;
      productData.push(
        await this.retrieveMoreProductInfo(productCode, product),
      );
    }
    return productData;
  }

  async calculateUrlWithAllItems(seed: string): Promise<string> {
    const totalPages = await this.browser.extract<number>(
      'yTos.search.totalPages',
    );

    const loadMoreButtonData = await (
      await this.browser.findByXpath('//button[@class="loadMoreButton"]')
    )[0].getAttribute('data-ytos-opt');
    if (!loadMoreButtonData) {
      throw new Error('Missing load more button');
    }
    const loadMoreQuery = JSON.parse(loadMoreButtonData)?.options?.apiRequest;
    let url = `${seed}?${loadMoreQuery}`;
    const query = new RestUtils(url);
    const itemsPerPage = parseInt(
      query.getBaseQueryParameter('productsPerPage'),
    );
    const maxNumberOfProducts = itemsPerPage * totalPages;
    url = query.getUrlWithUpdatedParameters({
      productsPerPage: maxNumberOfProducts.toString(),
    });
    return url;
  }

  async retrieveMoreProductInfo(
    productId: string,
    baseProductInfo: any,
  ): Promise<any> {
    const productCode: string = productId;
    const productUrl = AlaiaScraper.productInfoUrl + productCode;
    const productResponse = (await axios.get<any>(productUrl)).data;
    return {
      ...baseProductInfo,
      ...productResponse,
    };
  }
}
