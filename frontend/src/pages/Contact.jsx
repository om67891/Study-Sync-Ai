import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

function Contact() {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '16px' }}>
              <Mail className="w-8 h-8" style={{ color: 'var(--primary-main)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Email Support</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Our team typically responds within 24 hours.</p>
            <a href="mailto:support@studysyncai.com" style={{ color: 'var(--primary-main)', fontWeight: 600 }}>support@studysyncai.com</a>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '16px' }}>
              <MessageSquare className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Feedback</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Have a feature request or found a bug?</p>
            <span style={{ color: 'var(--primary-main)', fontWeight: 600 }}>Use the in-app feedback tool</span>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '16px' }}>
              <MapPin className="w-8 h-8" style={{ color: 'var(--accent-violet)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Headquarters</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Built with passion for students everywhere.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;
