import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './AppLayout';
import HomePage from '../pages/HomePage';
import AnimeDetailPage from '../pages/AnimeDetailPage';
import FavoritesPage from '../pages/FavoritesPage';
import AboutPage from '../pages/AboutPage';
import LegalPage from '../pages/LegalPage';
import PrivacyPage from '../pages/PrivacyPage';
import {
  fetchGenres,
  searchAnime,
} from '../services/animeService';

const PAGE_LIMIT = 12;
const CACHE_TTL = 10 * 60 * 1000;
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

const AppRoutes = () => {
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
  const searchCacheRef = useRef(new Map());

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
        const cacheKey = JSON.stringify({
          q: trimmedQuery,
          page: nextPage,
          limit: PAGE_LIMIT,
          genre: filters.genre || '',
        });
        const cached = searchCacheRef.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setMangaResults((prev) => (append ? mergeById(prev, cached.items) : cached.items));
          setHasNextPage(Boolean(cached.pagination?.has_next_page));
          setPage(nextPage);
          hasSearchedRef.current = true;
          retryRef.current = false;
          return;
        }

        if (cached) {
          searchCacheRef.current.delete(cacheKey);
        }

        const { items, pagination } = await searchAnime({
          query: trimmedQuery,
          page: nextPage,
          limit: PAGE_LIMIT,
          genre: filters.genre,
          signal: controller.signal,
        });

        searchCacheRef.current.set(cacheKey, {
          items,
          pagination,
          timestamp: Date.now(),
        });
        setMangaResults((prev) => (append ? mergeById(prev, items) : items));
        setHasNextPage(Boolean(pagination?.has_next_page));
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
    fetchGenres()
      .then((data) => setGenres(data))
      .catch((fetchError) => {
        console.error('Error fetching genres:', fetchError);
      });
    setYears(buildYears());
  }, [buildYears]);

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

  const handleSearch = useCallback(
    (searchQuery, options = {}) => {
      setPage(1);
      searchManga(searchQuery, 1, {
        ...options,
        explicit: options.explicit ?? true,
      });
    },
    [searchManga]
  );

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

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <HomePage
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              filters={filters}
              genres={genres}
              years={years}
              onFiltersChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
              onClearFilters={() => setFilters({ genre: '', year: '' })}
              rateLimitMessage={rateLimitMessage}
              error={error}
              showDiscover={showDiscover}
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              visibleMangas={visibleMangas}
              loading={loading}
              emptyMessage={emptyMessage}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          }
        />
        <Route
          path="discover"
          element={
            <HomePage
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              filters={filters}
              genres={genres}
              years={years}
              onFiltersChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
              onClearFilters={() => setFilters({ genre: '', year: '' })}
              rateLimitMessage={rateLimitMessage}
              error={error}
              showDiscover
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              visibleMangas={visibleMangas}
              loading={loading}
              emptyMessage={emptyMessage}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          }
        />
        <Route
          path="favorites"
          element={
            <FavoritesPage
              favorites={favorites}
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="anime/:id"
          element={
            <AnimeDetailPage
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              language="fr"
            />
          }
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="legal" element={<LegalPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
