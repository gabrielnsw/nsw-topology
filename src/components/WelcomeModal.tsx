import React, { useState } from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const goNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };
  const goPrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  const goLast = () => setStep(2);

  return (
    <div style={overlay}>
      <div style={modalContainer}>
        <div style={dotsRow}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: step === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: step === i ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `translateX(-${step * 33.333}%)`,
              width: '300%',
              height: '100%',
            }}
          >
            <div style={stepContent}>
              <div style={stepIconWrap}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <h2 style={stepTitle}>Welcome to NSW Topology</h2>
              <p style={stepDesc}>A modern, interactive network topology visualization plugin for Grafana.</p>
              <p style={stepDesc}>
                Built to fill the gap left by the discontinuation of Flowcharting, NSW Topology brings real-time network
                maps with live metrics, weathermap-style traffic visualization, and an intuitive drag-and-drop interface
                — all inside your Grafana dashboard.
              </p>
              <div style={featurePills}>
                <span style={pill}>🗺️ Interactive Maps</span>
                <span style={pill}>📊 Live Metrics</span>
                <span style={pill}>🎨 Customizable</span>
              </div>
            </div>

            <div style={stepContent}>
              <div style={stepIconWrap}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h2 style={stepTitle}>Getting Started</h2>
              <div style={featureList}>
                <div style={featureItem}>
                  <span style={featureIcon}>➕</span>
                  <div>
                    <strong style={{ color: '#e0e0f0' }}>Add Nodes</strong>
                    <p style={featureText}>
                      Click the + button on the sidebar to create network nodes from your data source hosts.
                    </p>
                  </div>
                </div>
                <div style={featureItem}>
                  <span style={featureIcon}>🔗</span>
                  <div>
                    <strong style={{ color: '#e0e0f0' }}>Create Connections</strong>
                    <p style={featureText}>
                      Drag from a node handle to another node to create links. Traffic data is auto-detected.
                    </p>
                  </div>
                </div>
                <div style={featureItem}>
                  <span style={featureIcon}>🖱️</span>
                  <div>
                    <strong style={{ color: '#e0e0f0' }}>Hover for Details</strong>
                    <p style={featureText}>
                      Hover over nodes to see metrics and status. Hover over links to see traffic graphs.
                    </p>
                  </div>
                </div>
                <div style={featureItem}>
                  <span style={featureIcon}>✏️</span>
                  <div>
                    <strong style={{ color: '#e0e0f0' }}>Right-Click to Edit</strong>
                    <p style={featureText}>Right-click on any node or connection to edit or delete it.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={stepContent}>
              <div style={stepIconWrap}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 style={stepTitle}>About the Author</h2>
              <p style={stepDesc}>
                NSW Topology is crafted with ❤️ by <strong style={{ color: '#60a5fa' }}>@gabrielnsw</strong>.
              </p>
              <p style={stepDesc}>
                Follow me on GitHub to stay updated on new plugins and features I&apos;m building for the Grafana
                community!
              </p>
              <a href="https://github.com/gabrielnsw" target="_blank" rel="noopener noreferrer" style={githubLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                github.com/gabrielnsw
              </a>
              <p style={{ ...stepDesc, marginTop: 16 }}>
                If you find this plugin helpful, consider supporting its development — every contribution helps!
              </p>
              <a
                href="https://www.paypal.com/donate/?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving%21&currency_code=BRL"
                target="_blank"
                rel="noopener noreferrer"
                style={donateBtn}
              >
                <span style={donateBtnInner}>❤️ Support this Project</span>
              </a>
            </div>
          </div>
        </div>

        <div style={navRow}>
          {step === 0 && (
            <>
              <button style={navBtnSecondary} onClick={goLast}>
                Skip
              </button>
              <button style={navBtnPrimary} onClick={goNext}>
                Next →
              </button>
            </>
          )}
          {step === 1 && (
            <>
              <button style={navBtnSecondary} onClick={goPrev}>
                ← Previous
              </button>
              <button style={navBtnSecondary} onClick={goLast}>
                Skip
              </button>
              <button style={navBtnPrimary} onClick={goNext}>
                Next →
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button style={navBtnSecondary} onClick={goPrev}>
                ← Previous
              </button>
              <button style={navBtnPrimary} onClick={onClose}>
                Finish ✓
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes nswWelcomePulse {
          0%, 100% { box-shadow: 0 0 12px rgba(245,158,11,0.3), 0 0 24px rgba(245,158,11,0.1); }
          50% { box-shadow: 0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.2); }
        }
      `}</style>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};

const modalContainer: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(20,20,35,0.98), rgba(12,12,22,0.98))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '28px 32px',
  width: 520,
  maxWidth: '90vw',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  overflow: 'hidden',
};

const dotsRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 6,
  marginBottom: 4,
};

const stepContent: React.CSSProperties = {
  width: '33.333%',
  flexShrink: 0,
  padding: '0 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const stepIconWrap: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'rgba(59,130,246,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
};

const stepTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 12px',
  lineHeight: 1.3,
};

const stepDesc: React.CSSProperties = {
  fontSize: 13,
  color: '#999',
  lineHeight: 1.6,
  margin: '0 0 8px',
  maxWidth: 420,
};

const featurePills: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: 12,
};

const pill: React.CSSProperties = {
  background: 'rgba(59,130,246,0.1)',
  border: '1px solid rgba(59,130,246,0.2)',
  borderRadius: 20,
  padding: '5px 14px',
  fontSize: 11,
  color: '#60a5fa',
  fontWeight: 600,
};

const featureList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  textAlign: 'left',
  width: '100%',
  maxWidth: 400,
};

const featureItem: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
};

const featureIcon: React.CSSProperties = {
  fontSize: 18,
  flexShrink: 0,
  marginTop: 2,
};

const featureText: React.CSSProperties = {
  fontSize: 12,
  color: '#888',
  margin: '2px 0 0',
  lineHeight: 1.4,
};

const githubLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: '#e0e0f0',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  padding: '8px 18px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  transition: 'all 0.2s ease',
  marginTop: 8,
};

const donateBtn: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  marginTop: 4,
  borderRadius: 10,
  animation: 'nswWelcomePulse 2s ease-in-out infinite',
};

const donateBtnInner: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 28px',
  fontSize: 14,
  fontWeight: 700,
  color: '#fff',
  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  borderRadius: 10,
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
};

const navRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 10,
  paddingTop: 8,
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const navBtnPrimary: React.CSSProperties = {
  padding: '8px 22px',
  fontSize: 13,
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const navBtnSecondary: React.CSSProperties = {
  padding: '8px 22px',
  fontSize: 13,
  fontWeight: 500,
  color: '#999',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
