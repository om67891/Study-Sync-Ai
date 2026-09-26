import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Download, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

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

  if (loading) return <div className="container section text-center">Loading study plan...</div>;
  if (error) return <div className="container section text-center text-red-500">{error}</div>;
  if (!plan) return <div className="container section text-center">Plan not found</div>;

  const schedule = plan.plan_data.schedule || [];

  return (
    <div className="container section">
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 500 }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--primary-dark)' }}>{plan.title}</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Goal: {plan.goal} • Duration: {plan.duration_value} {plan.duration_unit}</p>
          </div>
          <button onClick={handleDownloadPDF} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} /> Download PDF
          </button>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '48px' }}>
          <div style={{ background: 'var(--primary-dark)', color: 'white', padding: '24px 32px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={24} /> Study Schedule
            </h2>
          </div>
          <div style={{ padding: '32px' }}>
            {schedule.map((day, index) => (
              <div key={index} style={{ marginBottom: index === schedule.length - 1 ? 0 : '32px', borderBottom: index === schedule.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', paddingBottom: index === schedule.length - 1 ? 0 : '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--primary-main)' }}>{day.day}</span> 
                  {day.date && <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{day.date}</span>}
                </h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {day.activities && day.activities.map((activity, actIdx) => (
                    <div key={actIdx} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--primary-dark)' }}>{activity.subject}</strong>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)', background: 'rgba(79, 70, 229, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{activity.duration}</span>
                      </div>
                      {activity.topic && <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '4px' }}>Topic: {activity.topic}</div>}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>{activity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>How was your study plan?</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your feedback helps us improve our AI generations.</p>
          </div>

          {feedbackSubmitted ? (
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#047857', fontWeight: 500 }}>{feedbackMsg}</p>
            </div>
          ) : (
            <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px', margin: '0 auto' }}>
              {feedbackMsg && <p style={{ color: '#b91c1c', textAlign: 'center' }}>{feedbackMsg}</p>}
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={32} 
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      fill={feedback.rating >= star ? '#fbbf24' : 'none'}
                      color={feedback.rating >= star ? '#fbbf24' : '#cbd5e1'}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Was this schedule useful?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setFeedback(p => ({...p, was_useful: true}))} className={`btn ${feedback.was_useful ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>Yes</button>
                  <button type="button" onClick={() => setFeedback(p => ({...p, was_useful: false}))} className={`btn ${!feedback.was_useful ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>No</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Was the difficulty appropriate?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setFeedback(p => ({...p, difficulty_appropriate: true}))} className={`btn ${feedback.difficulty_appropriate ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>Yes</button>
                  <button type="button" onClick={() => setFeedback(p => ({...p, difficulty_appropriate: false}))} className={`btn ${!feedback.difficulty_appropriate ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>No</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Time allocation realistic?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setFeedback(p => ({...p, time_allocation_realistic: true}))} className={`btn ${feedback.time_allocation_realistic ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>Yes</button>
                  <button type="button" onClick={() => setFeedback(p => ({...p, time_allocation_realistic: false}))} className={`btn ${!feedback.time_allocation_realistic ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>No</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Optional comments</label>
                <textarea 
                  value={feedback.comments}
                  onChange={e => setFeedback(p => ({...p, comments: e.target.value}))}
                  maxLength="500"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Tell us what you liked or how we can improve..."
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Feedback</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyPlanView;
