/**
 * BrowserInterace abstracts the way we interact with webpages
 */
export interface BrowserInterface {
  /**
   * navigatePage method gives us the ability to retrieve a url for a given page
   * @param url : link to pull up
   * @param pageIdentifier : page that is directed to the url
   */
  navigatePage(url: string, pageIdentifier?: string): Promise<string>;

  /**
   * findByXpath returns a list of elements that match a given xpath on a page
   * @param xpath : xpath query string
   * @param pageIdentifier : page to query
   */
  findByXpath(
    xpath: string,
    pageIdentifier?: string,
  ): Promise<BrowserElement[]>;

  /**
   * extract<T> extracts values of type<T> from given page
   * @param extractFunction : Either a string or function to be evaluated that will return type<T>
   * @param xpath : Optional xpath to reduce elements being evaluated
   * @param pageIdentifier - page to extract from
   */
  extract<T>(
    extractFunction: BrowserExtractionFunctionType<T> | string,
    xpath?: string,
    pageIdentifier?: string,
  ): Promise<T>;

  /**
   * errorHandler runs any browser specific logic when an error occurs
   */
  errorHandler(): Promise<void>;

  /**
   * close ends the session
   */
  close(): Promise<void>;

  /**
   * getCookies returns a cookie string for a given page
   * @param pageIdentifier : page
   * @returns all cookies as a string
   */
  getCookies(pageIdentifier?: string): Promise<string>;
}

/**
 * BrowserElement wraps elements found on a page
 */
export interface BrowserElement {
  /**
   * get attribute from browser element
   * @param attr attribute name
   */
  getAttribute(attr: string): Promise<string | undefined>;
  /**
   * get the text content of a browser element
   */
  getText(): Promise<string | undefined>;
}

/**
 * browser extraction input. Matching the input for puppetteer evaluate
 */
export type BrowserExtractionFunctionType<T> =
  | string
  | ((arg1: T, ...args: any[]) => T);

/**
 * Expected page does not already exist
 */
export class NoPageFoundError extends Error {}
