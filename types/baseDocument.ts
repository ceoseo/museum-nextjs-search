export interface BaseDocument {
  type: string;
  url?: string;
  id: number;
  title?: string;
  description?: string;
  searchText?: string;
  keywords?: string;
  boostedKeywords?: string;
  constituents?: string[];
  imageUrl?: string;
  imageThumbnailUrl?: string;
  imageAlt?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}
