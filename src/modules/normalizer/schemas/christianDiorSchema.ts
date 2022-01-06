import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';
import { SchemaUtils } from './utils';

export class ChristianDiorSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      brand: { staticValue: 'Dior' },
      productName: { extractionField: 'title' },
      description: { extractionField: 'description' },
      imageUrl: { extractionField: 'image' },
      sku: { extractionField: 'id' },
      category: {
        template: (args) => {
          return SchemaUtils.applySimpleReplacements(args.category);
        },
        templateArgs: { category: { extractionField: 'category_lvl1' } },
      },
      subCategory: {
        template: (args) => {
          return SchemaUtils.applySimpleReplacements(args.category);
        },
        templateArgs: { category: { extractionField: 'category_lvl2' } },
      },
      materialVariant: { extractionField: 'subtitle' },
      retailPrice: { extractionField: 'price.value' },
    };
  }
}
