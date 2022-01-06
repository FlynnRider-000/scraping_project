import { ProductDimensions } from 'src/modules/exporter/exporterInterface';
import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class PradaSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      productName: { extractionField: 'catalogEntryView.0.englishName' },
      description: { extractionField: 'catalogEntryView.0.longDescription' },
      retailPrice: { extractionField: 'productInfo.price.0.value' },
      materialVariant: {
        extractionField: 'attributeDict.Material.values.0.value',
      },
      colorVariant: { extractionField: 'attributeDict.Color.values.0.value' },
      dimensions: {
        template: (args: { [key: string]: string }): ProductDimensions => {
          return {
            width: args.width,
            height: args.height,
            depth: args.length,
          };
        },
        templateArgs: {
          width: { extractionField: 'attributeDict.Width.values.0.value' },
          height: { extractionField: 'attributeDict.Height.values.0.value' },
          length: { extractionField: 'attributeDict.Length.values.0.value' },
        },
      },
      imageUrl: { extractionField: 'productInfo.fullImage_ovr' },
    };
  }
}
