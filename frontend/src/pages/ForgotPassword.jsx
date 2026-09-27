import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to send reset instructions.');
    }
  };

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h2>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your email to receive reset instructions</p>
        </div>

        {status === 'error' && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            {message}
          </div>
        )}

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#ecfdf5', color: '#047857', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <CheckCircle size={32} />
              <p>{message}</p>
            </div>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                disabled={status === 'loading'}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Instructions'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--primary-main)', fontWeight: 500 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
