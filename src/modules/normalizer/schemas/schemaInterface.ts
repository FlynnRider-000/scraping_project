import { NormalizerSchema } from '../jsonNormalizer';

/**
 * Interface for retrieving schemas. Today everything is hard coded but we would love to move this to configuration
 */
export interface SchemaInterface {
  /**
   * @returns schema for converting schemaless scraper output to [[ProductRecord]]
   */
  getSchema(): Promise<NormalizerSchema>;
}
