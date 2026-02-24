export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  director: string;
  description: string;
  duration: number;
  posterUrl: string;
  language: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovieFilterRequest {
  query?: string;
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  sortBy?: 'title' | 'year' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
