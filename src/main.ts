import { ServiceConfiguration } from './configuration';
import { scrapeBrand } from './index';

(async () => {
  const config = new ServiceConfiguration();
  const configKey = process.env.BRAND_TO_SCRAPE || '';
  await scrapeBrand(config.getKnownConfiguration(configKey));
})();
