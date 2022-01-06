import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';

export class BvlgariSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      brand: { staticValue: 'Bvlgari' },
      productName: { extractionField: 'product.productName' },
      productLink: { extractionField: 'productUrl' },
      sku: { extractionField: 'product.id' },
      retailPrice: { extractionField: 'product.price.sales.formatted' },
      materialVariant: {
        extractionField: 'product.bulgariTech.refinementMaterial.value',
      },
      colorVariant: {
        extractionField: 'product.bulgariTech.refinementColor.value',
      },
      sizeVariant: {
        extractionField: 'product.bulgariTech.size.value',
      },
      styleVariant: {
        extractionField: 'product.bulgariTech.accessories.value',
      },
      imageUrl: {
        extractionField: 'productImages.0.urlLarge',
      },
      imageMediumURL: {
        extractionField: 'productImages.0.urlMedium',
      },
      imageSmallURL: {
        extractionField: 'productImages.0.urlSmall',
      },
      imageThumbnail: {
        extractionField: 'productImages.0.cloudinaryThumbURL',
      },
    };
  }
}
