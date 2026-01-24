import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimeCard from '../components/anime/AnimeCard';
import { fetchAnimeById } from '../services/animeService';

const FavoritesPage = ({ favorites, favoritesSet, onToggleFavorite }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadFavorites = async () => {
      if (!favorites || favorites.length === 0) {
        setItems([]);
        return;
      }
      setLoading(true);
      const nextItems = [];
      for (const id of favorites) {
        try {
          const anime = await fetchAnimeById(id, { signal: controller.signal });
          if (anime) {
            nextItems.push(anime);
          }
        } catch (error) {
          if (error.code === 'ERR_CANCELED') {
            return;
          }
        }
      }
      if (isMounted) {
        setItems(nextItems);
        setLoading(false);
      }
    };

    loadFavorites();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [favorites]);

  return (
    <div className="appShell">
      <div className="page-topbar page-topbar--inner">
        <h2>Favoris</h2>
        <div className="topbar-links">
          <Link to="/" className="topbar-link">
            Accueil
          </Link>
          <Link to="/discover" className="topbar-link">
            Découvrir
          </Link>
        </div>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="empty-state">
            <p>Chargement des favoris...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>Vous n’avez pas encore ajouté de favoris.</p>
            <p>Utilisez la recherche pour enregistrer vos animes préférés.</p>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Vos favoris</h2>
              <span className="results-count">{items.length} titres</span>
            </div>
            <ul className="manga-grid">
              {items.map((anime) => (
                <li key={anime.mal_id} className="manga-grid__item">
                  <AnimeCard
                    anime={anime}
                    favoritesSet={favoritesSet}
                    onToggleFavorite={onToggleFavorite}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
