import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="nav-brand">
          <img src="/logo.png" alt="StudySync AI Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          StudySync AI
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/features" className="nav-link">Features</Link>
              <Link to="/how-it-works" className="nav-link">How It Works</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/planner" className="nav-link">Create Study Plan</Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary">Claim 3 Free Trials</Link>
            </>
          ) : (
            <>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>Logout</button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'block' }}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '80px', left: 0, right: 0, background: 'white', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 99 }}>
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              <Link to="/how-it-works" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
              <Link to="/pricing" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '8px 0' }} />
              <Link to="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>Claim 3 Free Trials</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/planner" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Create Study Plan</Link>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '8px 0' }} />
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
