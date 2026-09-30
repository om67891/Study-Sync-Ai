import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Download, Star, CheckCircle, ArrowLeft, Clock, BookOpen, Target } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { motion } from 'framer-motion';

function StudyPlanView() {
  const { id } = useParams();
  const { session } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Feedback state
  const [feedback, setFeedback] = useState({
    rating: 0,
    was_useful: true,
    difficulty_appropriate: true,
    time_allocation_realistic: true,
    comments: ''
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans/${id}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load study plan');
        }
        
        setPlan(data.plan);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchPlan();
    }
  }, [id, session]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studysync-ai-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      trackEvent('pdf_download', { plan_type: plan.goal });
    } catch (err) {
      alert(err.message);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (feedback.rating === 0) {
      setFeedbackMsg('Please select a star rating.');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(feedback)
      });
      
      const data = await response.json();
      if (data.success) {
        setFeedbackSubmitted(true);
        setFeedbackMsg(data.message);
        trackEvent('feedback_submit', { rating: feedback.rating });
      } else {
        setFeedbackMsg(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setFeedbackMsg('An error occurred. Please try again.');
    }
  };

  if (loading) return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary-main)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>Loading your premium study plan...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (error) return <div className="container section text-center text-red-500">{error}</div>;
  if (!plan) return <div className="container section text-center">Plan not found</div>;

  const schedule = plan.plan_data.schedule || [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Dynamic Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)', 
        padding: '60px 0 100px 0',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'rgba(99,102,241,0.3)', borderRadius: '50%', filter: 'blur(30px)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='white'} onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{plan.title}</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500 }}>
                <Target size={18} /> {plan.goal || 'General Study'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500 }}>
                <Clock size={18} /> {plan.duration_value} {plan.duration_unit}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              background: 'white', color: 'var(--primary-main)', 
              border: 'none', padding: '14px 28px', borderRadius: '12px', 
              fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s'
            }}
          >
            <Download size={20} /> Export to PDF
          </motion.button>
        </div>

        {/* Schedule Timeline */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          style={{ maxWidth: '900px', margin: '0 auto 60px' }}
        >
          {schedule.map((day, index) => (
            <motion.div key={index} variants={itemVariants} style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
              {/* Left Column: Date */}
              <div style={{ flex: '0 0 140px', textAlign: 'right', paddingTop: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>{day.day}</h3>
                {day.date && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 500 }}>{day.date}</p>}
              </div>
              
              {/* Middle Column: Timeline Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-main)', border: '4px solid #e0e7ff', zIndex: 2 }} />
                {index < schedule.length - 1 && (
                  <div style={{ width: '2px', height: '100%', background: 'linear-gradient(to bottom, #e0e7ff, #c7d2fe)', marginTop: '4px', borderRadius: '2px' }} />
                )}
              </div>
              
              {/* Right Column: Activities */}
              <div style={{ flex: '1', display: 'grid', gap: '20px', paddingBottom: '32px' }}>
                {day.activities && day.activities.map((activity, actIdx) => (
                  <motion.div 
                    key={actIdx} 
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
                    style={{ 
                      background: 'white', 
                      padding: '24px', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
                      borderLeft: '4px solid var(--primary-main)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px', color: 'var(--primary-main)' }}>
                          <BookOpen size={20} />
                        </div>
                        <strong style={{ color: 'var(--primary-dark)', fontSize: '1.15rem' }}>{activity.subject}</strong>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)', background: '#eef2ff', padding: '6px 12px', borderRadius: '20px' }}>
                        {activity.duration}
                      </span>
                    </div>
                    {activity.topic && (
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%' }} />
                        {activity.topic}
                      </div>
                    )}
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Feedback Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '8px' }}>How did we do?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Your feedback trains our AI to generate even better schedules.</p>
          </div>

          {feedbackSubmitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '32px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#065f46', fontSize: '1.25rem', marginBottom: '8px' }}>Thank you!</h3>
              <p style={{ color: '#047857', fontWeight: 500, margin: 0 }}>{feedbackMsg}</p>
            </motion.div>
          ) : (
            <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {feedbackMsg && <p style={{ color: '#ef4444', textAlign: 'center', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontWeight: 500 }}>{feedbackMsg}</p>}
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate this plan</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.div key={star} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Star 
                        size={40} 
                        onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                        fill={feedback.rating >= star ? '#fbbf24' : 'none'}
                        color={feedback.rating >= star ? '#fbbf24' : '#cbd5e1'}
                        style={{ cursor: 'pointer', transition: 'color 0.2s', filter: feedback.rating >= star ? 'drop-shadow(0 4px 6px rgba(251, 191, 36, 0.2))' : 'none' }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {[
                  { key: 'was_useful', label: 'Was this schedule useful?' },
                  { key: 'difficulty_appropriate', label: 'Is the difficulty appropriate?' },
                  { key: 'time_allocation_realistic', label: 'Are the time allocations realistic?' }
                ].map(q => (
                  <div key={q.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{q.label}</span>
                    <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                      <button type="button" onClick={() => setFeedback(p => ({...p, [q.key]: true}))} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: feedback[q.key] ? 'white' : 'transparent', color: feedback[q.key] ? 'var(--primary-main)' : '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: feedback[q.key] ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Yes</button>
                      <button type="button" onClick={() => setFeedback(p => ({...p, [q.key]: false}))} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: !feedback[q.key] ? 'white' : 'transparent', color: !feedback[q.key] ? '#ef4444' : '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: !feedback[q.key] ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>No</button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#334155' }}>Additional Comments <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span></label>
                <textarea 
                  value={feedback.comments}
                  onChange={e => setFeedback(p => ({...p, comments: e.target.value}))}
                  maxLength="500"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem', color: '#334155', transition: 'border-color 0.2s' }}
                  placeholder="Tell us what you liked or how we can improve..."
                  onFocus={e => e.target.style.borderColor = 'var(--primary-main)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                style={{ width: '100%', padding: '16px', background: 'var(--primary-main)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}
              >
                Submit Feedback
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default StudyPlanView;
