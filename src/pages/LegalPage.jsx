import React from 'react';
import { Link } from 'react-router-dom';

const LegalPage = () => {
  return (
    <div className="appShell">
      <div className="page-topbar page-topbar--inner">
        <h2>Mentions légales</h2>
        <div className="topbar-links">
          <Link to="/" className="topbar-link">
            Accueil
          </Link>
          <Link to="/privacy" className="topbar-link">
            Confidentialité
          </Link>
        </div>
      </div>
      <div className="page-content">
        <p>
          Ce site est un projet de démonstration. Les informations légales ci-dessous sont des
          placeholders et doivent être remplacées avant toute mise en production.
        </p>
        <h3>Éditeur</h3>
        <p>Nom/raison sociale : [À compléter]</p>
        <p>Adresse : [À compléter]</p>
        <p>Responsable de publication : [À compléter]</p>
        <h3>Hébergement</h3>
        <p>Hébergeur : [À compléter]</p>
        <p>Adresse de l’hébergeur : [À compléter]</p>
        <h3>Propriété intellectuelle</h3>
        <p>
          Les contenus affichés proviennent de sources publiques. Toute reproduction doit
          respecter les droits des éditeurs et ayants droit.
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
