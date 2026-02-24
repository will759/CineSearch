import { useState, useEffect } from 'react';
import type { Movie, MovieFilterRequest } from './types/movie';
import { useMovieSearch } from './hooks/useMovieSearch';
import './App.css';

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  const pct = (rating / 10) * 100;
  return (
    <div className="star-rating" title={`${rating}/10`}>
      <span className="stars-bg">★★★★★</span>
      <span className="stars-fill" style={{ width: `${pct}%` }}>★★★★★</span>
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="movie-card" onClick={onClick} tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="card-poster">
        {!imgError ? (
          <img src={movie.posterUrl} alt={movie.title} loading="lazy"
            onError={() => setImgError(true)} />
        ) : (
          <div className="poster-fallback">
            <span>🎬</span>
            <p>{movie.title}</p>
          </div>
        )}
        <div className="card-overlay">
          <span className="genre-pill">{movie.genre}</span>
          <button className="play-btn">▶</button>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{movie.title}</h3>
        <div className="card-meta">
          <span className="year">{movie.year}</span>
          <span className="dot">·</span>
          <span className="lang">{movie.language}</span>
        </div>
        <StarRating rating={movie.rating} />
      </div>
    </article>
  );
}

// ─── Movie Detail Modal ───────────────────────────────────────────────────────
function MovieModal({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-inner">
          <div className="modal-poster">
            <img src={movie.posterUrl} alt={movie.title}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="modal-info">
            <span className="genre-pill">{movie.genre}</span>
            <h2 className="modal-title">{movie.title}</h2>
            <div className="modal-meta">
              <span>{movie.year}</span>
              <span>·</span>
              <span>{movie.language}</span>
            </div>
            <StarRating rating={movie.rating} />
            <p className="modal-director">Dir. {movie.director}</p>
            <p className="modal-desc">{movie.description}</p>
            <div className="modal-tags">
              <span className="tag">#{movie.genre.toLowerCase()}</span>
              <span className="tag">#{movie.year}s</span>
              <span className="tag">#{movie.language.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────
interface FiltersProps {
  filter: MovieFilterRequest;
  genres: string[];
  onChange: (updates: Partial<MovieFilterRequest>) => void;
}

function FiltersBar({ filter, genres, onChange }: FiltersProps) {
  return (
    <div className="filters-bar">
      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search title, director..."
          value={filter.query ?? ''}
          onChange={e => onChange({ query: e.target.value })}
        />
        {filter.query && (
          <button className="clear-btn" onClick={() => onChange({ query: '' })}>✕</button>
        )}
      </div>

      {/* Genre */}
      <select className="select" value={filter.genre ?? 'All'}
        onChange={e => onChange({ genre: e.target.value })}>
        {genres.map(g => <option key={g}>{g}</option>)}
      </select>

      {/* Min rating */}
      <select className="select" value={filter.minRating ?? ''}
        onChange={e => onChange({ minRating: e.target.value ? Number(e.target.value) : undefined })}>
        <option value="">Any rating</option>
        {[7, 7.5, 8, 8.5, 9].map(r => (
          <option key={r} value={r}>★ {r}+</option>
        ))}
      </select>

      {/* Sort */}
      <select className="select" value={`${filter.sortBy}-${filter.sortOrder}`}
        onChange={e => {
          const [sortBy, sortOrder] = e.target.value.split('-') as [MovieFilterRequest['sortBy'], MovieFilterRequest['sortOrder']];
          onChange({ sortBy, sortOrder });
        }}>
        <option value="rating-desc">Rating ↓</option>
        <option value="rating-asc">Rating ↑</option>
        <option value="year-desc">Newest</option>
        <option value="year-asc">Oldest</option>
        <option value="title-asc">Title A→Z</option>
        <option value="title-desc">Title Z→A</option>
      </select>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: {
  page: number; totalPages: number; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>←</button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="ellipsis">…</span>
        ) : (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPage(p as number)}>{p}</button>
        )
      )}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>→</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { data, genres, loading, error, filter, setFilter, goToPage, selectedMovie, selectMovie } = useMovieSearch();

  return (
    <div className="app">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">CineSearch</span>
          </div>
          <p className="header-sub">
            {data ? (
              <>{data.totalCount} films · page {data.page}/{data.totalPages}</>
            ) : 'Movie Search App'}
          </p>
        </div>
      </header>

      <main className="main">
        <FiltersBar filter={filter} genres={genres} onChange={setFilter} />

        {/* States */}
        {error && (
          <div className="state-box error">
            <span>⚠</span>
            <div>
              <strong>API Error</strong>
              <p>{error}</p>
              <small>Make sure the C# backend is running on port 5000</small>
            </div>
          </div>
        )}

        {loading && (
          <div className="state-box loading">
            <div className="spinner" />
            <span>Searching movies…</span>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="state-box empty">
            <span className="empty-icon">🎬</span>
            <strong>No movies found</strong>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {/* Grid */}
        {!loading && data && data.items.length > 0 && (
          <>
            <div className="movie-grid">
              {data.items.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={() => selectMovie(movie)} />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onPage={goToPage} />
          </>
        )}
      </main>

      {/* Modal */}
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => selectMovie(null)} />}
    </div>
  );
}
