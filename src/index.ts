import { S3 } from '@aws-sdk/client-s3';
import { S3ScreenshotHelper } from './modules/browser/helpers/s3ScreenshotHelper';
import { PuppeteerBrowser } from './modules/browser/puppeteerBrowser';
import { JsonNormalizer } from './modules/normalizer/jsonNormalizer';
import { SchemaFactory } from './modules/normalizer/schemas/schemaFactory';
import { ScraperFactory, ScraperType } from './modules/scraper/scraperFactory';
import { ScraperInterface } from './modules/scraper/scraperInterface';
import winston from 'winston';
import {
  ExporterFactory,
  ExporterTypes,
} from './modules/exporter/exporterFactory';

export type RuntimeOptions = {
  seed?: string;
  scraperType?: ScraperType;
  exporterType?: ExporterTypes;
  outputBucket?: string;
  outputFileName?: string;
  outputPrefix?: string;
  headlessMode?: boolean;
  localstackUrl?: string;
  createBucketIfNotExists?: boolean;
  useS3ScreenshotHelper?: boolean;
  appreciateApi?: string;
  scrapingUser?: string;
};

export const scrapeBrand = async (options: RuntimeOptions) => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'scraping-service.json',
        level: 'debug',
        options: { scraper: options.scraperType },
      }),
    ],
  });
  if (
    !options.seed ||
    !options.scraperType ||
    !options.exporterType ||
    !options.outputFileName ||
    !options.outputBucket
  ) {
    logger.error('Missing required configurations', { options });
    throw new Error('Missing required configuration');
  }
  let s3Client: S3 | undefined;
  let s3ScreenshotHelper: S3ScreenshotHelper | undefined;
  if (
    options.useS3ScreenshotHelper ||
    options.exporterType == ExporterTypes.s3
  ) {
    s3Client = new S3({
      endpoint: options.localstackUrl,
      region: 'us-east-1',
      forcePathStyle: true,
    });
    if (options.useS3ScreenshotHelper) {
      s3ScreenshotHelper = new S3ScreenshotHelper(
        s3Client,
        options.outputBucket,
        options.scraperType,
      );
    }
  }

  const headlessMode =
    options.headlessMode === undefined ? true : options.headlessMode;
  const browser = await PuppeteerBrowser.initialize(
    logger,
    headlessMode,
    s3ScreenshotHelper,
  );
  const scraperFactory = new ScraperFactory(browser, logger);
  const schemaFactory = new SchemaFactory();
  const scraper: ScraperInterface = await scraperFactory.getScraper(
    options.scraperType,
  );
  const exporter = await ExporterFactory.getExporter(options.exporterType, {
    outputBucket: options.outputBucket,
    outputPrefix: options.outputPrefix,
    s3Client: s3Client,
    logger: logger,
    createBucketIfNotExists: options.createBucketIfNotExists,
    scrapingUser: options.scrapingUser,
  });
  let error: unknown;
  try {
    logger.info(`Starting scraping for ${options.scraperType}`);
    const raw_records = await scraper.scrapeSeed(options.seed);
    logger.info(
      `Scraped ${raw_records.length} records for ${options.scraperType}`,
    );
    const records = await JsonNormalizer.transformToProductRecord(
      raw_records,
      await schemaFactory.getSchema(options.scraperType),
      logger.child({ class: 'JsonNormalizer' }),
    );
    await exporter.exportProductRecords(records);
    await exporter.close(options.outputFileName);
  } catch (e) {
    error = e;
    logger.error('Error caught while scraping', e, {
      seed: options.seed,
      scraper: options.scraperType,
    });
    await browser.errorHandler();
  } finally {
    await browser.close();
    if (error) {
      throw error;
    }
  }
};
