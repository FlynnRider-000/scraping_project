export class ScraperUtils {
  public static updateQueryParameter(
    url: string,
    updatedParams: { [key: string]: string },
  ): string {
    const query = new RestUtils(url);
    return query.getUrlWithUpdatedParameters(updatedParams);
  }

  public static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
export class RestUtils {
  private readonly baseUrl: string;
  private readonly queryDict: { [key: string]: string } = {};

  constructor(url: string) {
    const urlParts = url.split('?');

    this.baseUrl = urlParts[0];
    const queryParams = urlParts[1];
    if (queryParams) {
      const queryPairs = queryParams.split('&');
      for (const pair of queryPairs) {
        const [key, value] = pair.split('=');
        this.queryDict[key] = value;
      }
    }
  }

  public getUrlWithUpdatedParameters(updatedParams: { [key: string]: string }) {
    let allItemsUrl = `${this.baseUrl}?`;
    Object.entries(this.queryDict).forEach((entry) => {
      const [key, value] = entry;
      allItemsUrl = `${allItemsUrl}${key}=${
        updatedParams[key] ? updatedParams[key] : value
      }&`;
    });
    Object.entries(updatedParams).forEach((entry) => {
      const [key, value] = entry;
      if (!this.queryDict[key]) {
        allItemsUrl = `${allItemsUrl}${key}=${value}&`;
      }
    });
    return allItemsUrl;
  }

  public getBaseQueryParameter(key: string): string {
    return this.queryDict[key];
  }
}

export class RetryUtils {
  public static retryWithDelay<T>(
    method: () => T,
    errorHandler?: (e: unknown) => void,
    retries = 3,
    backOffMs = 1000,
  ): T {
    let lastError: unknown = undefined;
    let tries = 0;
    while (tries++ < retries) {
      try {
        return method();
      } catch (e) {
        if (errorHandler) {
          errorHandler(e);
        }
        if (tries != retries) {
          ScraperUtils.delay(backOffMs);
        }
        lastError = e;
      }
    }
    throw lastError;
  }
}
