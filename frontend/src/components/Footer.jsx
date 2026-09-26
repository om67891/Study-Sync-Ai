import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ background: 'var(--primary-dark)', color: 'var(--text-light)', padding: '60px 0 24px', marginTop: '80px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <div className="nav-brand" style={{ color: 'white', marginBottom: '16px' }}>StudySync AI</div>
          <p>Plan Better. Study Smarter. The AI-powered study scheduling platform for students.</p>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Product</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Company</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Legal</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <p>&copy; 2026 StudySync AI. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#" style={{ color: 'var(--text-light)' }}>Instagram</a>
          <a href="#" style={{ color: 'var(--text-light)' }}>Facebook</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
