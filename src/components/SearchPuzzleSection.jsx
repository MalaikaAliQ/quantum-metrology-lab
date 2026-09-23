import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Zap, RotateCcw } from 'lucide-react';

export default function SearchPuzzleSection() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 16));
  
  // Classical Search State
  const [cSteps, setCSteps] = useState(0);
  const [cTime, setCTime] = useState(0);
  const [cStatus, setCStatus] = useState('Ready.');
  const [cCurrentIndex, setCCurrentIndex] = useState(-1);
  const [cIsHit, setCIsHit] = useState(false);
  const classicalTimerRef = useRef(null);

  // Quantum Search State
  const [qSteps, setQSteps] = useState('0');
  const [amps, setAmps] = useState(() => Array(16).fill(0.25));
  const [qStatus, setQStatus] = useState('Initialized: uniform state |ψ⟩ = 1/4 Σ |x⟩.');
  const [qHit, setQHit] = useState(false);
  const [stepCountForTargetHighlight, setStepCountForTargetHighlight] = useState(0);
  const quantumTimeoutsRef = useRef([]);

  const clearAllTimers = () => {
    if (classicalTimerRef.current) {
      clearInterval(classicalTimerRef.current);
      classicalTimerRef.current = null;
    }
    quantumTimeoutsRef.current.forEach(clearTimeout);
    quantumTimeoutsRef.current = [];
  };

  const handleResetSearch = () => {
    clearAllTimers();
    setCCurrentIndex(-1);
    setCIsHit(false);
    setCSteps(0);
    setCTime(0);
    setCStatus('Ready.');

    setQSteps('0');
    setAmps(Array(16).fill(0.25));
    setQStatus('Initialized: uniform state |ψ⟩ = 1/4 Σ |x⟩.');
    setQHit(false);
    setStepCountForTargetHighlight(0);
  };

  const handleNewTarget = () => {
    const newT = Math.floor(Math.random() * 16);
    setTarget(newT);
    handleResetSearch();
  };

  const handleRunClassical = () => {
    if (classicalTimerRef.current) return;

    let idx = 0;
    setCIsHit(false);
    setCStatus('Scanning register sequentially...');

    classicalTimerRef.current = setInterval(() => {
      setCCurrentIndex(idx);
      setCSteps(idx + 1);
      setCTime((idx + 1) * 0.25);

      if (idx === target) {
        setCIsHit(true);
        setCStatus(`Target state |${idx + 1}⟩ located after ${idx + 1} steps.`);
        clearInterval(classicalTimerRef.current);
        classicalTimerRef.current = null;
      } else {
        idx++;
      }
    }, 240);
  };

  const handleRunQuantum = () => {
    if (quantumTimeoutsRef.current.length > 0) return;

    const equal = Array(16).fill(0.25);
    const marked = [...equal];
    marked[target] = -0.25;
    const diff = Array(16).fill(0.1875);
    diff[target] = 0.6875;
    const finalAmps = Array(16).fill(0.08);
    finalAmps[target] = 0.95;

    setAmps(equal);
    setStepCountForTargetHighlight(0);

    const t1 = setTimeout(() => {
      setQSteps('1 (Oracle)');
      setAmps(marked);
      setStepCountForTargetHighlight(1);
      setQStatus('Oracle applied: negative phase on |target⟩. Probabilities remain 6.25%.');
    }, 600);

    const t2 = setTimeout(() => {
      setQSteps('1 (Diffusion)');
      setAmps(diff);
      setQStatus('Diffusion complete: constructive interference elevates marked state.');
    }, 1300);

    const t3 = setTimeout(() => {
      setQSteps('2 (Final Amplification)');
      setAmps(finalAmps);
      setQHit(true);
      setQStatus('Target state probability reaches ~90%. Ready for single measurement.');
      quantumTimeoutsRef.current = [];
    }, 2000);

    quantumTimeoutsRef.current = [t1, t2, t3];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const targetProb = (amps[target] ** 2 * 100).toFixed(1);

  return (
    <section className="active">
      <div className="card">
        <h2>Search Puzzle: Classical Sequential vs. Grover Register</h2>
        <p className="muted">
          Compare sequential searching across 16 elements against a 4-qubit register evolving all 16 amplitudes simultaneously.
        </p>
        <div className="controls">
          <button className="btn" onClick={handleNewTarget}>
            <RefreshCw size={15} />
            <span>New Target</span>
          </button>
          <button className="btn primary" onClick={handleRunClassical}>
            <Play size={15} />
            <span>Run Classical Search</span>
          </button>
          <button className="btn primary" onClick={handleRunQuantum}>
            <Zap size={15} />
            <span>Run Quantum Evolution</span>
          </button>
          <button className="btn warn" onClick={handleResetSearch}>
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: '16px' }}>
        {/* Classical Card */}
        <div className="card">
          <h3>Classical: Linear Scan</h3>
          <p className="muted" dangerouslySetInnerHTML={{ __html: cStatus }} />
          <div className="boxes">
            {Array.from({ length: 16 }, (_, i) => {
              const isCurrent = cCurrentIndex === i;
              const isTargetHit = cIsHit && i === target;
              let bgStyle = 'white';
              if (isCurrent && !isTargetHit) bgStyle = '#eff6ff';

              return (
                <div
                  key={i}
                  className={`box ${isTargetHit ? 'hit target' : ''}`}
                  style={{ background: bgStyle }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="grid two" style={{ marginTop: '14px' }}>
            <div className="stat">
              <div className="label">Elements Checked</div>
              <div className="value">{cSteps}</div>
            </div>
            <div className="stat">
              <div className="label">Time (Illustrative)</div>
              <div className="value">{cTime.toFixed(2)} s</div>
            </div>
          </div>
        </div>

        {/* Quantum Card */}
        <div className="card">
          <h3>Quantum: Coherent Register</h3>
          <p className="muted">{qStatus}</p>
          <div className="boxes">
            {Array.from({ length: 16 }, (_, i) => {
              const a = amps[i];
              const pct = (a * a * 100).toFixed(1);
              const barWidth = Math.min(100, Math.max(4, Math.abs(a) * 100));
              const barBg = a < 0 ? '#dc2626' : '#2563eb';
              const isTargetBox = i === target && stepCountForTargetHighlight >= 1;
              const isHitBox = qHit && i === target;

              return (
                <div
                  key={i}
                  className={`box super ${isTargetBox ? 'target' : ''} ${isHitBox ? 'hit' : ''}`}
                >
                  {i + 1}
                  <div className="qprob">{pct}%</div>
                  <div className="qamp">
                    <span style={{ width: `${barWidth}%`, background: barBg }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid two" style={{ marginTop: '14px' }}>
            <div className="stat">
              <div className="label">Grover Iterations</div>
              <div className="value">{qSteps}</div>
            </div>
            <div className="stat">
              <div className="label">
                Target Probability |&alpha;|&sup2;
              </div>
              <div className="value">{targetProb}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <p className="note">
          <b>Physical Mechanism:</b> The oracle <span class="math"><b>U</b><sub>&omega;</sub> = <b>I</b> &minus; 2|&omega;&rang;&lang;&omega;|</span> applies a &pi;-phase inversion exclusively to the marked basis state. The diffusion operator <span class="math">2|&psi;&rang;&lang;&psi;| &minus; <b>I</b></span> then inverts all state amplitudes around their statistical mean <span class="math">&lang;&alpha;&rang;</span>. Over <span class="math">R &approx; (&pi;/4)&radic;16 = 3.14/4 &times; 4 &approx; 2</span> iterations, probability concentrates directly in the target.
        </p>
      </div>
    </section>
  );
}
