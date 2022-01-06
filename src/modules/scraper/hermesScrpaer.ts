// TODO: get around bot protection
import { ScraperInterface } from './scraperInterface';
import axios from 'axios';
import { BrowserInterface } from '../browser/browserInterface';
import { ScraperOptions } from './scraperFactory';
import winston from 'winston';

/**
 * Hermes scraper is not operational. Do not use
 */
export class HermesScraper implements ScraperInterface {
  private browser: BrowserInterface;
  private logger: winston.Logger;

  constructor(options: ScraperOptions) {
    this.browser = options.browser;
    this.logger = options.logger.child({ class: 'HermesScraper' });
  }

  async scrapeSeed(seed: string): Promise<any[]> {
    await this.browser.navigatePage(seed);
    await this.browser.errorHandler();
    const cookies = await this.browser.getCookies();
    const response = await axios.get<any>(
      'https://bck.hermes.com/product?locale=us_en&productsku=H202202Z%252002350',
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          // Cookie: 'datadome=74cJ2zQr-Kqbahm1SaVnblmx0QS1wK50DzpZxX44ITlVDYD0ujmvryxMBwRvawnwapPiDIWJEThxncjzQVgrwIwK.OjfGfp4NuErA8My2O',
          Cookie: cookies,
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
          Accept: 'application/json',
          Connection: 'keep-alive',
          DNT: '1',
          'Sec-GPC': '1',
          Origin: 'https://www.hermes.com',
        },
      },
    );
    this.logger.error('Response Data', { data: response.data });
    throw new Error();
  }
}
