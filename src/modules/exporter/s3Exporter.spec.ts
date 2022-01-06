import { S3 } from '@aws-sdk/client-s3';
import { mockDeep } from 'jest-mock-extended';
import { ProductRecord } from './exporterInterface';
import { S3Exporter } from './s3Exporter';

describe('Testing S3 Exporter', () => {
  let mockS3: any & S3;
  let s3Exporter: S3Exporter;

  beforeEach(async () => {
    mockS3 = mockDeep<S3>();
    s3Exporter = new S3Exporter(mockS3, 'fake-bucket', 'fake-prefix');
  });

  it('records get added to running list during exportProductRecords', async () => {
    const fakeRecords: ProductRecord[] = [
      {
        productName: 'fakeProduct',
        brand: 'fakeBrand',
        sku: 'asdfasd',
        category: 'handbags',
        retailPrice: '$1234',
        resalePrice: '',
        dimensions: {},
      },
    ];
    await s3Exporter.exportProductRecords(fakeRecords);
    await s3Exporter.close('output.json');
    expect(mockS3.putObject).toBeCalledWith({
      Bucket: 'fake-bucket',
      Key: 'fake-prefix/output.json',
      Body: JSON.stringify(fakeRecords),
    });
  });
});
