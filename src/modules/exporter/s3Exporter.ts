import { ExporterInterface, ProductRecord } from './exporterInterface';
import { S3 } from '@aws-sdk/client-s3';

/**
 * S3 implenetation for [[ExporterInterface]]
 */
export class S3Exporter implements ExporterInterface {
  private records: ProductRecord[] = [];

  constructor(
    private s3Client: S3,
    private bucket: string,
    private s3Prefix?: string,
  ) {}

  async exportProductRecords(records: ProductRecord[]): Promise<void> {
    this.records.push(...records);
  }

  async close(path: string): Promise<void> {
    await this.s3Client.putObject({
      Bucket: this.bucket,
      Key: this.s3Prefix ? `${this.s3Prefix}/${path}` : path,
      Body: JSON.stringify(this.records),
    });
  }

  static async initialize(
    s3Client?: S3,
    bucket?: string,
    prefix?: string | undefined,
    productionMode?: boolean,
  ): Promise<S3Exporter> {
    if (!(s3Client && bucket)) {
      throw new Error('Missing required params for S3 Exporter');
    }
    if (!productionMode) {
      try {
        await s3Client.headBucket({ Bucket: bucket });
      } catch {
        await s3Client.createBucket({ Bucket: bucket });
      }
    }
    return new S3Exporter(s3Client, bucket, prefix);
  }
}
