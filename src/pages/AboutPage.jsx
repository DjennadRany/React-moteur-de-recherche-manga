import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="appShell">
      <div className="page-topbar page-topbar--inner">
        <h2>À propos</h2>
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
        <p>
          Ce service est un moteur de recherche d’animes conçu pour aller à l’essentiel :
          trouver rapidement un titre, comparer, sauvegarder et découvrir.
        </p>
        <p>
          Les données sont fournies par Jikan (API publique) et MyAnimeList. L’interface est
          pensée mobile-first, avec une navigation rapide et une lecture confortable.
        </p>
        <p>
          Cette page est un espace de présentation : les contenus et fonctionnalités sont amenés
          à évoluer au fil des versions.
        </p>
        {/* TODO: Automatisation future - 3 posts/jour */}
      </div>
    </div>
  );
};

export default AboutPage;
