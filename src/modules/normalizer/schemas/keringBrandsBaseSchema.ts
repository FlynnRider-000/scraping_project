import { ProductDimensions } from '../../exporter/exporterInterface';
import { NormalizerSchema } from '../jsonNormalizer';
import { SchemaInterface } from './schemaInterface';
import { SchemaUtils } from './utils';

export class KeringBrandsBaseSchema implements SchemaInterface {
  async getSchema(): Promise<NormalizerSchema> {
    return {
      retailPrice: { extractionField: 'product.price.sales.value' },
      brand: { extractionField: 'product.brand' },
      productName: {
        template: (args: { [key: string]: string }): string => {
          return SchemaUtils.removeExtraDescriptionsFromString(
            args.productName,
          );
        },
        templateArgs: {
          productName: { extractionField: 'product.productName' },
        },
      },
      category: {
        template: (args: { [key: string]: string }): string => {
          const baseCategoryParts = args.category.split('_');
          return SchemaUtils.applySimpleReplacements(
            baseCategoryParts.slice(2).join(' '),
          );
        },
        templateArgs: {
          category: {
            extractionField: 'exposedData.gtm.product.macroCategory',
          },
        },
      },
      subCategory: {
        template: (args: { [key: string]: string }): string => {
          const baseCategoryParts = args.category.split('_');
          return SchemaUtils.applySimpleReplacements(
            baseCategoryParts.slice(2).join(' '),
          );
        },
        templateArgs: {
          category: {
            extractionField: 'exposedData.gtm.product.microCategory',
          },
        },
      },
      dimensions: {
        template: (args: { [key: string]: string[] }): ProductDimensions => {
          if (!args.descriptions) {
            return {};
          }
          for (const description of args.descriptions) {
            if (description.startsWith('Dimensions')) {
              const descriptionParts = description.split(' ');
              const [width, height, depth] = [
                descriptionParts[1],
                descriptionParts[3],
                descriptionParts[5],
              ];
              const units = descriptionParts[6];
              return {
                width,
                height,
                depth,
                units,
              };
            }
          }
          return {};
        },
        templateArgs: {
          descriptions: { extractionField: 'product.shortDescriptionList' },
        },
      },
      sku: { extractionField: 'product.productSMC' },
      description: { extractionField: 'product.longDescription' },
      materialVariant: { extractionField: 'exposedData.gtm.product.material' },
      colorVariant: { extractionField: 'exposedData.gtm.product.color' },
      sizeVariant: { extractionField: 'exposedData.gtm.product.size' },
      imageUrl: {
        extractionField: 'product.akeneoImages.packshot.0.large',
      },
      imageMediumURL: {
        extractionField: 'product.akeneoImages.packshot.0.medium',
      },
      imageSmallURL: {
        extractionField: 'product.akeneoImages.packshot.0.small',
      },
      imageThumbnail: {
        extractionField: 'product.akeneoImages.packshot.0.thumbnail',
      },
    };
  }
}
