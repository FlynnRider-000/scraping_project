import { ExporterInterface, ProductRecord } from './exporterInterface';
import { GraphQLClient, gql } from 'graphql-request';
import winston from 'winston';

export class ApiExporter implements ExporterInterface {
  private client: GraphQLClient;
  private mutation = gql`
    mutation addProductCatalogRecords(
      $records: [RegisterProductCatalogInput!]!
    ) {
      registerProductCatalog(input: $records) {
        __typename
        ... on RegisterProductCatalogMutationSuccess {
          status
        }
        ... on OptionalInputUnionError {
          keys
          id
        }
        ... on ValueNotExistError {
          id
          message
          values
        }
      }
    }
  `;
  constructor(
    endpointUrl: string,
    private logger: winston.Logger,
    scrapingUser: string,
  ) {
    this.client = new GraphQLClient(endpointUrl, {
      headers: {
        'backoffice-auth': scrapingUser,
      },
    });
  }

  async exportProductRecords(records: ProductRecord[]): Promise<void> {
    const formattedRecords = records.map((e) => {
      return {
        brand: e.brand,
        productName: e.productName,
        sku: e.sku,
        category: e.category,
        subCategory: e.subCategory || '',
        resalePrice: (e.resalePrice || '').toString(),
        retailPrice: e.retailPrice.toString(),
        description: e.description,
        materialVariant: e.materialVariant,
        colorVariant: e.colorVariant,
        styleVariant: e.styleVariant,
        collectionVariant: e.collectionVariant,
        // imageUrl: e.imageUrl,
      };
    });
    const data = await this.client.request(this.mutation, {
      records: formattedRecords,
    });
    if (data.__typename != 'RegisterProductCatalogMutationSuccess') {
      this.logger.error('Failed to update via appreciate api', data);
    } else {
      this.logger.debug('Successfully uploaded records to appreciate backend', {
        ...data,
        numberOfRecords: formattedRecords.length,
      });
    }
  }

  async close(): Promise<void> {
    //pass
  }
}
