import React from 'react';
import { NavLink } from 'react-router-dom';

const Menu = () => {
  return (
    <nav className="od-menu" aria-label="Navigation principale">
      <div className="od-menu__inner">
        <NavLink to="/" end className={({ isActive }) => `od-menu__link${isActive ? ' is-active' : ''}`}>
          Accueil
        </NavLink>
        <NavLink to="/discover" className={({ isActive }) => `od-menu__link${isActive ? ' is-active' : ''}`}>
          Découvrir
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `od-menu__link${isActive ? ' is-active' : ''}`}>
          Favoris
        </NavLink>
      </div>
    </nav>
  );
};

export default Menu;
