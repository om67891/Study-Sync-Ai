import React from 'react';
import { HelpCircle } from 'lucide-react';

function FAQ() {
  const faqs = [
    {
      q: "How does the AI generate my study plan?",
      a: "Our AI (powered by Groq) takes into account your available study hours, preferred study times, exam goals, and specific subjects. It uses proven pedagogical techniques (like the Pomodoro technique and spaced repetition concepts) to distribute the workload evenly."
    },
    {
      q: "Are the 3 free trials really free?",
      a: "Yes! Every new account gets 3 complete study plan generations entirely for free. No credit card required. A 'trial' is only consumed when a schedule is successfully generated."
    },
    {
      q: "What if the AI fails to generate my plan?",
      a: "If there is an error during generation, you will NOT lose a trial. Our system uses strict transactional databases to ensure you only pay for successful generations."
    },
    {
      q: "Can I edit the generated PDF?",
      a: "Currently, the PDF is a finalized export of your plan. If you need to make major changes to the schedule, we recommend adjusting your inputs and generating a new plan."
    },
    {
      q: "When is the Pro tier coming?",
      a: "We are actively developing the Pro tier, which will allow you to save multiple plans, edit them dynamically, and regenerate specific days. You can express interest on the pricing page to join the waitlist!"
    }
  ];

  return (
    <div className="faq-page" style={{ paddingBottom: '80px' }}>
      <div className="section" style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--primary-dark)' }}>
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know about the product and how it works.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <HelpCircle style={{ color: 'var(--primary-main)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQ;
