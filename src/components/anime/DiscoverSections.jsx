import React, { useCallback, useEffect, useRef, useState } from 'react';
import AnimeCard from './AnimeCard';
import { fetchSeasonNow, fetchTopAiring } from '../../services/animeService';

const CACHE_TTL = 10 * 60 * 1000;

const sectionsConfig = [
  {
    key: 'airing',
    title: 'Tendances (Airing)',
    subtitle: 'Les animes diffusés en ce moment',
    fetcher: fetchTopAiring,
  },
  {
    key: 'season-now',
    title: 'Season Now',
    subtitle: 'Les nouveautés de la saison',
    fetcher: fetchSeasonNow,
  },
];

const DiscoverSections = ({ favoritesSet, onToggleFavorite }) => {
  const cacheRef = useRef(new Map());
  const abortRef = useRef([]);
  const didFetchRef = useRef(false);
  const retryRef = useRef(new Map());

  const [state, setState] = useState(() =>
    sectionsConfig.reduce((acc, section) => {
      acc[section.key] = { data: [], loading: true, error: '' };
      return acc;
    }, {})
  );

  const fetchSection = useCallback(async (section) => {
    const cached = cacheRef.current.get(section.key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState((prev) => ({
        ...prev,
        [section.key]: { data: cached.data, loading: false, error: '' },
      }));
      return;
    }

    const controller = new AbortController();
    abortRef.current.push(controller);

    setState((prev) => ({
      ...prev,
      [section.key]: { ...prev[section.key], loading: true, error: '' },
    }));

    try {
      const items = await section.fetcher({ signal: controller.signal });
      cacheRef.current.set(section.key, { data: items, timestamp: Date.now() });
      retryRef.current.delete(section.key);
      setState((prev) => ({
        ...prev,
        [section.key]: { data: items, loading: false, error: '' },
      }));
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return;
      }
      if (error.response?.status === 429) {
        const hasRetried = retryRef.current.get(section.key);
        setState((prev) => ({
          ...prev,
          [section.key]: {
            ...prev[section.key],
            loading: false,
            error: 'Limite Jikan atteinte, réessai...',
          },
        }));
        if (!hasRetried) {
          retryRef.current.set(section.key, true);
          setTimeout(() => fetchSection(section), 3000);
        }
        return;
      }
      setState((prev) => ({
        ...prev,
        [section.key]: {
          ...prev[section.key],
          loading: false,
          error: 'Impossible de charger cette section.',
        },
      }));
    }
  }, []);

  useEffect(() => {
    if (didFetchRef.current) {
      return;
    }
    didFetchRef.current = true;
    sectionsConfig.forEach((section) => fetchSection(section));
    return () => {
      abortRef.current.forEach((controller) => controller.abort());
      abortRef.current = [];
    };
  }, [fetchSection]);

  return (
    <div className="discover">
      {sectionsConfig.map((section) => {
        const sectionState = state[section.key];
        return (
          <section key={section.key} className="discover-section">
            <div className="discover-header">
              <div>
                <h2>{section.title}</h2>
                <p className="discover-subtitle">{section.subtitle}</p>
              </div>
              {sectionState.error && (
                <button
                  type="button"
                  className="ghost-button btn btnGhost"
                  onClick={() => fetchSection(section)}
                >
                  Réessayer
                </button>
              )}
            </div>

            {sectionState.loading ? (
              <div className="discover-row">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`${section.key}-skeleton-${index}`} className="discover-card">
                    <div className="skeleton-media" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : sectionState.error ? (
              <div className="discover-error">{sectionState.error}</div>
            ) : (
              <div className="discover-row">
                {sectionState.data.map((anime) => (
                  <div key={anime.mal_id} className="discover-card">
                    <AnimeCard
                      anime={anime}
                      favoritesSet={favoritesSet}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default DiscoverSections;
