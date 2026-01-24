import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="appShell">
      <div className="page-topbar page-topbar--inner">
        <h2>Politique de confidentialité</h2>
        <div className="topbar-links">
          <Link to="/" className="topbar-link">
            Accueil
          </Link>
          <Link to="/legal" className="topbar-link">
            Mentions légales
          </Link>
        </div>
      </div>
      <div className="page-content">
        <p>
          Cette page décrit la manière dont les données sont utilisées. Il s’agit d’un texte
          indicatif à compléter selon le contexte réel d’exploitation.
        </p>
        <h3>Données collectées</h3>
        <p>
          Le site ne collecte pas de données personnelles par défaut. Les favoris peuvent être
          enregistrés localement dans le navigateur de l’utilisateur.
        </p>
        <h3>Cookies</h3>
        <p>
          Aucun cookie publicitaire n’est utilisé. Si des outils d’analytics sont ajoutés,
          une mention claire devra être affichée.
        </p>
        <h3>Contact</h3>
        <p>Pour toute question : [contact(at)exemple.tld] (placeholder).</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
