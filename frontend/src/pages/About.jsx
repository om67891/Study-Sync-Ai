import React from 'react';
import { Users, Lightbulb, Target } from 'lucide-react';

function About() {
  return (
    <div className="about-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            About <span className="text-gradient">StudySync AI</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            We're on a mission to democratize effective study habits through the power of artificial intelligence.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Our Story</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '24px' }}>
            StudySync AI began as a final-year college project born out of a simple frustration: students spend too much time planning how to study, and not enough time actually studying.
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '48px' }}>
            We realized that while there are countless generic study tips out there, what students really need is a personalized, realistic schedule that adapts to their unique constraints. By leveraging cutting-edge Large Language Models (LLMs), we built a platform that instantly generates optimized study plans tailored to each individual's goals and availability.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="card">
              <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', width: 'fit-content', marginBottom: '16px' }}>
                <Lightbulb className="w-6 h-6 text-indigo-500" style={{ color: 'var(--primary-main)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-secondary)' }}>To become the global standard for AI-assisted academic planning and student success.</p>
            </div>
            <div className="card">
              <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', width: 'fit-content', marginBottom: '16px' }}>
                <Target className="w-6 h-6 text-cyan-500" style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-secondary)' }}>To eliminate academic burnout by providing balanced, achievable, and highly personalized study schedules.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
