/**
 * Interface for exporting records
 */
export interface ExporterInterface {
  exportProductRecords(records: ProductRecord[]): Promise<void>;
  close(path?: string): Promise<void>;
}

/**
 * Record format for the exporter
 */
export type ProductRecord = {
  brand: string;
  productName: string;
  productLink?: string;
  sku: string;
  category: string;
  retailPrice: string;
  resalePrice: string;
  description?: string;
  subCategory?: string;
  variant?: string;
  dimensions: ProductDimensions;
  styleVariant?: string;
  materialVariant?: string;
  colorVariant?: string;
  collectionVariant?: string;
  sizeVariant?: string;
  imageUrl?: string;
  imageMediumURL?: string;
  imageSmallURL?: string;
  imageThumbnail?: string;
};

/**
 * Type for specifying available product dimensions
 */
export type ProductDimensions = {
  width?: string;
  height?: string;
  depth?: string;
  units?: string;
};

export type ProductRecordKeys = keyof ProductRecord;
