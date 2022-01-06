import { BrowserInterface } from '../browser/browserInterface';
import { ScraperOptions } from './scraperFactory';
import { ScraperInterface } from './scraperInterface';
import axios from 'axios';

export class ChirstianDiorScraper implements ScraperInterface {
  private browser: BrowserInterface;

  constructor(options: ScraperOptions) {
    this.browser = options.browser;
  }
  async scrapeSeed(seed: string): Promise<any[]> {
    // make initial request to get total number of recoreds
    const numberOfHits = (
      await axios.post<any>(
        'https://kpgnq6fji9-dsn.algolia.net/1/indexes/*/queries?x-algolia-application-id=KPGNQ6FJI9&x-algolia-api-key=64e489d5d73ec5bbc8ef0d7713096fba',
        {
          requests: [
            {
              indexName: 'dev_product_en_us',
              params: `query=${seed}&maxValuesPerFacet=10&page=0&highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&clickAnalytics=true&facets=%5B%22universe%22%5D&tagFilters=`,
            },
          ],
        },
      )
    ).data.results[0].nbHits;

    //request all records at once
    const response = (
      await axios.post<any>(
        'https://kpgnq6fji9-dsn.algolia.net/1/indexes/*/queries?x-algolia-application-id=KPGNQ6FJI9&x-algolia-api-key=64e489d5d73ec5bbc8ef0d7713096fba',
        {
          requests: [
            {
              indexName: 'dev_product_en_us',
              params: `query=${seed}&hitsPerPage=${numberOfHits}&maxValuesPerFacet=10&page=0&highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&clickAnalytics=true&facets=%5B%22universe%22%5D&tagFilters=`,
            },
          ],
        },
      )
    ).data;
    return response.results[0].hits;
  }
}
