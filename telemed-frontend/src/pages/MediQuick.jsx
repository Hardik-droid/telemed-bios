import React, { useEffect, useState, useRef } from 'react';

const MediQuick = () => {
  const [locationText, setLocationText] = useState('Detecting...');
  const [dispatching, setDispatching] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [hospital, setHospital] = useState(null);
  const countdownRef = useRef(null);

  const hospitals = [
    () => ({ name: 'City General Hospital', distance: (Math.random() * 5 + 1).toFixed(1), eta: '5-10' }),
    () => ({ name: 'Metro Medical Center', distance: (Math.random() * 8 + 2).toFixed(1), eta: '8-15' }),
    () => ({ name: 'Community Health Clinic', distance: (Math.random() * 4 + 0.5).toFixed(1), eta: '4-8' }),
    () => ({ name: 'Regional Trauma Center', distance: (Math.random() * 10 + 3).toFixed(1), eta: '12-18' }),
  ];

  useEffect(() => {
    const t = setTimeout(() => setLocationText('Detected: Central Business District (Approximate)'), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dispatching) return;

    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          dispatchAmbulance();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatching]);

  function startSOS() {
    const picked = hospitals[Math.floor(Math.random() * hospitals.length)]();
    setHospital(picked);
    setDispatching(true);
  }

  function cancelDispatch() {
    if (dispatching) {
      if (!window.confirm('Are you sure you want to cancel the emergency dispatch?')) return;
      clearInterval(countdownRef.current);
      setDispatching(false);
      setCountdown(5);
      alert('Emergency dispatch cancelled.');
    }
  }

  function dispatchAmbulance() {
    setCountdown(0);
    // Simulate change to dispatched state by keeping dispatching true and showing details
    // The UI will update to show dispatched message
  }

  function acknowledgeReceived() {
    alert('Thank you for using MediQuick. We hope the patient recovers quickly.');
    setDispatching(false);
    setCountdown(5);
    setHospital(null);
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: 20}}>
      <div style={{width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.95)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'}}>
        <div style={{background: 'linear-gradient(to right, #2c7fb8, #1d5f8a)', color: 'white', padding: 24, textAlign: 'center'}}>
          <div style={{fontSize: 28, fontWeight: 700}}>MediQuick</div>
          <div style={{opacity: 0.9}}>Affordable Care for Everyone</div>
        </div>

        {!dispatching && (
          <div id="sosSection">
            <div style={{background: '#f8f8f8', padding: 14, textAlign: 'center', borderBottom: '1px solid #eee'}}>
              <div style={{color: '#4CAF50', fontWeight: 700}}>System Online - Ready for Emergency</div>
            </div>

            <div style={{padding: 14, background: '#e8f4fc', borderTop: '1px solid #d0e6f7', textAlign: 'center'}}>
              <p>Your location: <strong>{locationText}</strong></p>
            </div>

            <div style={{padding: 20, textAlign: 'center'}}>
              <button onClick={startSOS} style={{width: '80%', padding: 16, background: 'linear-gradient(to right,#e74c3c,#c0392b)', color: 'white', borderRadius: 50, fontSize: 20, fontWeight: 700, border: 'none', cursor: 'pointer'}}>SOS EMERGENCY</button>
            </div>

            <div style={{padding: 14, textAlign: 'center', background: '#fff3cd'}}>
              <p>For immediate assistance, call: <strong>1-800-MEDIQUICK</strong></p>
            </div>
          </div>
        )}

        {dispatching && (
          <div id="dispatchSection">
            <div style={{background: '#f8f8f8', padding: 14, textAlign: 'center', borderBottom: '1px solid #eee'}}>
              <div style={{color: '#4CAF50', fontWeight: 700}}>System Online</div>
            </div>

            <div style={{padding: 24, background: '#f0f8ff', textAlign: 'center'}}>
              <div style={{fontSize: 56, fontWeight: 700, color: '#e74c3c'}}>{countdown}</div>
              <p>Ambulance will be dispatched in</p>
            </div>

            <div style={{padding: 16, background: '#f0f0f0', textAlign: 'center', fontSize: 18}}>
              {countdown > 0 ? (
                <>
                  Dispatching nearest unit<span style={{marginLeft: 10}}>...</span>
                </>
              ) : (
                <>
                  <span style={{color: '#2ecc71'}}>Ambulance dispatched! ✓</span>
                </>
              )}
            </div>

            <div style={{padding: 14, background: '#e8f4fc', textAlign: 'center'}}>
              {hospital && (
                <>
                  <p>Ambulance from: <strong>{hospital.name}</strong></p>
                  <p>Distance: <strong>{hospital.distance} km</strong></p>
                  <p className="eta-display">Estimated arrival: <strong>{hospital.eta} minutes</strong></p>
                  {countdown === 0 && <p>Driver: <strong>John Smith</strong> | Contact: <strong>555-0123</strong></p>}
                </>
              )}
            </div>

            <div style={{padding: 12}}>
              {countdown > 0 ? (
                <button onClick={cancelDispatch} style={{width: '100%', padding: 14, background: 'linear-gradient(to right,#e74c3c,#c0392b)', color: 'white', border: 'none', fontSize: 18}}>Cancel Dispatch</button>
              ) : (
                <button onClick={acknowledgeReceived} style={{width: '100%', padding: 14, background: 'linear-gradient(to right,#2ecc71,#27ae60)', color: 'white', border: 'none', fontSize: 18}}>Emergency Received</button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MediQuick;
