import { RuntimeOptions } from 'src';
import { ExporterTypes } from './modules/exporter/exporterFactory';
import { ScraperType } from './modules/scraper/scraperFactory';

export class ServiceConfiguration {
  private baseConfig: RuntimeOptions;
  private static knownConfigurations: { [key: string]: RuntimeOptions } = {
    alaia: {
      seed: 'https://www.maison-alaia.com/us/shop/women/bags',
      scraperType: 'alaia' as ScraperType,
      outputFileName: 'alaia_bags.json',
      headlessMode: false,
    },
    prada: {
      seed: 'https://www.prada.com/us/en/women/bags.html',
      scraperType: 'prada' as ScraperType,
      outputFileName: 'prada_bags.json',
      headlessMode: false,
    },
    cartier: {
      seed: 'http://www.cartier.com/en-us/art-of-living/bags',
      scraperType: 'cartier' as ScraperType,
      outputFileName: 'cartier_bags.json',
      headlessMode: false,
    },
    louisVuitton: {
      seed: 'https://us.louisvuitton.com/eng-us/women/handbags/all-handbags/_/N-mzlp5k',
      scraperType: 'lv' as ScraperType,
      outputFileName: 'lv_service.json',
    },
    chanel: {
      seed: 'https://www.chanel.com/us/yapi/axis/search?text=handbag&axis=fashion',
      scraperType: 'chanel' as ScraperType,
      outputFileName: 'chanel_bags.json',
    },
    dior: {
      seed: 'handbags',
      scraperType: ScraperType.Dior,
      outputFileName: 'dior_handbags.json',
    },
    ysl: {
      seed: 'https://www.ysl.com/en-us/shop-women/handbags/view-all',
      scraperType: ScraperType.YSL,
      outputFileName: 'ysl_service.json',
    },
    balenciaga: {
      seed: 'https://www.balenciaga.com/en-us/women/leather-goods/view-all-bags',
      scraperType: ScraperType.Balenciaga,
      outputFileName: 'balenciaga_service.json',
    },
    mcqueen: {
      seed: 'https://www.alexandermcqueen.com/en-us/women/handbags',
      scraperType: ScraperType.McQueen,
      outputFileName: 'mcqueen_bags.json',
    },
    bvlgari: {
      seed: 'https://www.bulgari.com/en-us/bags-and-accessories/womens',
      scraperType: ScraperType.Bvlgari,
      outputFileName: 'bvlagri_bags.json',
      headlessMode: false,
    },
  };

  constructor() {
    this.baseConfig = {
      createBucketIfNotExists:
        process.env.CREATE_BUCKET == 'true' ? true : false,
      outputBucket: process.env.S3_BUCKET,
      localstackUrl: process.env.AWS_ENDPOINT_URL,
      exporterType: process.env.EXPORTER_TYPE as ExporterTypes,
      useS3ScreenshotHelper:
        process.env.USE_SCREENSHOT_HELPER == 'true' ? true : false,
      scrapingUser: process.env.SCRAPING_USER,
      appreciateApi: process.env.APPRECIATE_API,
    };
  }

  getKnownConfiguration(knownConfig: string) {
    const savedConfig = ServiceConfiguration.knownConfigurations[knownConfig];
    if (!savedConfig) {
      throw new Error('Requested configuration is unknown');
    }
    return {
      ...this.baseConfig,
      ...savedConfig,
    };
  }

  getKnownConifgurationIds() {
    return Object.keys(ServiceConfiguration.knownConfigurations);
  }
}
