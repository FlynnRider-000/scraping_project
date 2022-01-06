import winston from 'winston';
import {
  ProductDimensions,
  ProductRecord,
  ProductRecordKeys,
} from '../exporter/exporterInterface';

/**
 * Type for mapping [[ProductRecordKeys]] to how we will normalize the input
 */
export type NormalizerSchema = {
  [K in ProductRecordKeys]?: NormalizeField<ProductRecord[K]>;
};

/**
 * For a given field expecting type [[T]], instructions on how to normalize it
 */
type NormalizeField<T> = {
  staticValue?: T;
  extractionField?: string;
  template?: (args: { [key: string]: any }) => T;
  templateArgs?: { [key: string]: NormalizeField<T> };
};

/**
 * Class with only static methods that will take in raw data and schema to return [[ProductRecord]]
 */
export class JsonNormalizer {
  /**
   * Static method used to transform raw data into expected format
   * @param rawProductsInfo raw data returned by scraper
   * @param schema The schema we will use to convert raw data to [[ProductRecord]]
   * @returns list of [[ProductRecord]]
   */
  public static async transformToProductRecord(
    rawProductsInfo: any[],
    schema: NormalizerSchema,
    logger: winston.Logger,
  ): Promise<ProductRecord[]> {
    const output_list: ProductRecord[] = [];
    rawProductsInfo.forEach((rawProductInfo) => {
      const output: { [key: string]: any } = {};
      Object.entries(schema).forEach((entry) => {
        const [key, value] = entry;
        output[key] = JsonNormalizer.normalizeField<
          string | undefined | ProductDimensions
        >(key, value, rawProductInfo, logger);
      });
      output_list.push(output as ProductRecord);
    });
    return output_list;
  }

  private static normalizeField<T>(
    key: string,
    field: NormalizeField<T>,
    rawProductInfo: any,
    logger: winston.Logger,
  ): T {
    if (field.staticValue != undefined) {
      return field.staticValue;
    }
    if (field.extractionField) {
      const parts = field.extractionField.split('.');
      let current = rawProductInfo;
      parts.forEach((part) => {
        if (current) {
          current = current[part];
        } else {
          logger.error('Unable to extract field', {
            key,
            current,
            extractionField: field.extractionField,
          });
        }
      });
      return current as T;
    }
    if (field.template) {
      const templateArgs: { [key: string]: T } = {};
      if (field.templateArgs) {
        Object.entries(field.templateArgs).forEach((entry) => {
          const [templateKey, templateValue] = entry;
          templateArgs[templateKey] = JsonNormalizer.normalizeField<T>(
            templateKey,
            templateValue,
            rawProductInfo,
            logger,
          );
        });
      }
      return field.template(templateArgs);
    }
    throw new Error();
  }
}
