import { KeringBrandsBaseScraper } from './keringsBrandsBaseScraper';
import { ScraperOptions } from './scraperFactory';

export class BalenciagaScraper extends KeringBrandsBaseScraper {
  constructor(options: ScraperOptions) {
    super(options, {
      baseUrl: 'https://www.balenciaga.com',
      loadMoreTextXpath: "//h2[contains(@class, 'c-loadmore__count')]",
      loadMoreButtonXpath: "//button[contains(@class, 'c-loadmore__btn')]",
      productLinkXpath: "//a[contains(@class, 'c-product__inner')]",
      productVariantXpath: "//input[contains(@class, 'c-swatches__input')]",
    });
  }
}
