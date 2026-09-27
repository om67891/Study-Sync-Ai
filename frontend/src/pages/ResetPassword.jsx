import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have the hash in the URL (Supabase appends the access token as a hash fragment)
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      // It might be a recovery link but without hash, wait for supabase to process it
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session after a brief delay, they might not have a valid recovery token
          setTimeout(() => {
            if (status !== 'success') {
              setStatus('error');
              setMessage('Invalid or expired reset link. Please try requesting a new one.');
            }
          }, 2000);
        }
      };
      checkSession();
    }
  }, [location, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setStatus('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setStatus('success');
      setMessage('Your password has been successfully updated.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h2>Set New Password</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your new password below</p>
        </div>

        {status === 'error' && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            {message}
          </div>
        )}

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#ecfdf5', color: '#047857', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <p>{message}</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                disabled={status === 'loading'}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                disabled={status === 'loading'}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
