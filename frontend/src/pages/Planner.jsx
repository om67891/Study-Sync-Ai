import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Calendar } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';

const steps = [
  { id: 1, title: 'Study Goal' },
  { id: 2, title: 'Subjects' },
  { id: 3, title: 'Priority Subjects' },
  { id: 4, title: 'Knowledge Level' },
  { id: 5, title: 'Study Duration' },
  { id: 6, title: 'Daily Study Time' },
  { id: 7, title: 'Preferred Study Time' },
  { id: 8, title: 'Available Days' },
  { id: 9, title: 'Learning Preferences' },
  { id: 10, title: 'Target Date' },
  { id: 11, title: 'Additional Requirements' },
];

function Planner() {
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMsg, setGeneratingMsg] = useState('Building your personalized plan...');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    goal: '',
    customGoal: '',
    subjects: [],
    customSubject: '',
    prioritySubjects: [],
    knowledgeLevel: '',
    durationValue: 1,
    durationUnit: 'Weeks',
    dailyStudyHours: 2,
    preferredStudyTimes: [],
    availableDays: [],
    learningPreferences: [],
    targetDate: '',
    additionalRequirements: ''
  });

  React.useEffect(() => {
    trackEvent('planner_start');
  }, []);

  const handleNext = () => {
    setError('');
    
    // Validation
    if (currentStep === 1 && !formData.goal) {
      setError('Please select a goal');
      return;
    }
    if (currentStep === 1 && formData.goal === 'Other' && !formData.customGoal.trim()) {
      setError('Please tell us about your goal');
      return;
    }
    if (currentStep === 2 && formData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }
    if (currentStep === 3 && formData.prioritySubjects.length === 0) {
      setError('Please select at least one priority subject');
      return;
    }
    if (currentStep === 4 && !formData.knowledgeLevel) {
      setError('Please select your current knowledge level');
      return;
    }
    if (currentStep === 5 && (formData.durationValue <= 0 || !formData.durationValue)) {
      setError('Please enter a valid study duration');
      return;
    }
    if (currentStep === 6 && (formData.dailyStudyHours <= 0 || !formData.dailyStudyHours)) {
      setError('Please enter valid daily study hours');
      return;
    }
    if (currentStep === 7 && formData.preferredStudyTimes.length === 0) {
      setError('Please select at least one preferred study time');
      return;
    }
    if (currentStep === 8 && formData.availableDays.length === 0) {
      setError('Please select at least one available day');
      return;
    }
    if (currentStep === 9 && formData.learningPreferences.length === 0) {
      setError('Please select at least one learning preference');
      return;
    }
    if (currentStep === 10 && formData.targetDate) {
      const selected = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) {
        setError('Target date cannot be in the past');
        return;
      }
    }

    if (currentStep < steps.length) {
      trackEvent('planner_step_complete', { step_number: currentStep, step_name: steps[currentStep - 1].title });
      setCurrentStep(curr => curr + 1);
    } else {
      trackEvent('planner_submit');
      generatePlan();
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const toggleArrayItem = (arrayName, item) => {
    setFormData(prev => {
      const array = prev[arrayName];
      if (array.includes(item)) {
        return { ...prev, [arrayName]: array.filter(i => i !== item) };
      } else {
        return { ...prev, [arrayName]: [...array, item] };
      }
    });
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setGeneratingMsg('Waking up AI engine...');
    setError('');
    trackEvent('schedule_generation_start');

    // Show progressive messages to indicate backend cold-start
    const msgTimer1 = setTimeout(() => setGeneratingMsg('Building your personalized plan...'), 8000);
    const msgTimer2 = setTimeout(() => setGeneratingMsg('Almost there, AI is generating your schedule...'), 20000);
    const msgTimer3 = setTimeout(() => setGeneratingMsg('This is taking a bit longer than usual, please wait...'), 40000);

    try {
      if (!session?.access_token) {
        throw new Error('You must be logged in to generate a plan.');
      }

      // Always refresh the session before making the API call to prevent
      // "Invalid token" errors from expired JWTs
      let accessToken = session.access_token;
      try {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token) {
          accessToken = refreshData.session.access_token;
        }
      } catch (refreshErr) {
        console.warn('Session refresh failed, using existing token');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && result.code === 'NO_TRIALS_REMAINING') {
          trackEvent('trial_exhausted_blocked');
          throw new Error('You have used all your free study-plan trials. Please upgrade to Premium.');
        }
        throw new Error(result.message || 'Failed to generate study plan');
      }

      trackEvent('schedule_generation_success');

      if (result.data?.trial?.trials_remaining === 0) {
        trackEvent('trial_exhausted', { total_trials: result.data.trial.total_free_trials });
      }

      navigate(`/study-plan/${result.data.plan_id}`);
    } catch (err) {
      trackEvent('schedule_generation_failure', { error_code: err.message });
      setError(err.message || 'An error occurred while generating your plan. Please try again.');
    } finally {
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      clearTimeout(msgTimer3);
      setIsGenerating(false);
    }
  };

  const renderOption = (label, isSelected, onClick) => (
    <div 
      onClick={onClick}
      style={{
        padding: '16px',
        border: `2px solid ${isSelected ? 'var(--primary-main)' : 'rgba(0,0,0,0.05)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s',
        marginBottom: '12px'
      }}
    >
      <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
        {label}
      </span>
      {isSelected && <Check size={20} color="var(--primary-main)" />}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ marginBottom: '24px' }}>What do you want to achieve?</h2>
            {['Placement Preparation', 'Competitive Exam', 'College Exam', 'Skill Development', 'Interview Preparation', 'Certification Preparation', 'Personal Learning', 'Other'].map(goal => 
              renderOption(goal, formData.goal === goal, () => setFormData({ ...formData, goal }))
            )}
            {formData.goal === 'Other' && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Tell us about your goal</label>
                <input 
                  type="text" 
                  value={formData.customGoal} 
                  onChange={e => setFormData({ ...formData, customGoal: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  placeholder="E.g., Learn Spanish for my trip"
                />
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>What subjects or skills do you want to study?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select all that apply.</p>
            {['Data Structures & Algorithms', 'Python', 'Java', 'JavaScript', 'React', 'Machine Learning', 'Artificial Intelligence', 'Database Management', 'Computer Networks', 'Operating Systems', 'Aptitude', 'Mathematics', 'Communication Skills'].map(subject => 
              renderOption(subject, formData.subjects.includes(subject), () => toggleArrayItem('subjects', subject))
            )}
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                value={formData.customSubject} 
                onChange={e => setFormData({ ...formData, customSubject: e.target.value })}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                placeholder="Add custom subject"
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  if (formData.customSubject.trim() && !formData.subjects.includes(formData.customSubject.trim())) {
                    setFormData(prev => ({ ...prev, subjects: [...prev.subjects, prev.customSubject.trim()], customSubject: '' }));
                  }
                }}
              >
                Add
              </button>
            </div>
            {formData.subjects.filter(s => !['Data Structures & Algorithms', 'Python', 'Java', 'JavaScript', 'React', 'Machine Learning', 'Artificial Intelligence', 'Database Management', 'Computer Networks', 'Operating Systems', 'Aptitude', 'Mathematics', 'Communication Skills'].includes(s)).map(subject => 
              <div key={subject} style={{ marginTop: '12px' }}>
                 {renderOption(subject, true, () => toggleArrayItem('subjects', subject))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Which subjects should receive the most attention?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>These subjects will receive additional study time in your plan.</p>
            {formData.subjects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>You haven't selected any subjects yet.</p>}
            {formData.subjects.map(subject => 
              renderOption(subject, formData.prioritySubjects.includes(subject), () => toggleArrayItem('prioritySubjects', subject))
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h2 style={{ marginBottom: '24px' }}>What is your current knowledge level overall?</h2>
            {['Beginner', 'Basic', 'Intermediate', 'Advanced'].map(level => 
              renderOption(level, formData.knowledgeLevel === level, () => setFormData({ ...formData, knowledgeLevel: level }))
            )}
          </div>
        );
      case 5:
        return (
          <div>
            <h2 style={{ marginBottom: '24px' }}>How long do you want to follow this study plan?</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="number" 
                min="1"
                value={formData.durationValue} 
                onChange={e => setFormData({ ...formData, durationValue: parseInt(e.target.value) || '' })}
                style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1.125rem' }}
              />
              <select 
                value={formData.durationUnit} 
                onChange={e => setFormData({ ...formData, durationUnit: e.target.value })}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1.125rem', flex: 1, backgroundColor: 'white' }}
              >
                <option value="Days">Days</option>
                <option value="Weeks">Weeks</option>
                <option value="Months">Months</option>
              </select>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 style={{ marginBottom: '24px' }}>How much time can you study each day?</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="number" 
                min="0.5"
                step="0.5"
                value={formData.dailyStudyHours} 
                onChange={e => setFormData({ ...formData, dailyStudyHours: parseFloat(e.target.value) || '' })}
                style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1.125rem' }}
              />
              <span style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Hours</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '24px' }}>
              {[1, 2, 3, 4, 5, 6].map(hours => (
                <button 
                  key={hours}
                  onClick={() => setFormData({ ...formData, dailyStudyHours: hours })}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', background: formData.dailyStudyHours === hours ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-main)', color: formData.dailyStudyHours === hours ? 'var(--primary-main)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: formData.dailyStudyHours === hours ? 600 : 400, transition: 'all 0.2s' }}
                >
                  {hours} {hours === 1 ? 'Hour' : 'Hours'}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>When do you prefer to study?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select all that apply.</p>
            {['Early Morning (5 AM - 8 AM)', 'Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)', 'Night (8 PM - 12 AM)', 'Late Night (12 AM - 5 AM)'].map(time => 
              renderOption(time.split(' (')[0], formData.preferredStudyTimes.includes(time.split(' (')[0]), () => toggleArrayItem('preferredStudyTimes', time.split(' (')[0]))
            )}
          </div>
        );
      case 8:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Which days are you available for studying?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select all that apply.</p>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => 
              renderOption(day, formData.availableDays.includes(day), () => toggleArrayItem('availableDays', day))
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setFormData({ ...formData, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] })}
              >Weekdays</button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setFormData({ ...formData, availableDays: ['Saturday', 'Sunday'] })}
              >Weekends</button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setFormData({ ...formData, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })}
              >Everyday</button>
            </div>
          </div>
        );
      case 9:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>How do you prefer to learn?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select all that apply.</p>
            {['Video Lectures', 'Reading', 'Practice Problems', 'Projects', 'Flashcards', 'Revision', 'Mock Tests', 'Hands-on Coding', 'Notes'].map(pref => 
              renderOption(pref, formData.learningPreferences.includes(pref), () => toggleArrayItem('learningPreferences', pref))
            )}
          </div>
        );
      case 10:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Do you have a target date?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Optional: If you are preparing for an exam or interview on a specific date.</p>
            
            <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Target Date (Optional)</label>
              <input 
                type="date" 
                value={formData.targetDate} 
                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
              />
            </div>
            
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => setFormData({ ...formData, targetDate: '' })}
            >
              No specific target date
            </button>
          </div>
        );
      case 11:
        return (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Anything else we should consider?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Optional: Any specific instructions or constraints.</p>
            <textarea 
              value={formData.additionalRequirements} 
              onChange={e => setFormData({ ...formData, additionalRequirements: e.target.value })}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '160px', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Example: I have college from 9 AM to 4 PM, so schedule most sessions after 6 PM."
              maxLength="1000"
            ></textarea>
            <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '8px' }}>
              {formData.additionalRequirements.length} / 1000 characters
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <div className="container section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid var(--bg-main)', borderTopColor: 'var(--primary-main)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>{generatingMsg}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Our AI is analyzing your goals and availability. The first request may take up to 60 seconds if the server is waking up.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px' }}>⚡ Do not close this page</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Progress */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)', marginBottom: '12px' }}>
            <span>Step {currentStep} of {steps.length}</span>
            <span>{steps[currentStep - 1].title}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(currentStep / steps.length) * 100}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {renderStep()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '24px', marginTop: '32px' }}>
            <button 
              onClick={handleBack}
              style={{ background: 'none', border: 'none', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', opacity: currentStep === 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: 'var(--text-secondary)', padding: '8px 0' }}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button 
              onClick={handleNext}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {currentStep === steps.length ? 'Generate Plan' : 'Continue'} {currentStep !== steps.length && <ArrowRight size={18} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Planner;
