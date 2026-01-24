import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Menu from '../components/layout/Menu';
import Footer from '../components/layout/Footer';

const AppLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/discover';
  const headerVariant = isHome ? 'home' : 'compact';

  return (
    <div className="app-root">
      <Header variant={headerVariant} />
      <Menu />
      <div className="app-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
