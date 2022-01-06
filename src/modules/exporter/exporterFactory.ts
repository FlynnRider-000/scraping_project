import { S3 } from '@aws-sdk/client-s3';
import winston from 'winston';
import { ApiExporter } from './apiExporter';
import { ExporterInterface } from './exporterInterface';
import { FileExporter } from './fileExporter';
import { S3Exporter } from './s3Exporter';

export enum ExporterTypes {
  s3 = 's3',
  file = 'file',
  api = 'api',
}

export type ExporterOptions = {
  outputBucket: string;
  outputPrefix?: string;
  s3Client?: S3;
  createBucketIfNotExists?: boolean;
  logger: winston.Logger;
  scrapingUser?: string;
};
export class ExporterFactory {
  static async getExporter(
    exporterType: ExporterTypes,
    options: ExporterOptions,
  ): Promise<ExporterInterface> {
    if (exporterType == ExporterTypes.s3) {
      return await S3Exporter.initialize(
        options.s3Client,
        options.outputBucket,
        options.outputPrefix,
        options.createBucketIfNotExists,
      );
    } else if (exporterType == ExporterTypes.file) {
      return new FileExporter(options.outputBucket, options.logger);
    } else if (exporterType == ExporterTypes.api) {
      if (!options.scrapingUser) {
        throw new Error('Missing options for API exporter');
      }
      return new ApiExporter(
        'http://localhost:4000/graphql',
        options.logger,
        options.scrapingUser,
      );
    }
    throw new Error('Unkonwn Exporter Type');
  }
}
