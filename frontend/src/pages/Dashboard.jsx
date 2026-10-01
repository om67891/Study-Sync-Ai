import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  Calendar, Zap, Star, CheckCircle, AlertCircle, RefreshCw,
  Timer, Play, Pause, RotateCcw, BookOpen, TrendingUp,
  ArrowRight, Lightbulb, Target, Award, Coffee
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Pomodoro Timer Component ──────────────────────────────────────────────────
function PomodoroTimer() {
  const MODES = {
    focus: { label: 'Focus', minutes: 25, color: '#818cf8' },
    short: { label: 'Short Break', minutes: 5, color: '#34d399' },
    long:  { label: 'Long Break', minutes: 15, color: '#60a5fa' },
  };
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const total = current.minutes * 60;
  const pct = ((total - timeLeft) / total) * 100;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (mode === 'focus') setSessions(s => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const switchMode = (m) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(m);
    setTimeLeft(MODES[m].minutes * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(current.minutes * 60);
  };

  return (
    <div className="pomodoro-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '10px' }}>
          <Timer size={22} color="white" />
        </div>
        <div>
          <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>Pomodoro Timer</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: 0 }}>Stay focused, study smarter</p>
        </div>
        {sessions > 0 && (
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={14} /> {sessions} done
          </div>
        )}
      </div>

      {/* Mode switcher */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px', marginBottom: '24px', gap: '4px' }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)} style={{
            flex: 1, padding: '7px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            background: mode === key ? 'white' : 'transparent',
            color: mode === key ? '#1e1b4b' : 'rgba(255,255,255,0.7)',
            transition: 'all 0.2s',
          }}>{val.label}</button>
        ))}
      </div>

      {/* Circular Progress */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="65" cy="65" r="54" fill="none"
              stroke={current.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (pct / 100) * circumference}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{mins}:{secs}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{current.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button onClick={reset} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px 14px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <RotateCcw size={18} />
        </button>
        <button onClick={() => setIsRunning(r => !r)} style={{
          background: isRunning ? '#ef4444' : 'white', border: 'none', borderRadius: '10px',
          padding: '10px 32px', color: isRunning ? 'white' : '#1e1b4b',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
        }}>
          {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {timeLeft === total ? 'Start' : 'Resume'}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Study Tips Widget ─────────────────────────────────────────────────────────
const TIPS = [
  { icon: '🧠', tip: "Use active recall — test yourself instead of re-reading. It's 2× more effective." },
  { icon: '📅', tip: 'Space your study sessions across multiple days to lock in long-term memory.' },
  { icon: '🎯', tip: 'Study the hardest topic first when your brain is freshest.' },
  { icon: '💧', tip: 'Stay hydrated! Even mild dehydration reduces concentration by up to 20%.' },
  { icon: '✍️', tip: 'Explain concepts out loud (Feynman Technique) to identify gaps quickly.' },
  { icon: '🛌', tip: 'Sleep consolidates memory. A well-rested brain retains 40% more.' },
  { icon: '⏰', tip: 'Use the Pomodoro technique: 25 min focus + 5 min break = peak productivity.' },
  { icon: '📵', tip: 'Put your phone in another room. Even its presence reduces focus.' },
];

function StudyTip() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [visible, setVisible] = useState(true);

  const next = () => {
    setVisible(false);
    setTimeout(() => {
      setIdx(i => (i + 1) % TIPS.length);
      setVisible(true);
    }, 200);
  };

  const tip = TIPS[idx];
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: '#fbbf24', padding: '8px', borderRadius: '10px', fontSize: '18px', lineHeight: 1 }}>
          <Lightbulb size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Tip</span>
      </div>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: '1rem', color: '#78350f', lineHeight: 1.6, fontWeight: 500, flex: 1 }}>
            <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{tip.icon}</span>{tip.tip}
          </motion.p>
        )}
      </AnimatePresence>
      <button onClick={next} style={{ background: 'none', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', transition: 'all 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background = '#fde68a'}
        onMouseOut={e => e.currentTarget.style.background = 'none'}
      >
        Next Tip <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premiumInterestStatus, setPremiumInterestStatus] = useState('idle');
  const [premiumMsg, setPremiumMsg] = useState('');
  const [premiumInterestInput, setPremiumInterestInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(data || { first_name: user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student', trials_remaining: 3, total_free_trials: 3, trials_used: 0 });
    } catch {
      setProfile({ first_name: user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student', trials_remaining: 3, total_free_trials: 3, trials_used: 0 });
    }
    if (session?.access_token) {
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (r.ok) { const d = await r.json(); if (d.success) setRecentPlans(d.plans || []); }
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);
  useEffect(() => { if (profile?.trials_remaining === 0) trackEvent('subscription_view'); }, [profile]);

  const handlePremiumSubmit = async (e) => {
    e.preventDefault();
    trackEvent('subscription_interest_submit');
    try {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ message: premiumInterestInput })
      });
      const d = await r.json();
      if (d.success) setPremiumInterestStatus('success');
      else setPremiumMsg(d.message || 'Something went wrong.');
    } catch { setPremiumMsg('Error submitting request.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '16px' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid #e0e7ff', borderTopColor: 'var(--primary-main)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading your dashboard…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalPlans = recentPlans.length;
  const completedPlans = recentPlans.filter(p => p.status === 'completed').length;
  const trialsUsed = profile?.trials_used ?? 0;
  const trialsLeft = profile?.trials_remaining ?? 3;
  const progressPct = (trialsLeft / (profile?.total_free_trials ?? 3)) * 100;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* ── Hero Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%)', color: 'white', padding: '48px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-40%', left: '5%', width: '300px', height: '300px', background: 'rgba(99,102,241,0.2)', borderRadius: '50%', filter: 'blur(50px)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '8px', fontWeight: 500 }}>{greeting} {greetingEmoji}</p>
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, marginBottom: '12px', color: 'white' }}>
                Welcome back, {profile?.first_name || 'Student'}!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '480px' }}>
                You're on track. Keep the momentum going — your next study plan is one click away.
              </p>
            </motion.div>
            <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', paddingBottom: '80px' }}>
        {/* ── Stats Row ── */}
        <div className="dash-stats-row">
          {[
            { label: 'Plans Created', value: totalPlans, icon: <BookOpen size={20} />, color: '#4f46e5', bg: '#eef2ff' },
            { label: 'Completed', value: completedPlans, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Trials Used', value: trialsUsed, icon: <Zap size={20} />, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Trials Left', value: trialsLeft, icon: <Target size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="dash-grid-2" style={{ marginBottom: '28px' }}>
          {/* Trial & CTA Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card" style={{ background: 'var(--gradient-primary)', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                <Zap size={22} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', margin: 0 }}>Free Trials Remaining</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>Each trial = 1 AI study plan</p>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                {trialsLeft} <span style={{ fontSize: '1.25rem', opacity: 0.7, fontWeight: 500 }}>/ {profile?.total_free_trials ?? 3}</span>
              </div>
              <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'white', borderRadius: '6px', transition: 'width 1s ease' }} />
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.875rem', opacity: 0.85 }}>
                {trialsLeft > 0 ? `You have ${trialsLeft} free AI plan generation${trialsLeft !== 1 ? 's' : ''} left.` : 'All free trials used. Upgrade for more!'}
              </p>
            </div>
            {trialsLeft > 0 ? (
              <Link to="/planner" style={{ background: 'white', color: 'var(--primary-main)', fontWeight: 700, padding: '14px', borderRadius: '10px', textAlign: 'center', display: 'block', textDecoration: 'none', transition: 'all 0.2s', fontSize: '1rem' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                ✨ Create My Study Plan
              </Link>
            ) : (
              <Link to="/pricing" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, padding: '14px', borderRadius: '10px', textAlign: 'center', display: 'block', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
                🔓 Upgrade to Premium
              </Link>
            )}
          </motion.div>

          {/* Pomodoro Timer */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <PomodoroTimer />
          </motion.div>
        </div>

        {/* ── Study Tip ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginBottom: '28px' }}>
          <StudyTip />
        </motion.div>

        {/* ── Recent Plans ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)' }}>Recent Study Plans</h2>
            {recentPlans.length > 0 && (
              <Link to="/planner" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                + New Plan <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentPlans.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', background: 'white' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94a3b8' }}>
                <Calendar size={36} />
              </div>
              <h3 style={{ marginBottom: '10px', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>No plans yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '320px', margin: '0 auto 28px' }}>
                Generate your first personalized AI study plan in under 2 minutes!
              </p>
              <Link to="/planner" className="btn btn-primary" style={{ gap: '8px' }}>
                <Zap size={18} /> Create Your First Plan
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {recentPlans.map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/study-plan/${plan.id}`} className="card" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', textDecoration: 'none', color: 'inherit',
                    flexWrap: 'wrap', gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', color: 'var(--primary-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)', fontSize: '1rem' }}>{plan.title || 'Study Plan'}</h3>
                        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                          {plan.goal && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' }}>{plan.goal}</span>}
                          {plan.duration_value && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' }}>{plan.duration_value} {plan.duration_unit}</span>}
                          <span style={{ color: '#94a3b8' }}>{new Date(plan.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                        background: plan.status === 'completed' ? '#ecfdf5' : plan.status === 'failed' ? '#fef2f2' : '#fffbeb',
                        color: plan.status === 'completed' ? '#059669' : plan.status === 'failed' ? '#dc2626' : '#d97706',
                        textTransform: 'capitalize',
                      }}>
                        {plan.status === 'completed' ? '✓ ' : ''}{plan.status}
                      </span>
                      <ArrowRight size={18} color="#94a3b8" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Premium Banner ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginTop: '28px' }}>
          {profile?.trials_remaining === 0 ? (
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', color: 'white', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '6px', color: 'white' }}>🚀 Unlock StudySync AI Premium</h2>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.95rem' }}>You've used all 3 free trials. Register your interest to be notified when Premium launches.</p>
                </div>
                {premiumInterestStatus === 'idle' && (
                  <button onClick={() => { trackEvent('subscription_interest_click'); setPremiumInterestStatus('form'); }} style={{ background: 'white', color: '#4f46e5', fontWeight: 700, padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                    I'm Interested →
                  </button>
                )}
                {premiumInterestStatus === 'form' && (
                  <form onSubmit={handlePremiumSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0 }}>Add an optional message:</p>
                    <input type="text" value={premiumInterestInput} onChange={e => setPremiumInterestInput(e.target.value)} placeholder="Optional message..." style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }} />
                    <button type="submit" style={{ background: 'white', color: '#4f46e5', fontWeight: 700, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Submit Interest</button>
                    {premiumMsg && <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{premiumMsg}</span>}
                  </form>
                )}
                {premiumInterestStatus === 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600 }}>
                    <CheckCircle size={22} /> Registered! We'll be in touch.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ background: 'linear-gradient(to right, #f8fafc, white)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', padding: '24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={24} />
                </div>
                <div>
                  <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>Loving StudySync AI?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Upgrade to Premium for unlimited plans, advanced scheduling & priority AI.</p>
                </div>
              </div>
              <Link to="/pricing" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>Explore Premium →</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
