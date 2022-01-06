import { BrowserInterface } from '../browser/browserInterface';
import { AlaiaScraper } from './alaiaScraper';
import { AlexanderMcQueenScraper } from './alexanderMcQueenScraper';
import { BalenciagaScraper } from './balenciagaScraper';
import { BvlgariScraper } from './bvlgariScraper';
import { CartierScraper } from './cartierScraper';
import { ChanelScraper } from './chanelScraper';
import { ChirstianDiorScraper } from './christianDiorScraper';
import { HermesScraper } from './hermesScrpaer';
import { LouisVuittonScraper } from './louisVuittonScraper';
import { PradaScraper } from './pradaSraper';
import { ScraperInterface } from './scraperInterface';
import { YslScraper } from './yslScraper';
import winston from 'winston';

/**
 * Supported scraper types
 */
export enum ScraperType {
  YSL = 'ysl',
  LouisVuitton = 'lv',
  Hermes = 'hermes',
  Cartier = 'cartier',
  Prada = 'prada',
  Chanel = 'chanel',
  Dior = 'dior',
  Alaia = 'alaia',
  McQueen = 'mcqueen',
  Balenciaga = 'balenciaga',
  Bvlgari = 'bvlgari',
}

/**
 * Base options for input of scrapers
 */
export type ScraperOptions = {
  browser: BrowserInterface;
  paginationStart: number;
  logger: winston.Logger;
};

/**
 * Factory to abstract which [[ScraperInterface]] is associated with a [[ScraperType]]
 */
export class ScraperFactory {
  private scraperMapping: { [key: string]: ScraperInterface } = {};

  constructor(browser: BrowserInterface, logger: winston.Logger) {
    const scraperOptions: ScraperOptions = {
      browser: browser,
      paginationStart: 50,
      logger: logger,
    };
    this.scraperMapping[ScraperType.Alaia] = new AlaiaScraper(scraperOptions);
    this.scraperMapping[ScraperType.Cartier] = new CartierScraper(
      scraperOptions,
    );
    this.scraperMapping[ScraperType.Chanel] = new ChanelScraper(scraperOptions);
    this.scraperMapping[ScraperType.Hermes] = new HermesScraper(scraperOptions);
    this.scraperMapping[ScraperType.LouisVuitton] = new LouisVuittonScraper(
      scraperOptions,
    );
    this.scraperMapping[ScraperType.Prada] = new PradaScraper(scraperOptions);
    this.scraperMapping[ScraperType.YSL] = new YslScraper(scraperOptions);
    this.scraperMapping[ScraperType.Dior] = new ChirstianDiorScraper(
      scraperOptions,
    );
    this.scraperMapping[ScraperType.McQueen] = new AlexanderMcQueenScraper(
      scraperOptions,
    );
    this.scraperMapping[ScraperType.Balenciaga] = new BalenciagaScraper(
      scraperOptions,
    );
    this.scraperMapping[ScraperType.Bvlgari] = new BvlgariScraper(
      scraperOptions,
    );
  }

  /**
   * Gets [[ScraperInterface]] for given [[ScraperType]]
   * @param scraperType which scraper to retrieve
   * @returns class object to use for scraping
   */
  async getScraper(scraperType: ScraperType): Promise<ScraperInterface> {
    return this.scraperMapping[scraperType];
  }
}
