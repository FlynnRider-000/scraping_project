import fs from 'fs';
import winston from 'winston';
import { ExporterInterface, ProductRecord } from './exporterInterface';

export class FileExporter implements ExporterInterface {
  private directory: string;
  private records: any[];
  private logger: winston.Logger;

  constructor(directory: string, logger: winston.Logger) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    this.directory = directory;
    this.logger = logger.child({ class: FileExporter });
    this.records = [];
  }

  async exportProductRecords(records: ProductRecord[]): Promise<void> {
    this.records.push(...records);
  }

  async close(path: string): Promise<void> {
    fs.writeFile(
      `${this.directory}/${path}`,
      JSON.stringify(this.records),
      (err) => {
        if (err) {
          this.logger.error('Failed to write to file', err, {
            directory: this.directory,
            path,
            numberOfRecords: this.records.length,
          });
        }
      },
    );
  }
}
