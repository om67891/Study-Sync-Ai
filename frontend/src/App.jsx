import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import StudyPlanView from './pages/StudyPlanView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { initAnalytics, trackPageView } from './lib/analytics';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Capture UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');

    if (utmSource || utmMedium || utmCampaign) {
      // Only set if not already set (first-touch attribution)
      if (!sessionStorage.getItem('utm_source')) {
        if (utmSource) sessionStorage.setItem('utm_source', utmSource);
        if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
        if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
        if (utmContent) sessionStorage.setItem('utm_content', utmContent);
        if (utmTerm) sessionStorage.setItem('utm_term', utmTerm);
        sessionStorage.setItem('landing_page', window.location.pathname);
      }
    }
  }, [location]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  
  return null;
}

function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AnalyticsTracker />
        <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<div className="container section"><h1>Privacy Policy</h1></div>} />
            <Route path="/terms" element={<div className="container section"><h1>Terms & Conditions</h1></div>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            } />
            <Route path="/study-plan/:id" element={
              <ProtectedRoute>
                <StudyPlanView />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
