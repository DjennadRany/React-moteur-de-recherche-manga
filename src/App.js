// App.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import MangaList from './components/MangaList';
import FilterBar from './components/FilterBar';
import DiscoverSections from './components/DiscoverSections';
import AnimeDetailPage from './pages/AnimeDetailPage';
import './App.css';

const PAGE_LIMIT = 12;
const FAVORITES_STORAGE_KEY = 'manga_favorites';

const getYearFromAired = (manga) => {
  const from = manga?.aired?.from;
  if (!from || typeof from !== 'string') {
    return '';
  }
  const year = from.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
};

const mergeById = (current, next) => {
  const seen = new Set(current.map((item) => item.mal_id));
  const merged = [...current];
  next.forEach((item) => {
    if (!seen.has(item.mal_id)) {
      merged.push(item);
    }
  });
  return merged;
};

const App = () => {
  const [mangaResults, setMangaResults] = useState([]);
  const [filters, setFilters] = useState({ genre: '', year: '' });
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('all');

  const abortRef = useRef(null);
  const retryRef = useRef(false);
  const hasSearchedRef = useRef(false);
  const prevFiltersRef = useRef(filters);
  const hasFetchedRef = useRef(false);

  const buildYears = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1980;
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => currentYear - index);
  }, []);

  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch (parseError) {
        console.error('Failed to parse favorites:', parseError);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const fetchGenres = useCallback(async () => {
    try {
      const genresResponse = await axios.get('https://api.jikan.moe/v4/genres/anime');
      setGenres(genresResponse.data.data);
    } catch (fetchError) {
      console.error('Error fetching genres:', fetchError);
    }
  }, []);

  const searchManga = useCallback(
    async (searchQuery, nextPage = 1, options = {}) => {
      const { append = false, explicit = false } = options;
      const trimmedQuery = searchQuery.trim();
      const shouldSearchEmpty = explicit || trimmedQuery !== '' || hasSearchedRef.current;

      if (!shouldSearchEmpty) {
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError('');
      setRateLimitMessage('');

      try {
        const params = new URLSearchParams();
        params.set('q', trimmedQuery);
        params.set('page', String(nextPage));
        params.set('limit', String(PAGE_LIMIT));
        if (filters.genre) {
          params.set('genres', filters.genre);
        }

        const response = await axios.get(
          `https://api.jikan.moe/v4/anime?${params.toString()}`,
          { signal: controller.signal }
        );

        const items = response.data.data || [];
        const pagination = response.data.pagination || {};

        setMangaResults((prev) => (append ? mergeById(prev, items) : items));
        setHasNextPage(Boolean(pagination.has_next_page));
        setPage(nextPage);
        hasSearchedRef.current = true;
        retryRef.current = false;
      } catch (searchError) {
        if (searchError.code === 'ERR_CANCELED') {
          return;
        }

        if (searchError.response?.status === 429 && !retryRef.current) {
          retryRef.current = true;
          setRateLimitMessage('Rate limit, retrying in 5s...');
          setTimeout(() => {
            searchManga(searchQuery, nextPage, { append, explicit: true });
          }, 5000);
          return;
        }

        setError('Une erreur est survenue. Merci de réessayer.');
      } finally {
        setLoading(false);
      }
    },
    [filters.genre]
  );

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchGenres();
    setYears(buildYears());
  }, [buildYears, fetchGenres]);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasChanged = prev.genre !== filters.genre || prev.year !== filters.year;
    if (!hasChanged) {
      return;
    }
    prevFiltersRef.current = filters;
    setPage(1);
    if (query.trim() === '' && !hasSearchedRef.current) {
      return;
    }
    searchManga(query, 1, { explicit: true });
  }, [filters, query, searchManga]);

  const visibleMangas = useMemo(() => {
    const filteredByYear = mangaResults.filter((manga) => {
      if (!filters.year) {
        return true;
      }
      return getYearFromAired(manga) === String(filters.year);
    });

    const filteredByFavorites =
      viewMode === 'favorites'
        ? filteredByYear.filter((manga) => favoritesSet.has(manga.mal_id))
        : filteredByYear;

    return [...filteredByFavorites].sort((a, b) =>
      (b.aired?.from || '').localeCompare(a.aired?.from || '')
    );
  }, [mangaResults, filters.year, viewMode, favoritesSet]);

  const handleSearch = (searchQuery, options = {}) => {
    setPage(1);
    searchManga(searchQuery, 1, {
      ...options,
      explicit: options.explicit ?? true,
    });
  };

  const handleLoadMore = () => {
    if (loading || !hasNextPage) {
      return;
    }
    searchManga(query, page + 1, { append: true, explicit: true });
  };

  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const emptyMessage =
    !query.trim() && !hasSearchedRef.current
      ? 'Recherchez un anime pour commencer.'
      : viewMode === 'favorites'
      ? 'Aucun favori pour le moment.'
      : query.trim()
      ? `Aucun résultat pour "${query}".`
      : 'Aucun résultat.';

  const showDiscover = !query.trim() && !hasSearchedRef.current;

  const HomePage = () => (
    <div className="appShell">
      <header className="page-header">
        <div className="brand-bar">
          <img
            src={`${process.env.PUBLIC_URL}/Logo_OtakuDek.png`}
            alt="OtakuDek"
            className="brand-logo"
          />
          <h1 className="brand-title">OtakuDex</h1>
        </div>
        <p className="brandTagline">Le Pokedex moderne des animes.</p>
      </header>

      <div className="view-toggle" role="tablist" aria-label="Basculer l'affichage">
        <button
          type="button"
          className={`view-toggle__button ${viewMode === 'all' ? 'is-active' : ''}`}
          onClick={() => setViewMode('all')}
          role="tab"
          aria-selected={viewMode === 'all'}
        >
          Tous
        </button>
        <button
          type="button"
          className={`view-toggle__button ${viewMode === 'favorites' ? 'is-active' : ''}`}
          onClick={() => setViewMode('favorites')}
          role="tab"
          aria-selected={viewMode === 'favorites'}
        >
          Favoris
        </button>
      </div>

      <SearchBar query={query} onQueryChange={setQuery} onSearch={handleSearch} />

      <FilterBar
        filters={filters}
        genres={genres}
        years={years}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onApplyFilter={() => handleSearch(query)}
        onClearFilters={() => setFilters({ genre: '', year: '' })}
      />

      {rateLimitMessage && (
        <div className="status-banner" role="status" aria-live="polite">
          {rateLimitMessage}
        </div>
      )}

      {error && (
        <div className="error-state" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="ghost-button btn btnGhost"
            onClick={() => handleSearch(query)}
          >
            Réessayer
          </button>
        </div>
      )}

      {showDiscover ? (
        <DiscoverSections favoritesSet={favoritesSet} onToggleFavorite={handleToggleFavorite} />
      ) : (
        <MangaList
          mangas={visibleMangas}
          onToggleFavorite={handleToggleFavorite}
          favoritesSet={favoritesSet}
          isLoading={loading}
          emptyMessage={emptyMessage}
        />
      )}

      {!loading && !error && hasNextPage && (
        <div className="load-more">
          <button type="button" className="primary-button btn btnPrimary" onClick={handleLoadMore}>
            Charger plus
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/anime/:id"
        element={
          <AnimeDetailPage favoritesSet={favoritesSet} onToggleFavorite={handleToggleFavorite} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
