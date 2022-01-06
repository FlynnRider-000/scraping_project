/**
 * Basic interface for giving input for a scraper
 */
export interface ScraperInterface {
  /**
   * scrapes a given seed and provides raw data required for the product catalog
   * @param seed seed string for how the scraper will get started
   * @return raw unnormalized data
   */
  scrapeSeed(seed: string): Promise<any[]>;
}
