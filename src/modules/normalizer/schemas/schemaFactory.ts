import { ScraperType } from '../../scraper/scraperFactory';
import { NormalizerSchema } from '../jsonNormalizer';
import { AlaiaSchema } from './alaiaSchema';
import { KeringBrandsBaseSchema } from './keringBrandsBaseSchema';
import { CartierSchema } from './cartierSchema';
import { ChanelSchema } from './chanelSchema';
import { ChristianDiorSchema } from './christianDiorSchema';
import { LouisVuittonSchema } from './louisVuittonSchema';
import { PradaSchema } from './pradaSchema';
import { SchemaInterface } from './schemaInterface';
import { BvlgariSchema } from './bvlgariSchema';

/**
 * Factory to abstract which [[NormalizerSchema]] is being utilized at runtime
 */
export class SchemaFactory {
  private scraperTypeToSchema: { [key: string]: SchemaInterface } = {};

  constructor() {
    this.scraperTypeToSchema[ScraperType.YSL] = new KeringBrandsBaseSchema();
    this.scraperTypeToSchema[ScraperType.Cartier] = new CartierSchema();
    this.scraperTypeToSchema[ScraperType.LouisVuitton] =
      new LouisVuittonSchema();
    this.scraperTypeToSchema[ScraperType.Prada] = new PradaSchema();
    this.scraperTypeToSchema[ScraperType.Chanel] = new ChanelSchema();
    this.scraperTypeToSchema[ScraperType.Dior] = new ChristianDiorSchema();
    this.scraperTypeToSchema[ScraperType.Alaia] = new AlaiaSchema();
    this.scraperTypeToSchema[ScraperType.McQueen] =
      new KeringBrandsBaseSchema();
    this.scraperTypeToSchema[ScraperType.Balenciaga] =
      new KeringBrandsBaseSchema();
    this.scraperTypeToSchema[ScraperType.Bvlgari] = new BvlgariSchema();
  }

  /**
   * Factory method to retrieve schema for a scraper
   * @param scraperType scraper type used to determine which [[SchemaInterface]] to use
   * @returns Schema associated with [[ScraperType]]
   */
  public async getSchema(scraperType: ScraperType): Promise<NormalizerSchema> {
    return await this.scraperTypeToSchema[scraperType].getSchema();
  }
}
