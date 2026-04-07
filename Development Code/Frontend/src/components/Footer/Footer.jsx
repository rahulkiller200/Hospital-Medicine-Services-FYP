import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="professional-footer">
      <div className="footer-top">
        <div className="footer-column about-col">
          <h3>About HMS</h3>
          <div className="underline"></div>
          <p>
            Hospital & Medicine Services provides quick access to emergency medical
            services in Kathmandu. We bridge the gap between patients and immediate
            healthcare coordinates.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <div className="underline"></div>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Our Services</Link></li>
            <li><Link to="/medical-team">Medical Team</Link></li>
            <li><Link to="/coverage">Coverage Areas</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Emergency Services</h3>
          <div className="underline"></div>
          <ul>
            <li><Link to="/medicine">Medicine Service</Link></li>
            <li><Link to="/hospital">Hospital Directory</Link></li>
            <li><Link to="/bloodbank">Blood Bank</Link></li>
            <li><Link to="/emergency">Emergency Response</Link></li>
          </ul>
        </div>

        <div className="footer-column contact-col">
          <h3>Contact Us</h3>
          <div className="underline"></div>
          <div className="contact-details">
            <p><i className="fas fa-phone-alt contact-icon"></i> Emergency: +977 9862738557</p>
            <p><i className="fas fa-envelope contact-icon"></i> support@hms.com</p>
            <p><i className="fas fa-map-marker-alt contact-icon"></i> Kathmandu, Nepal</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Emergency Healthcare Assistance. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>

        {/* Floating Chat Bubble Indicator (Visual placeholder) */}
        <div className="footer-chat-indicator" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <i className="fas fa-comment-dots"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
