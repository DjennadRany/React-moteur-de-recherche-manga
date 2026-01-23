// src/components/MangaList.js
import React from 'react';
import AnimeCard from './AnimeCard';

const MangaList = ({
  mangas,
  onToggleFavorite,
  favoritesSet,
  isLoading,
  emptyMessage,
  skeletonCount = 12,
}) => {
  if (isLoading && mangas.length === 0) {
    return (
      <div className="results-section">
        <div className="results-header">
          <h2>Chargement...</h2>
        </div>
        <ul className="manga-grid">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <li key={`skeleton-${index}`} className="manga-card skeleton-card">
              <div className="skeleton-media" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!isLoading && mangas.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <h2>Résultats</h2>
        <span className="results-count">{mangas.length} titres</span>
      </div>
      <ul className="manga-grid">
        {mangas.map((manga) => (
          <li key={manga.mal_id} className="manga-grid__item">
            <AnimeCard
              anime={manga}
              favoritesSet={favoritesSet}
              onToggleFavorite={onToggleFavorite}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MangaList;
