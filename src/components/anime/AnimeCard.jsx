import React from 'react';
import { Link } from 'react-router-dom';
import Poster from './Poster';

const getYearFromAired = (manga) => {
  const from = manga?.aired?.from;
  if (!from || typeof from !== 'string') {
    return '';
  }
  const year = from.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
};

const AnimeCard = ({
  anime,
  favoritesSet,
  onToggleFavorite,
  variant = 'default',
  showFavorite = true,
  isFavorited,
  linkUrl,
  external = false,
  imageUrl: imageOverride,
  badgeTop,
  showBadges = true,
}) => {
  const year = getYearFromAired(anime);
  const isFavorite =
    typeof isFavorited === 'boolean' ? isFavorited : favoritesSet?.has(anime.mal_id);
  const imageUrl =
    imageOverride || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title || anime.name || 'Sans titre';
  const resolvedLink = linkUrl || `/anime/${anime.mal_id}`;
  const Wrapper = external ? 'a' : Link;
  const wrapperProps = external
    ? { href: resolvedLink, target: '_blank', rel: 'noreferrer' }
    : { to: resolvedLink };

  return (
    <article className={`manga-card anime-card anime-card--${variant}`}>
      <Wrapper {...wrapperProps} className="anime-card__link">
        <div className="manga-card__media">
          <Poster src={imageUrl} alt={title} />
          {badgeTop && <span className="badge badge-top">{badgeTop}</span>}
          {showFavorite && onToggleFavorite && (
            <button
              type="button"
              className={`fav-button ${isFavorite ? 'is-active' : ''}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite(anime.mal_id);
              }}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            />
          )}
        </div>
        <div className="manga-card__body">
          <h3 className="card-title">
            {title}
            {external && <span className="external-indicator">↗</span>}
          </h3>
          {showBadges && (
            <div className="badge-row">
              {anime.score && <span className="badge">Score {anime.score}</span>}
              {year && <span className="badge">{year}</span>}
              {anime.type && <span className="badge">{anime.type}</span>}
            </div>
          )}
        </div>
      </Wrapper>
    </article>
  );
};

export default AnimeCard;
