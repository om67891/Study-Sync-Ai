import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Calendar, Zap, Star, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

function Dashboard() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Premium Interest State
  const [premiumInterestStatus, setPremiumInterestStatus] = useState('idle');
  const [premiumMsg, setPremiumMsg] = useState('');
  const [premiumInterestInput, setPremiumInterestInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    // Fetch profile from Supabase directly (client-side, uses user's own JWT)
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (data) {
        setProfile(data);
      } else {
        // Profile row doesn't exist yet — use metadata fallback
        setProfile({
          first_name: user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student',
          trials_remaining: 3,
          total_free_trials: 3,
          trials_used: 0
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      setProfile({
        first_name: user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student',
        trials_remaining: 3,
        total_free_trials: 3,
        trials_used: 0
      });
    }

    // Fetch recent plans from backend
    if (session?.access_token) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRecentPlans(data.plans || []);
          }
        }
      } catch (err) {
        console.error('Error fetching plans:', err.message);
        // Non-critical — just show empty state
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Track subscription_view when trials reach 0
  useEffect(() => {
    if (profile && profile.trials_remaining === 0) {
      trackEvent('subscription_view');
    }
  }, [profile]);

  const handlePremiumClick = () => {
    trackEvent('subscription_interest_click');
    setPremiumInterestStatus('form');
  };

  const handlePremiumSubmit = async (e) => {
    e.preventDefault();
    trackEvent('subscription_interest_submit');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ message: premiumInterestInput })
      });
      const data = await response.json();
      if (data.success) {
        setPremiumInterestStatus('success');
      } else {
        setPremiumMsg(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setPremiumMsg('Error submitting request.');
    }
  };

  if (loading) {
    return (
      <div className="container section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid var(--bg-main)', borderTopColor: 'var(--primary-main)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back, {profile?.first_name}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your study plans and account.</p>
        </div>
        <button onClick={fetchData} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Trial Card */}
        <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ margin: 0, color: 'white' }}>Free Plans Remaining</h3>
          </div>

          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '8px' }}>
            {profile?.trials_remaining ?? 3} <span style={{ fontSize: '1.25rem', fontWeight: 'normal', opacity: 0.8 }}>/ {profile?.total_free_trials ?? 3}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${((profile?.trials_remaining ?? 3) / (profile?.total_free_trials ?? 3)) * 100}%`, height: '100%', background: 'white', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ marginTop: '12px', fontSize: '0.875rem', opacity: 0.9 }}>
            You have {profile?.trials_remaining ?? 3} free AI study plan generation{(profile?.trials_remaining ?? 3) !== 1 ? 's' : ''} left.
          </p>
        </div>

        {/* Generate Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '12px' }}>Ready to plan?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Build your personalized study plan tailored to your exact goals and available time.
          </p>
          {(profile?.trials_remaining ?? 3) > 0 ? (
            <Link to="/planner" className="btn btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
              Create My Study Plan
            </Link>
          ) : (
            <button className="btn btn-secondary" style={{ width: '100%', padding: '14px' }} disabled>
              No trials remaining
            </button>
          )}
        </div>
      </div>

      {/* Recent Plans */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Recent Plans</h2>

        {recentPlans.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Calendar size={32} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>No plans yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your personalized study plans will appear here after you generate one.</p>
            <Link to="/planner" className="btn btn-primary">Create Your First Plan</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {recentPlans.map(plan => (
              <Link to={`/study-plan/${plan.id}`} key={plan.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>{plan.title || 'Study Plan'}</h3>
                  <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                    {plan.goal && <span>{plan.goal}</span>}
                    {plan.goal && plan.duration_value && <span>•</span>}
                    {plan.duration_value && <span>{plan.duration_value} {plan.duration_unit}</span>}
                    <span>•</span>
                    <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: plan.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : plan.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: plan.status === 'completed' ? '#10b981' : plan.status === 'failed' ? '#ef4444' : '#f59e0b',
                    textTransform: 'capitalize'
                  }}>
                    {plan.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Premium Section */}
      {profile && profile.trials_remaining === 0 ? (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-dark), #1e1b4b)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>Unlock StudySync AI Premium</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>You've used all 3 free study-plan trials.</p>
            </div>

            {premiumInterestStatus === 'idle' && (
              <button onClick={handlePremiumClick} className="btn" style={{ background: 'white', color: 'var(--primary-dark)' }}>
                I'm Interested in Premium
              </button>
            )}

            {premiumInterestStatus === 'form' && (
              <form onSubmit={handlePremiumSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px' }}>
                <p style={{ fontSize: '0.875rem' }}>We'll contact you when Premium is available. Add an optional message:</p>
                <input
                  type="text"
                  value={premiumInterestInput}
                  onChange={e => setPremiumInterestInput(e.target.value)}
                  placeholder="Optional message..."
                  style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', color: 'black' }}
                />
                <button type="submit" className="btn btn-primary">Submit Interest</button>
                {premiumMsg && <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{premiumMsg}</span>}
              </form>
            )}

            {premiumInterestStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={24} color="#10b981" />
                <span>Premium Interest Registered. We'll be in touch!</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', background: 'linear-gradient(to right, var(--bg-main), white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>Need more personalized study plans?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upgrade to Premium for unlimited generations and advanced planning.</p>
            </div>
          </div>
          <Link to="/pricing" className="btn btn-secondary">Explore Premium</Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
