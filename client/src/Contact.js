import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <>
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you! Reach out with questions or feedback.</p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              
              <div className="info-item">
                <FaPhone className="info-icon" />
                <div>
                  <h3>Phone</h3>
                  <p>+255 123 456 789</p>
                  <p>+255 987 654 321</p>
                </div>
              </div>

              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <h3>Email</h3>
                  <p>info@mbeyabizhub.com</p>
                  <p>support@mbeyabizhub.com</p>
                </div>
              </div>

              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div>
                  <h3>Address</h3>
                  <p>123 Business Street</p>
                  <p>Mbeya, Tanzania</p>
                </div>
              </div>

              <div className="info-item">
                <FaClock className="info-icon" />
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday - Friday: 8:00 - 17:00</p>
                  <p>Saturday: 9:00 - 14:00</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <h2>Send Us a Message</h2>
              <form>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea id="message" rows="5" required></textarea>
                </div>
                
                <button type="submit" className="submit-btn">
                  <FaPaperPlane className="btn-icon" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-map">
        <div className="container">
          {/* This would be replaced with an actual map component */}
          <div className="map-placeholder">
            <h2>Our Location</h2>
            <p>Interactive map would display here</p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ContactPage;