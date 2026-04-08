export interface PageResponse<T> {
  content: T[];
  total_elements: number;
  total_pages: number;
  number: number;
  size: number;
  last: boolean;
}
