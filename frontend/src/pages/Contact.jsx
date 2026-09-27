import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill in all required fields.');
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while sending your message.');
      setStatus('error');
    }
  };

  return (
    <div className="contact-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            Get in <span className="text-gradient">touch.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Have questions about StudySync AI or need support? We're here to help.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <Mail className="w-6 h-6" style={{ color: 'var(--primary-main)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>Email Support</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem' }}>Our team typically responds within 24 hours.</p>
                <a href="mailto:support@studysyncai.com" style={{ color: 'var(--primary-main)', fontWeight: 600 }}>support@studysyncai.com</a>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <MapPin className="w-6 h-6" style={{ color: 'var(--accent-violet)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>Headquarters</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>San Francisco, CA<br/>Built with passion for students everywhere.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '24px' }}>Send us a message</h2>
            
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ marginBottom: '8px' }}>Message sent!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Thanks for reaching out. We'll get back to you shortly.</p>
                <button className="btn btn-secondary" onClick={() => setStatus('idle')}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {status === 'error' && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} required />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '120px', resize: 'vertical' }} required></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : (
                    <>
                      Send Message <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;
