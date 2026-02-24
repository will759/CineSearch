import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, MovieFilterRequest, PagedResult } from '../types/movie';
import { movieApi } from '../services/movieApi';

interface UseMovieSearchReturn {
  data: PagedResult<Movie> | null;
  genres: string[];
  loading: boolean;
  error: string | null;
  filter: MovieFilterRequest;
  setFilter: (updates: Partial<MovieFilterRequest>) => void;
  goToPage: (page: number) => void;
  selectedMovie: Movie | null;
  selectMovie: (movie: Movie | null) => void;
}

const DEFAULT_FILTER: MovieFilterRequest = {
  query: '',
  genre: 'All',
  page: 1,
  pageSize: 20,
};

export function useMovieSearch(): UseMovieSearchReturn {
  const [data, setData]               = useState<PagedResult<Movie> | null>(null);
  const [genres, setGenres]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [filter, setFilterState]      = useState<MovieFilterRequest>(DEFAULT_FILTER);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega gêneros uma vez
  useEffect(() => {
    movieApi.getGenres()
      .then(g => setGenres(['All', ...g]))
      .catch(() => setGenres(['All']));
  }, []);

  // Busca com debounce
  const performSearch = useCallback((f: MovieFilterRequest) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await movieApi.searchMovies(f);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movies');
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Re-busca quando filtro muda
  useEffect(() => {
    performSearch(filter);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filter, performSearch]);

  const setFilter = useCallback((updates: Partial<MovieFilterRequest>) => {
    setFilterState(prev => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilterState(prev => ({ ...prev, page }));
  }, []);

  return {
    data,
    genres,
    loading,
    error,
    filter,
    setFilter,
    goToPage,
    selectedMovie,
    selectMovie: setSelectedMovie,
  };
}