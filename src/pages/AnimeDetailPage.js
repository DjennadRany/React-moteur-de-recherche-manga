import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AnimeCard from '../components/AnimeCard';

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

const AnimeDetailPage = ({ favoritesSet, onToggleFavorite }) => {
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
        const detailUrl = `https://api.jikan.moe/v4/anime/${id}`;
        const relationsUrl = `https://api.jikan.moe/v4/anime/${id}/relations`;
        const recsUrl = `https://api.jikan.moe/v4/anime/${id}/recommendations`;

        const cachedDetail = cacheGet(detailUrl);
        const cachedRelations = cacheGet(relationsUrl);
        const cachedRecs = cacheGet(recsUrl);

        if (cachedDetail && cachedRelations && cachedRecs) {
          setManga(cachedDetail);
          setRelations(cachedRelations);
          setRecommendations(cachedRecs);
          return;
        }

        const [detailRes, relationsRes, recsRes] = await Promise.all([
          cachedDetail
            ? Promise.resolve({ data: { data: cachedDetail } })
            : axios.get(detailUrl, { signal: controller.signal }),
          cachedRelations
            ? Promise.resolve({ data: { data: cachedRelations } })
            : axios.get(relationsUrl, { signal: controller.signal }),
          cachedRecs
            ? Promise.resolve({ data: { data: cachedRecs } })
            : axios.get(recsUrl, { signal: controller.signal }),
        ]);

        const detailData = detailRes.data.data;
        const relationsData = relationsRes.data.data || [];
        const recsData = recsRes.data.data || [];

        cacheSet(detailUrl, detailData);
        cacheSet(relationsUrl, relationsData);
        cacheSet(recsUrl, recsData);

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

  const synopsisText = manga?.synopsis || 'Synopsis indisponible.';
  const shouldClamp = synopsisText.length > 260;

  const youtubeSearchUrl = useMemo(() => {
    if (!manga?.title) {
      return 'https://www.youtube.com/';
    }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${manga.title} trailer`
    )}`;
  }, [manga]);

  if (loading) {
    return (
      <div className="detail-page appShell">
        <div className="detail-skeleton hero" />
        <div className="detail-skeleton block" />
        <div className="detail-skeleton block" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page appShell">
        <div className="error-state" role="alert">
          <p>{error}</p>
          <Link to="/" className="ghost-button btn btnGhost">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return null;
  }

  return (
    <div
      className="detail-page appShell"
      style={{
        '--detail-bg': `url(${manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url})`,
      }}
    >
      <div className="detail-surface">
        <header className="page-header detail-header">
          <Link to="/" className="app-brand app-brand--compact">
            <img
              src={`${process.env.PUBLIC_URL}/Logo_OtakuDek.png`}
              alt="OtakuDek"
              className="app-logo app-logo--small"
            />
            <span className="app-title">OtakuDek</span>
          </Link>
          <Link to="/" className="back-link">
            ← Retour
          </Link>
        </header>

        <section className="detail-hero">
          <div className="detail-cover">
            <img
              src={manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url}
              alt={manga.title}
            />
          </div>
          <div className="detail-info">
            <p className="detail-subtitle">
              {manga.type || 'Anime'} {year ? `• ${year}` : ''}
            </p>
            <h1>{manga.title}</h1>
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
              {manga.url && (
                <a
                  href={manga.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ghost-button btn btnGhost"
                >
                  Ouvrir sur MAL
                </a>
              )}
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
            </div>
          )}
        </section>

      <section className="detail-section">
        <h2>Synopsis</h2>
        <p className={`synopsis ${synopsisExpanded ? 'is-expanded' : 'is-collapsed'}`}>
          {synopsisText}
        </p>
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
        {relations.length === 0 ? (
          <p className="empty-state">Aucune relation trouvée.</p>
        ) : (
          <div className="related-groups">
            {relations.map((group) => (
              <div key={group.relation} className="related-group">
                <div className="related-group__header">
                  <h3>{group.relation}</h3>
                </div>
                <div className="scroll-row">
                  {group.entry.map((entry) => (
                    <div key={`${group.relation}-${entry.mal_id}`} className="scroll-card">
                      {String(entry.type || '').toLowerCase() === 'anime' ? (
                        <AnimeCard
                          anime={{
                            mal_id: entry.mal_id,
                            title: entry.name,
                            type: entry.type,
                          }}
                          favoritesSet={favoritesSet}
                          onToggleFavorite={onToggleFavorite}
                          showFavorite={false}
                          badgeTop={group.relation}
                          variant="compact"
                        />
                      ) : (
                        <AnimeCard
                          anime={{
                            mal_id: entry.mal_id,
                            title: entry.name,
                            type: entry.type,
                          }}
                          linkUrl={entry.url}
                          external
                          showFavorite={false}
                          badgeTop={group.relation}
                          showBadges={false}
                          variant="compact"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2>Recommendations</h2>
        {recommendations.length === 0 ? (
          <p className="empty-state">Aucune recommandation pour le moment.</p>
        ) : (
          <div className="scroll-row">
            {recommendations.map((rec) => (
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
  );
};

export default AnimeDetailPage;
