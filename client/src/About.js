import React from 'react';
import { FaUsers, FaChartLine, FaHandshake, FaMapMarkerAlt } from 'react-icons/fa';
import './about.css'
import bgImage from './assets/background.jpg';
const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero" style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '80vh', // or any height you need
    width: '100%'    // optional
  }}>
        <div className="about-hero-content">
          <h1>About MBEYA BUSINESS </h1>
          <p>Connecting businesses with the best service providers in Mbeya region</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            At MBEYA BizHub, we're dedicated to fostering economic growth in Mbeya by creating a 
            reliable platform where businesses can easily find and connect with top-quality service 
            providers. We believe in transparency, quality, and community development.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FaUsers className="value-icon" />
              <h3>Community Focus</h3>
              <p>We prioritize local businesses to strengthen Mbeya's economy and create opportunities.</p>
            </div>
            <div className="value-card">
              <FaChartLine className="value-icon" />
              <h3>Growth Oriented</h3>
              <p>We measure success by the growth and satisfaction of both businesses and service providers.</p>
            </div>
            <div className="value-card">
              <FaHandshake className="value-icon" />
              <h3>Trust & Transparency</h3>
              <p>We maintain honest relationships and clear communication with all stakeholders.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="container">
          <h2>Our Location</h2>
          <div className="team-content">
            <div className="team-text">
              <p>
                Based in the heart of Mbeya, our team understands the local business landscape 
                and is committed to serving the community. We carefully vet all service providers 
                to ensure quality and reliability for our users.
              </p>
              <div className="address">
                <FaMapMarkerAlt className="address-icon" />
                <span>123 Business Street, Mbeya, Tanzania</span>
              </div>
            </div>
            <div className="team-map">
              {/* This would be replaced with an actual map component */}
              <div className="map-placeholder">
                <p>Mbeya Map Location</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;