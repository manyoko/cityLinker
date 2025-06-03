import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars, FaTimes, FaUserPlus, FaSignInAlt,
  FaInfoCircle, FaPhone, FaHome
} from 'react-icons/fa';
import './navigation.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-inner">
          <Link to="/" className="logo">
            <span className="logo-green">MBEYA CITY</span>
            
          </Link>

          <nav className="nav-desktop">
            <Link to="/" className="nav-link"><FaHome className="icon" /> Home</Link>
            <Link to="/about" className="nav-link"><FaInfoCircle className="icon" /> About Us</Link>
            <Link to="/contact" className="nav-link"><FaPhone className="icon" /> Contact</Link>
            <div className="auth-buttons">
              <Link to="/signin" className="btn-outline"><FaSignInAlt className="icon" /> Sign In</Link>
              <Link to="/signup" className="btn-primary"><FaUserPlus className="icon" /> Sign Up</Link>
            </div>
          </nav>

          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="nav-mobile">
            <Link to="/" className="nav-mobile-link" onClick={() => setIsOpen(false)}>
              <FaHome className="icon" /> Home
            </Link>
            <Link to="/about" className="nav-mobile-link" onClick={() => setIsOpen(false)}>
              <FaInfoCircle className="icon" /> About Us
            </Link>
            <Link to="/contact" className="nav-mobile-link" onClick={() => setIsOpen(false)}>
              <FaPhone className="icon" /> Contact
            </Link>
            <div className="auth-mobile-buttons">
              <Link to="/signin" className="btn-outline" onClick={() => setIsOpen(false)}>
                <FaSignInAlt className="icon" /> Sign In
              </Link>
              <Link to="/signup" className="btn-primary" onClick={() => setIsOpen(false)}>
                <FaUserPlus className="icon" /> Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
