import { scrapeBrand } from './index';
import { RetryUtils } from './modules/scraper/utils';
import { ServiceConfiguration } from './configuration';

(async () => {
  // calculate s3 prefix only once
  const today = new Date();
  const prefix = `${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getFullYear()}`;
  const configuration = new ServiceConfiguration();
  const keys = configuration.getKnownConifgurationIds();
  // const promises: Promise<void>[] =[]
  for (const key of keys) {
    const config = {
      ...configuration.getKnownConfiguration(key),
      outputPrefix: prefix,
    };
    const brandHandler = async () => {
      await scrapeBrand(config);
    };
    try {
      await RetryUtils.retryWithDelay<Promise<void>>(brandHandler, (e) => {
        console.log(`Failed to scrape ${config.scraperType}`, e);
      });
    } catch (e) {
      console.log(`Finished retrying ${config.scraperType}`, e);
    }
  }
  // Promise.all(promises)
})();
