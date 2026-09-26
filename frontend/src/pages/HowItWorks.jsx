import React from 'react';
import { ClipboardList, Cpu, CalendarCheck, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

function HowItWorks() {
  const steps = [
    {
      icon: <ClipboardList className="w-10 h-10" style={{ color: 'var(--primary-main)' }} />,
      title: "1. Tell us your goals",
      description: "Sign up and fill out a quick questionnaire. Tell us what exams you are preparing for, your available study hours, your preferred study times, and the subjects you need to cover."
    },
    {
      icon: <Cpu className="w-10 h-10" style={{ color: 'var(--accent-cyan)' }} />,
      title: "2. AI Processing",
      description: "Our advanced Groq-powered AI engine analyzes your input. It balances the workload, schedules regular breaks, and creates a realistic pace that avoids burnout."
    },
    {
      icon: <CalendarCheck className="w-10 h-10" style={{ color: 'var(--accent-violet)' }} />,
      title: "3. Review your plan",
      description: "Within seconds, you'll receive a detailed, day-by-day study calendar. You can review the daily breakdown, the subjects covered, and the estimated hours."
    },
    {
      icon: <Download className="w-10 h-10" style={{ color: 'var(--primary-main)' }} />,
      title: "4. Export and Execute",
      description: "Download your personalized study schedule as a beautifully formatted PDF. Print it out, stick it on your wall, and start crushing your academic goals."
    }
  ];

  return (
    <div className="how-it-works-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            How <span className="text-gradient">StudySync AI</span> Works
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            A simple, four-step process to transform your academic life from chaotic to perfectly organized.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '800px', margin: '0 auto' }}>
          {steps.map((step, index) => (
            <div key={index} className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '16px', flexShrink: 0 }}>
                {step.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container text-center section">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Stop planning. Start studying.</h2>
        <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
          Generate Your First Plan
        </Link>
      </div>
    </div>
  );
}

export default HowItWorks;
