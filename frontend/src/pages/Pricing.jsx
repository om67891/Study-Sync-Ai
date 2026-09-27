import React, { useState } from 'react';
import { Check, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Pricing() {
  const { isAuthenticated, session } = useAuth();
  const [waitlistStatus, setWaitlistStatus] = useState('idle'); // idle, loading, success, error
  const [waitlistMsg, setWaitlistMsg] = useState('');

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setWaitlistStatus('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ message: 'Joined from Pricing page' })
      });
      const data = await response.json();
      if (data.success) {
        setWaitlistStatus('success');
      } else {
        setWaitlistStatus('error');
        setWaitlistMsg(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setWaitlistStatus('error');
      setWaitlistMsg('Error submitting request.');
    }
  };

  return (
    <div className="pricing-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            Simple, transparent <span className="text-gradient">pricing.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Start for free and experience the power of AI-generated study plans.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Free Tier */}
          <div className="card" style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', border: '2px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Free Trial</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-dark)' }}>$0</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Perfect for testing out the AI scheduler.</p>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>3 AI Plan Generations</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>PDF Downloads</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>Up to 5 subjects per plan</span>
              </li>
            </ul>
            
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                Get Started for Free
              </Link>
            )}
          </div>

          {/* Premium Tier */}
          <div className="card" style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', border: '2px solid var(--primary-main)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-primary)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
              MOST POPULAR
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Pro (Coming Soon)</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-dark)' }}>$X.XX</span>
              <span style={{ color: 'var(--text-secondary)' }}>/month</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>For dedicated students who need unlimited planning.</p>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>Unlimited AI Plan Generations</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>Save & Edit Multiple Plans</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>Unlimited subjects</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check size={20} style={{ color: '#10b981' }} /> <span>Premium Support</span>
              </li>
            </ul>
            
            {isAuthenticated ? (
              waitlistStatus === 'success' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                  <CheckCircle size={20} />
                  <span style={{ fontWeight: 500 }}>You're on the list!</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {waitlistStatus === 'error' && (
                    <div style={{ color: '#b91c1c', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {waitlistMsg}
                    </div>
                  )}
                  <button onClick={handleWaitlist} disabled={waitlistStatus === 'loading'} className="btn btn-primary" style={{ width: '100%' }}>
                    {waitlistStatus === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                  </button>
                </div>
              )
            ) : (
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Sign up to Join Waitlist
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Pricing;
