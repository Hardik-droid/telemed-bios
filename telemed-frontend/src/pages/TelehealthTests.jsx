import React, { useState, useRef } from 'react';

const TelehealthTests = () => {
  // BP test state
  const [bpSystolic, setBpSystolic] = useState('---');
  const [bpDiastolic, setBpDiastolic] = useState('---');
  const [pulse, setPulse] = useState('--');
  const [bpRunning, setBpRunning] = useState(false);
  const [bpResultVisible, setBpResultVisible] = useState(false);
  const [bpStatus, setBpStatus] = useState('Normal');
  const [bpComment, setBpComment] = useState('');

  // Sugar test state
  const [sugarValue, setSugarValue] = useState('---');
  const [sugarRunning, setSugarRunning] = useState(false);
  const [sugarResultVisible, setSugarResultVisible] = useState(false);
  const [sugarStatus, setSugarStatus] = useState('Normal');
  const [sugarComment, setSugarComment] = useState('');
  const bloodDropRef = useRef(null);

  function startBpTest() {
    if (bpRunning) return;
    setBpRunning(true);
    setBpResultVisible(false);
    setBpSystolic('...');
    setBpDiastolic('...');
    setPulse('...');

    let systolic = 0;
    let diastolic = 0;
    let pulseVal = 0;
    let count = 0;

    const interval = setInterval(() => {
      count++;
      if (count <= 40) {
        systolic = Math.floor(Math.random() * 40) + 100;
        diastolic = Math.floor(Math.random() * 30) + 60;
        pulseVal = Math.floor(Math.random() * 40) + 60;
        setBpSystolic(systolic);
        setBpDiastolic(diastolic);
        setPulse(pulseVal);
      } else {
        clearInterval(interval);
        let status = 'Normal';
        let comment = 'Your blood pressure is within the normal range.';
        if (systolic < 120 && diastolic < 80) {
          status = 'Normal';
        } else if (systolic < 130 && diastolic < 80) {
          status = 'Elevated';
          comment = 'Your blood pressure is slightly elevated. Consider lifestyle changes.';
        } else if (systolic < 140 || diastolic < 90) {
          status = 'Stage 1 Hypertension';
          comment = 'You may have stage 1 hypertension. Consult your doctor.';
        } else {
          status = 'Stage 2 Hypertension';
          comment = 'You may have stage 2 hypertension. Please consult your doctor immediately.';
        }

        setBpSystolic(systolic);
        setBpDiastolic(diastolic);
        setPulse(pulseVal);
        setBpStatus(status);
        setBpComment(comment);
        setBpResultVisible(true);
        setBpRunning(false);
      }
    }, 100);
  }

  function startSugarTest() {
    if (sugarRunning) return;
    setSugarRunning(true);
    setSugarResultVisible(false);
    setSugarValue('...');
    if (bloodDropRef.current) {
      bloodDropRef.current.style.opacity = '1';
      bloodDropRef.current.style.transform = 'scale(1)';
    }

    setTimeout(() => {
      if (bloodDropRef.current) {
        bloodDropRef.current.style.opacity = '0';
      }
      const val = Math.floor(Math.random() * 120) + 70;
      setSugarValue(val);
      let status = 'Normal';
      let comment = 'Your blood sugar levels are within the normal range.';
      if (val < 100) {
        status = 'Normal';
      } else if (val < 125) {
        status = 'Prediabetes';
        comment = 'Your blood sugar levels indicate prediabetes. Monitor your diet.';
      } else {
        status = 'Diabetes';
        comment = 'Your blood sugar levels may indicate diabetes. Please consult your doctor.';
      }
      setSugarStatus(status);
      setSugarComment(comment);
      setSugarResultVisible(true);
      setSugarRunning(false);
    }, 2000);
  }

  return (
    <div className="telehealth-tests-page">
      <header style={{ background: 'linear-gradient(to right, #2c7dfa, #2c7dfa)', color: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>TeleHealth<span style={{ color: '#ffbb29' }}>+</span></div>
          <nav>
            <a href="/" style={{ color: 'white', marginRight: '1rem' }}>Home</a>
            <a href="/" style={{ color: 'white' }}>Services</a>
          </nav>
        </div>
      </header>

      <main style={{ padding: '2rem' }}>
        <section style={{ maxWidth: 1200, margin: '2rem auto', padding: '2rem', textAlign: 'center', background: 'white', borderRadius: 15 }}>
          <h1 style={{ color: '#2c7dfa' }}>Remote Health Testing</h1>
          <p>Monitor your vital signs remotely with our virtual health testing tools. Please remember that these are simulated results for demonstration purposes only.</p>
        </section>

        <section className="test-container" style={{ maxWidth: 1200, margin: '2rem auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="test-card" style={{ background: 'white', borderRadius: 15, padding: '2rem' }}>
            <h2 style={{ color: '#2c7dfa' }}><span role="img" aria-label="heart">💓</span> Blood Pressure Test</h2>
            <div className="test-visual" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="bp-monitor" style={{ width: 160, height: 120, background: '#f0f0f0', borderRadius: 10, border: '4px solid #2c7dfa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div className="bp-screen" style={{ width: 140, height: 80, background: 'black', color: '#00ff00', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div>BP: <span>{bpSystolic}/{bpDiastolic}</span></div>
                  <div>Pulse: <span>{pulse}</span></div>
                </div>
                <div className="bp-cuff" style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: 100, height: 40, background: '#a8a8a8', borderRadius: 5 }} />
              </div>
            </div>
            <button className="test-button" onClick={startBpTest} disabled={bpRunning} style={{ background: '#2c7dfa', color: 'white', padding: '12px 25px', borderRadius: 50, display: 'block', margin: '0 auto', width: '80%' }}>{bpRunning ? 'Testing...' : 'Start BP Test'}</button>
            {bpResultVisible && (
              <div className="results" style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: 10 }}>
                <h3>Results:</h3>
                <div className="result-value">{bpSystolic}/{bpDiastolic} mmHg</div>
                <div className={`result-status ${bpStatus === 'Normal' ? 'normal' : bpStatus.includes('Stage') || bpStatus === 'Elevated' ? 'warning' : 'danger'}`}>{bpStatus}</div>
                <p>{bpComment}</p>
              </div>
            )}
          </div>

          <div className="test-card" style={{ background: 'white', borderRadius: 15, padding: '2rem', position: 'relative' }}>
            <h2 style={{ color: '#2c7dfa' }}><span role="img" aria-label="drop">🩸</span> Blood Sugar Test</h2>
            <div className="test-visual" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glucometer" style={{ width: 120, height: 160, background: '#eaeaea', borderRadius: 10, border: '3px solid #ff5722', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 10, position: 'relative' }}>
                <div ref={bloodDropRef} className="test-drop" style={{ height: 25, width: 25, borderRadius: '50%', background: '#ff0000', position: 'absolute', top: 65, opacity: 0, transition: 'all 1s ease' }} />
                <div className="glucometer-screen" style={{ width: 90, height: 40, background: 'black', color: '#00ff00', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div>{sugarValue}</div>
                </div>
                <div className="test-strip" />
              </div>
            </div>
            <button className="test-button" onClick={startSugarTest} disabled={sugarRunning} style={{ background: '#2c7dfa', color: 'white', padding: '12px 25px', borderRadius: 50, display: 'block', margin: '0 auto', width: '80%' }}>{sugarRunning ? 'Testing...' : 'Start Sugar Test'}</button>
            {sugarResultVisible && (
              <div className="results" style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: 10 }}>
                <h3>Results:</h3>
                <div className="result-value">{sugarValue} mg/dL</div>
                <div className={`result-status ${sugarStatus === 'Normal' ? 'normal' : sugarStatus === 'Prediabetes' ? 'warning' : 'danger'}`}>{sugarStatus}</div>
                <p>{sugarComment}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer style={{ background: '#2c7dfa', color: 'white', textAlign: 'center', padding: '2rem', marginTop: '3rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
          <p><strong>Disclaimer:</strong> This is a demonstration application only. The medical tests shown here are simulated and do not perform actual measurements. For real medical testing, please consult with a healthcare professional.</p>
        </div>
        <p>&copy; 2023 TeleHealth+. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TelehealthTests;
