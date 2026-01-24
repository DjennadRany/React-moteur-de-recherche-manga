import React from 'react';

const Header = ({ variant = 'home' }) => {
  const isCompact = variant !== 'home';
  return (
    <div className="appShell appShell--header">
      <header className={`page-header ${isCompact ? 'od-header--compact' : 'od-header--home'}`}>
        <div className="brand-bar brand-bar--compact">
          <div className="brand-logo-wrap" aria-hidden="true">
            <img
              src={`${process.env.PUBLIC_URL}/Logo_OtakuDek.png`}
              alt="OtakuDex"
              className="brand-logo-img"
            />
          </div>
          <h1 className="sr-only">OtakuDex</h1>
          <p className="sr-only">Le Pokedex moderne des animes.</p>
        </div>
      </header>
    </div>
  );
};

export default Header;
