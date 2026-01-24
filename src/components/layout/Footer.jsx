import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="od-footer-full">
      <div className="od-footer-full__inner">
        <div className="od-footer-full__col">
          <div className="od-footer-brand">
            <img
              src={`${process.env.PUBLIC_URL}/Logo_OtakuDek.png`}
              alt="OtakuDex"
              className="footer-logo"
            />
            <span className="sr-only">OtakuDex</span>
          </div>
          <p className="od-footer-text">Base de données anime via Jikan/MAL</p>
        </div>
        <div className="od-footer-full__col">
          <div className="od-footer-title">Liens</div>
          <div className="od-footer-links">
            <Link to="/legal">Mentions légales</Link>
            <Link to="/privacy">Politique de confidentialité</Link>
            <span className="od-footer-link-muted">Contact</span>
          </div>
        </div>
        <div className="od-footer-full__col">
          <div className="od-footer-title">Social</div>
          <div className="od-footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter/X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
