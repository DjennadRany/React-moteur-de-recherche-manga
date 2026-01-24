import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimeCard from '../components/anime/AnimeCard';
import HorizontalRow from '../components/anime/HorizontalRow';
import Poster from '../components/anime/Poster';
import { fetchAnimeById, fetchRecommendations, fetchRelations } from '../services/animeService';
import { getLocalizedSynopsis, getLocalizedTitle } from '../utils/localization';

const getYearFromAired = (manga) => {
  const from = manga?.aired?.from;
  if (!from || typeof from !== 'string') {
    return '';
  }
  const year = from.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
};

const buildTrailerUrl = (manga) => {
  const trailer = manga?.trailer;
  if (!trailer) {
    return '';
  }
  if (trailer.embed_url) {
    return trailer.embed_url;
  }
  if (trailer.youtube_id) {
    return `https://www.youtube.com/embed/${trailer.youtube_id}`;
  }
  if (trailer.url && trailer.url.includes('youtube.com/watch')) {
    try {
      const url = new URL(trailer.url);
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    } catch (error) {
      return '';
    }
  }
  return '';
};

const AnimeDetailPage = ({ favoritesSet, onToggleFavorite, language }) => {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [relations, setRelations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const cacheRef = useRef(new Map());

  const cacheGet = (key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    const ttl = 10 * 60 * 1000;
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    return cached.data;
  };

  const cacheSet = (key, data) => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowTrailer(false);
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const detailKey = `detail:${id}`;
        const relationsKey = `relations:${id}`;
        const recsKey = `recs:${id}`;

        const cachedDetail = cacheGet(detailKey);
        const cachedRelations = cacheGet(relationsKey);
        const cachedRecs = cacheGet(recsKey);

        if (cachedDetail && cachedRelations && cachedRecs) {
          setManga(cachedDetail);
          setRelations(cachedRelations);
          setRecommendations(cachedRecs);
          return;
        }

        const [detailData, relationsData, recsData] = await Promise.all([
          cachedDetail ? Promise.resolve(cachedDetail) : fetchAnimeById(id, { signal: controller.signal }),
          cachedRelations ? Promise.resolve(cachedRelations) : fetchRelations(id, { signal: controller.signal }),
          cachedRecs ? Promise.resolve(cachedRecs) : fetchRecommendations(id, { signal: controller.signal }),
        ]);

        cacheSet(detailKey, detailData);
        cacheSet(relationsKey, relationsData);
        cacheSet(recsKey, recsData);

        setManga(detailData);
        setRelations(relationsData);
        setRecommendations(recsData);
      } catch (fetchError) {
        if (fetchError.code === 'ERR_CANCELED') {
          return;
        }
        setError('Impossible de charger cette fiche pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [id]);

  const trailerUrl = useMemo(() => buildTrailerUrl(manga), [manga]);
  const trailerExternalUrl = useMemo(() => {
    if (!manga?.trailer) {
      return '';
    }
    if (manga.trailer.url) {
      return manga.trailer.url;
    }
    if (manga.trailer.youtube_id) {
      return `https://www.youtube.com/watch?v=${manga.trailer.youtube_id}`;
    }
    return '';
  }, [manga]);
  const year = getYearFromAired(manga);
  const isFavorite = favoritesSet?.has(manga?.mal_id);
  const coverImage = manga?.images?.jpg?.large_image_url || manga?.images?.jpg?.image_url || '';
  const baseGenres = useMemo(
    () => new Set(manga?.genres?.map((genre) => genre.mal_id) || []),
    [manga]
  );

  const lang = language || 'fr';
  const localizedTitle = manga ? getLocalizedTitle(manga, lang) || manga?.title || '' : '';
  const { text: synopsisText, isFallback: isSynopsisFallback } = manga
    ? getLocalizedSynopsis(manga, lang)
    : { text: '', isFallback: false };
  const shouldClamp = synopsisText.length > 260;

  const youtubeSearchUrl = useMemo(() => {
    if (!localizedTitle) {
      return 'https://www.youtube.com/';
    }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${localizedTitle} trailer`
    )}`;
  }, [localizedTitle]);

  const openingSearchUrl = useMemo(() => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${localizedTitle} opening`
    )}`;
  }, [localizedTitle]);

  const endingSearchUrl = useMemo(() => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${localizedTitle} ending`
    )}`;
  }, [localizedTitle]);

  const sortedRecommendations = useMemo(() => {
    const baseYear = getYearFromAired(manga);
    return recommendations
      .map((rec) => {
        const entry = rec.entry || rec;
        const recGenres = entry.genres || [];
        const sharesGenre = recGenres.some((genre) => baseGenres.has(genre.mal_id));
        const scoreWeight = (entry.score || 0) / 10;
        const recYear = getYearFromAired(entry);
        const yearDiff =
          baseYear && recYear ? Math.abs(Number(baseYear) - Number(recYear)) : null;
        const yearBoost = yearDiff !== null && yearDiff <= 3 ? 1 : 0;
        return { rec, rank: (sharesGenre ? 2 : 0) + scoreWeight + yearBoost };
      })
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 12)
      .map((item) => item.rec);
  }, [recommendations, manga, baseGenres]);

  const relationRows = useMemo(() => {
    if (!relations.length) {
      return [];
    }
    return relations.map((group) => {
      const items = (group.entry || []).map((entry) => {
        const isAnime = String(entry.type || '').toLowerCase() === 'anime';
        const hasId = Boolean(entry.mal_id);
        return {
          id: `${group.relation}-${entry.mal_id || entry.name}`,
          title: entry.name,
          type: entry.type || '',
          link: isAnime && hasId ? `/anime/${entry.mal_id}` : '',
          isNavigable: isAnime && hasId,
          imageUrl: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || '',
        };
      });
      return {
        title: group.relation,
        items,
      };
    });
  }, [relations]);

  if (loading) {
    return (
      <div className="detail-page">
        {/* Layout fix: full-width background, content inside appShell. */}
        <div className="appShell">
          <div className="detail-skeleton hero" />
          <div className="detail-skeleton block" />
          <div className="detail-skeleton block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        {/* Layout fix: full-width background, content inside appShell. */}
        <div className="appShell">
          <div className="error-state" role="alert">
            <p>{error}</p>
            <Link to="/" className="ghost-button btn btnGhost">
              Retour à la recherche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return null;
  }

  return (
    <div
      className="detail-page"
      style={{
        '--detail-bg': coverImage ? `url(${coverImage})` : 'none',
      }}
    >
      {/* Layout fix: appShell wraps inner content only. */}
      <div className="appShell">
        <div className="detail-surface">
          <div className="page-topbar">
            <Link to="/" className="ghost-button btn btnGhost back-button">
              ← Retour
            </Link>
            <div className="topbar-links">
              <Link to="/" className="topbar-link">
                Accueil
              </Link>
              <Link to="/favorites" className="topbar-link">
                Favoris
              </Link>
            </div>
          </div>

          <section className="detail-hero">
            <div className="detail-cover">
              <Poster src={coverImage} alt={localizedTitle} className="poster--ratio" />
            </div>
            <div className="detail-info">
              <p className="detail-subtitle">
                {manga.type || 'Anime'} {year ? `• ${year}` : ''}
              </p>
              <h1>{localizedTitle}</h1>
              <div className="detail-badges">
                {manga.score && <span className="badge">Score {manga.score}</span>}
                {year && <span className="badge">{year}</span>}
                {manga.type && <span className="badge">{manga.type}</span>}
              </div>
              <div className="detail-actions">
                <button
                  type="button"
                  className={`primary-button btn btnPrimary ${isFavorite ? 'is-active' : ''}`}
                  onClick={() => onToggleFavorite(manga.mal_id)}
                >
                  {isFavorite ? 'Favori ✓' : 'Ajouter aux favoris'}
                </button>
              </div>
              {manga.genres?.length > 0 && (
                <div className="detail-genres">
                  {manga.genres.map((genre) => (
                    <span className="badge" key={genre.mal_id}>
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="detail-section detail-media">
            <h2>Trailer</h2>
            {trailerUrl ? (
              <div className="trailer-card">
                {!showTrailer ? (
                  <button
                    type="button"
                    className="trailer-button btn btnPrimary"
                    onClick={() => setShowTrailer(true)}
                  >
                    ▶ Lire le trailer
                  </button>
                ) : (
                  <div className="trailer">
                    <iframe
                      title={`Trailer ${manga.title}`}
                      src={trailerUrl}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="trailer-actions">
                  {trailerExternalUrl ? (
                    <a
                      href={trailerExternalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ghost-button btn btnGhost"
                    >
                      Ouvrir le trailer sur YouTube
                    </a>
                  ) : (
                    <a
                      href={youtubeSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ghost-button btn btnGhost"
                    >
                      Rechercher sur YouTube
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="trailer-empty">
                <p>Trailer indisponible.</p>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button btn btnPrimary"
                >
                  Rechercher sur YouTube
                </a>
                <p>Opening/Ending preview indisponible pour le moment.</p>
                <div className="trailer-actions">
                  <a
                    href={openingSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-button btn btnGhost"
                  >
                    Rechercher Opening sur YouTube
                  </a>
                  <a
                    href={endingSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-button btn btnGhost"
                  >
                    Rechercher Ending sur YouTube
                  </a>
                </div>
              </div>
            )}
          </section>

          <section className="detail-section">
            <h2>Synopsis</h2>
            <p className={`synopsis ${synopsisExpanded ? 'is-expanded' : 'is-collapsed'}`}>
              {synopsisText}
            </p>
            {isSynopsisFallback && (
              <p className="synopsis-fallback">Texte en anglais (FR indisponible)</p>
            )}
            {shouldClamp && (
              <button
                type="button"
                className="ghost-button btn btnGhost"
                onClick={() => setSynopsisExpanded((prev) => !prev)}
              >
                {synopsisExpanded ? 'Réduire' : 'Lire la suite'}
              </button>
            )}
          </section>

          <section className="detail-section info-list">
            <h2>Infos</h2>
            <ul>
              <li>Épisodes: {manga.episodes || 'N/A'}</li>
              <li>Statut: {manga.status || 'N/A'}</li>
              <li>Durée: {manga.duration || 'N/A'}</li>
              <li>
                Studios:{' '}
                {manga.studios?.length ? manga.studios.map((s) => s.name).join(', ') : 'N/A'}
              </li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>Franchise &amp; Relations</h2>
            {relationRows.length === 0 ? (
              <p className="empty-state">Aucune relation trouvée.</p>
            ) : (
              <div className="related-groups">
                {relationRows.map((row) => (
                  <HorizontalRow key={row.title} title={row.title} items={row.items} />
                ))}
              </div>
            )}
          </section>

          <section className="detail-section">
            <h2>Recommendations</h2>
            {sortedRecommendations.length === 0 ? (
              <p className="empty-state">Aucune recommandation pour le moment.</p>
            ) : (
              <div className="scroll-row">
                {sortedRecommendations.map((rec) => (
                  <div key={rec.entry.mal_id} className="scroll-card">
                    <AnimeCard
                      anime={rec.entry}
                      favoritesSet={favoritesSet}
                      onToggleFavorite={onToggleFavorite}
                      variant="compact"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
