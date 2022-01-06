import { ProductDimensions } from 'src/modules/exporter/exporterInterface';
import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class CartierSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      productName: { extractionField: 'name' },
      sku: { extractionField: 'sku' },
      brand: { extractionField: 'brand.name' },
      category: { extractionField: 'products.0.category' },
      description: { extractionField: 'description' },
      imageUrl: { extractionField: 'image.0' },
      retailPrice: { extractionField: 'offers.price' },
      dimensions: {
        template: (args: { [key: string]: string }): ProductDimensions => {
          const regexMatcher = /([0-9]+) (cm|mm){1} (high|long|deep)/gm;
          const dimensions: ProductDimensions = {};
          let match = regexMatcher.exec(args.longDescription);
          while (match != null) {
            if (match[3] == 'deep') {
              dimensions.depth = match[1];
            } else if (match[3] == 'long') {
              dimensions.width = match[1];
              dimensions.units = match[2];
            } else if (match[3] == 'high') {
              dimensions.height = match[1];
            }
            match = regexMatcher.exec(args.longDescription);
          }
          return dimensions;
        },
        templateArgs: {
          longDescription: { extractionField: 'longDescription' },
        },
      },
    };
  }
}
