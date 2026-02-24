import type { Movie, MovieFilterRequest, PagedResult } from '../types/movie';

// Aponta para o backend C# 
const BASE_URL = 'http://localhost:5000';

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const movieApi = {
  async searchMovies(filter: MovieFilterRequest): Promise<PagedResult<Movie>> {
    const qs = buildQueryString(filter as Record<string, unknown>);
    return apiFetch<PagedResult<Movie>>(`${BASE_URL}/api/movies?${qs}`);
  },

  async getGenres(): Promise<string[]> {
    return apiFetch<string[]>(`${BASE_URL}/api/movies/genres`);
  },
};
