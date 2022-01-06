import { ProductDimensions } from 'src/modules/exporter/exporterInterface';
import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class LouisVuittonSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      productName: { extractionField: 'name' },
      brand: { staticValue: 'Louis Vuitton' },
      dimensions: {
        template: (args: {
          [key: string]: string | number;
        }): ProductDimensions => {
          return {
            width: args.width?.toString(),
            depth: args.depth?.toString(),
            height: args.height?.toString(),
            units: args.units?.toString(),
          };
        },
        templateArgs: {
          width: { extractionField: 'width.value' },
          depth: { extractionField: 'depth.value' },
          height: { extractionField: 'height.value' },
          units: { extractionField: 'width.unitText' },
        },
      },
      retailPrice: { extractionField: 'offers.priceSpecification.price' },
      description: { extractionField: 'disambiguatingDescription' },
      sku: { extractionField: 'identifier' },
      category: { extractionField: 'category.1.name' },
      subCategory: { extractionField: 'category.2.name' },
      colorVariant: { extractionField: 'color' },
      materialVariant: { extractionField: 'material' },
      imageUrl: {
        template: (args: { [key: string]: string }): string => {
          return args.imageURL?.replace(' ', '%20')?.split('?')[0];
        },
        templateArgs: {
          imageURL: { extractionField: 'image.0.contentUrl' },
        },
      },
    };
  }
}
