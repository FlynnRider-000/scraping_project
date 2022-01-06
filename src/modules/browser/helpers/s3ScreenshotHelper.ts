import { S3 } from '@aws-sdk/client-s3';

/**
 * Helper class to encapsulate logic for uploading a screenshot buffer into s3
 */
export class S3ScreenshotHelper {
  constructor(
    private readonly s3Cleint: S3,
    private readonly bucket: string,
    private readonly keyPrefix: string,
  ) {}

  async saveScreenshot(
    buffer: string | Buffer,
    pageIdentifier: string,
  ): Promise<void> {
    await this.s3Cleint.putObject({
      Bucket: this.bucket,
      Key: `${this.keyPrefix}-${pageIdentifier}.png`,
      Body: buffer,
    });
  }
}
