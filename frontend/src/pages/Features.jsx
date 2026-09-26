import React from 'react';
import { BookOpen, Calendar, Target, Clock, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function Features() {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-indigo-500" style={{ color: 'var(--primary-main)' }} />,
      title: "Smart Scheduling",
      description: "Our AI engine analyzes your subjects, deadlines, and preferred study hours to generate an optimized, realistic schedule."
    },
    {
      icon: <Zap className="w-8 h-8 text-cyan-500" style={{ color: 'var(--accent-cyan)' }} />,
      title: "Instant Generation",
      description: "Get a comprehensive 30-day or 90-day study plan in seconds. No more spending hours trying to balance your calendar."
    },
    {
      icon: <Target className="w-8 h-8 text-violet-500" style={{ color: 'var(--accent-violet)' }} />,
      title: "Goal Oriented",
      description: "Whether you're prepping for finals, placements, or standard exams, the schedule adapts to your specific academic goals."
    },
    {
      icon: <Clock className="w-8 h-8" style={{ color: 'var(--primary-main)' }} />,
      title: "Time Management",
      description: "Built-in break allocations and realistic study blocks ensure you don't burn out while maximizing retention."
    },
    {
      icon: <BookOpen className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} />,
      title: "Multi-Subject Support",
      description: "Input up to 5 subjects at once. The AI automatically distributes them based on difficulty and your current proficiency."
    },
    {
      icon: <Settings className="w-8 h-8" style={{ color: 'var(--accent-violet)' }} />,
      title: "Highly Customizable",
      description: "Adjust daily study hours, preferred times of day, and pacing to match your exact lifestyle and needs."
    }
  ];

  return (
    <div className="features-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            Everything you need to <span className="text-gradient">succeed.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            StudySync AI combines cutting-edge LLM technology with proven study methodologies to create schedules that actually work.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {features.map((feature, index) => (
            <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', width: 'fit-content' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container text-center section">
        <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ready to transform your study habits?</h2>
          <p style={{ marginBottom: '32px', opacity: 0.9 }}>Join thousands of students who are already studying smarter.</p>
          <Link to="/signup" className="btn" style={{ background: 'white', color: 'var(--primary-main)' }}>
            Claim Your 3 Free Trials
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Features;
