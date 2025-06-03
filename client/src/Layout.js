// src/components/layout/Layout.js
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;