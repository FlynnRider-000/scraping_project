import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class AlaiaSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      brand: { extractionField: 'product_brand' },
      productName: { extractionField: 'product_title' },
      sku: { extractionField: 'product_cod10' },
      retailPrice: { extractionField: 'product_price' },
      category: { extractionField: 'product_macro_category' },
      subCategory: { extractionField: 'product_micro_category' },
      colorVariant: { extractionField: 'product_color' },
    };
  }
}
