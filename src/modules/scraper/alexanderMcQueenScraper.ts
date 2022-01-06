import { KeringBrandsBaseScraper } from './keringsBrandsBaseScraper';
import { ScraperOptions } from './scraperFactory';

export class AlexanderMcQueenScraper extends KeringBrandsBaseScraper {
  constructor(options: ScraperOptions) {
    super(options, {
      baseUrl: 'https://www.alexandermcqueen.com/',
      loadMoreTextXpath: '//p[contains(@class, "c-loadmore__count")]',
      loadMoreButtonXpath: '//button[contains(@class, "c-loadmore__btn")]',
      productLinkXpath: '//a[contains(@class, "c-product__link")]',
      productVariantXpath: '//input[contains(@class, "c-swatches__input")]',
    });
  }
}
