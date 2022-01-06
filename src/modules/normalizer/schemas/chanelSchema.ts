import { ProductDimensions } from 'src/modules/exporter/exporterInterface';
import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class ChanelSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      productName: { extractionField: 'name' },
      description: { extractionField: 'description' },
      sku: { extractionField: 'code' },
      retailPrice: { extractionField: 'price' },
      colorVariant: { extractionField: 'color.name' },
      materialVariant: { extractionField: 'fabric.name' },
      imageUrl: {
        templateArgs: {
          baseUrl: { extractionField: 'imageData.baseUrl' },
          path: { extractionField: 'imageData.path' },
        },
        template: (args: { [key: string]: string }) => {
          return `${args.baseUrl}${args.path}`;
        },
      },
      dimensions: {
        templateArgs: {
          dimensions: { extractionField: 'dimensions' },
        },
        template: (args: { [key: string]: string }): ProductDimensions => {
          const productDimensions: ProductDimensions = {};
          if (args.dimensions) {
            const parts = args.dimensions.split(' ');
            (productDimensions.height = parts[0]),
              (productDimensions.width = parts[2]);
            productDimensions.depth = parts[4];
            productDimensions.units = parts[5];
          }
          return productDimensions;
        },
      },
    };
  }
}
