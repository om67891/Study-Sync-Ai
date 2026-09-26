import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Target, CheckCircle2, Star } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero container">
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-main)', borderRadius: '24px', fontWeight: '600', marginBottom: '24px', fontSize: '0.875rem' }}>
          Plan Better. Study Smarter.
        </div>
        <h1>Your AI-Powered <span className="text-gradient">Study Schedule</span></h1>
        <p>Get a personalized study schedule generated around YOUR time, subjects and goals. Maximize your exam and placement preparation.</p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }} onClick={() => trackEvent('claim_offer_click', { cta_name: 'claim_3_free_trials', cta_location: 'hero', page_name: 'home' })}>Claim Your 3 Free Trials</Link>
          <Link to="/how-it-works" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>See How It Works</Link>
        </div>
        
        {/* Placeholder for dashboard preview image */}
        <div style={{ marginTop: '64px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-hover)', border: '1px solid rgba(0,0,0,0.05)', background: 'white', padding: '8px' }}>
           <div style={{ background: 'var(--bg-main)', borderRadius: '12px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
             Product Preview Image
           </div>
        </div>
      </section>

      {/* Product Introduction / Key Features */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '64px', maxWidth: '600px', margin: '0 auto 64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>Everything you need to succeed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>StudySync AI understands your unique learning needs and creates a highly optimized plan that adapts to your life.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>Time-Based Scheduling</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We analyze your daily availability and preferred study timings to create a schedule you can actually stick to.</p>
            </div>
            
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Target size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>Goal-Oriented Planning</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Whether it's a university exam, placement prep, or GATE/CAT, your schedule is tailored to your specific end goal.</p>
            </div>
            
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>Subject-Wise Focus</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Balance multiple subjects effortlessly. Our AI allocates time based on your current proficiency in each topic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>How StudySync AI Works</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { step: '1', title: 'Answer Questions', desc: 'Tell us about your subjects, goals, and daily free time.' },
              { step: '2', title: 'AI Generation', desc: 'Our advanced LLM processes your unique requirements.' },
              { step: '3', title: 'Get Your Plan', desc: 'Receive a personalized, day-by-day study schedule.' },
              { step: '4', title: 'Download PDF', desc: 'Export your plan to a beautiful PDF and start studying.' }
            ].map((item) => (
              <div key={item.step} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {item.step}
                </div>
                <h3 style={{ marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>Loved by Students</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '16px' }}>
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontStyle: 'italic' }}>
                  "StudySync AI completely changed how I prepare for my college exams. The schedule was so realistic and I actually stuck to it!"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)' }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem' }}>Student {i}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Computer Science Major</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ background: 'var(--primary-dark)', borderRadius: '24px', padding: '80px 40px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.2) 100%)' }}></div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '3rem', marginBottom: '24px', color: 'white' }}>Ready to study smarter?</h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '40px', color: 'rgba(255,255,255,0.8)' }}>
                Stop wasting time planning and start learning. Claim your free AI-generated schedules today.
              </p>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem', background: 'white', color: 'var(--primary-dark)' }} onClick={() => trackEvent('claim_offer_click', { cta_name: 'claim_3_free_trials', cta_location: 'bottom', page_name: 'home' })}>Claim Your 3 Free Trials</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
