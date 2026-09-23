import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';

export default function RamseyMetrologySection() {
  const [blochVector, setBlochVector] = useState({ x2: 0, y2: 75 });
  const [peVal, setPeVal] = useState('0.00');
  const [statusText, setStatusText] = useState('Status: Resting in ground state |g⟩.');
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef([]);

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const handleResetRamsey = () => {
    clearTimers();
    setIsRunning(false);
    setBlochVector({ x2: 0, y2: 75 });
    setPeVal('0.00');
    setStatusText('Status: Resting in ground state |g⟩.');
  };

  const handleFireRamsey = () => {
    if (isRunning) return;
    clearTimers();
    setIsRunning(true);

    // Initial state setup
    setBlochVector({ x2: 0, y2: 75 });
    setStatusText('Step 1: Applying first π/2 pulse. Creating (|g⟩ + |e⟩)/√2 superposition.');

    // Pulse 1: Rotate to equator
    const t1 = setTimeout(() => {
      setBlochVector({ x2: 75, y2: 0 });
      setPeVal('0.50');
      setStatusText('Step 2: Free precession for duration T. State accumulates quantum phase Δω·T.');
    }, 800);

    // Precession phase accumulation
    const t2 = setTimeout(() => {
      setBlochVector({ x2: -75, y2: 0 });
      setStatusText('Step 3: Applying second π/2 pulse to close the interferometer.');
    }, 1800);

    // Pulse 2: Projection to excited state |e⟩
    const t3 = setTimeout(() => {
      setBlochVector({ x2: 0, y2: -75 });
      setPeVal('1.00');
      setStatusText('Interrogation Complete: Atom projected into excited state |e⟩.');
      setIsRunning(false);
    }, 2800);

    timerRef.current = [t1, t2, t3];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <section className="active">
      <div className="card">
        <h2>Atomic Ramsey Interferometry (Atomic Clocks &amp; Magnetometry)</h2>
        <p className="muted">
          Atomic quantum sensors measure transition frequencies <span className="math">&omega;&sub0;</span> or Zeeman shifts <span className="math">&Delta;E = g &mu;<sub>B</sub> B</span> using separated oscillatory fields. Two &pi;/2 pulses bracket a free interrogation period <span className="math">T</span>, mapping atomic coherence into population inversion on the Bloch sphere.
        </p>
        <div className="controls">
          <button className="btn primary" onClick={handleFireRamsey} disabled={isRunning}>
            <Play size={15} />
            <span>Run Ramsey Interrogation Sequence</span>
          </button>
          <button className="btn warn" onClick={handleResetRamsey}>
            <RotateCcw size={15} />
            <span>Reset Atoms</span>
          </button>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: '16px' }}>
        {/* SVG Energy Levels & 2D Bloch Sphere */}
        <div className="card">
          <h3>2-Level Atomic System Evolution</h3>
          <svg viewBox="0 0 600 300">
            <rect width="600" height="300" fill="#fff" rx="10" stroke="#e2e8f0" strokeWidth="1.5" />
            
            {/* Energy Levels */}
            <line x1="80" y1="220" x2="260" y2="220" stroke="#1e293b" strokeWidth="3" />
            <text x="50" y="225" fontSize="16" fontWeight="700" fill="#0f172a">|g⟩</text>
            <text x="170" y="240" fontSize="12" fill="#64748b">Ground State</text>

            <line x1="80" y1="80" x2="260" y2="80" stroke="#1e293b" strokeWidth="3" />
            <text x="50" y="85" fontSize="16" fontWeight="700" fill="#0f172a">|e⟩</text>
            <text x="170" y="65" fontSize="12" fill="#64748b">Excited State</text>

            {/* Transition Arrow */}
            <path d="M 170 215 L 170 85" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4,4" />
            <polygon points="166,95 170,85 174,95" fill="#7c3aed" />
            <text x="180" y="150" fontSize="12" fontWeight="700" fill="#7c3aed">ħω₀ = ΔE</text>

            {/* Bloch Sphere Representation */}
            <g transform="translate(440, 150)">
              <circle cx="0" cy="0" r="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="75" ry="24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Coordinate Axes */}
              <line x1="0" y1="-85" x2="0" y2="85" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="-85" y1="0" x2="85" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="0" y="-92" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">|e⟩ (North)</text>
              <text x="0" y="100" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">|g⟩ (South)</text>
              
              {/* Dynamic Bloch Vector */}
              <line
                x1="0"
                y1="0"
                x2={blochVector.x2}
                y2={blochVector.y2}
                stroke="#dc2626"
                strokeWidth="3"
                style={{ transition: 'all 0.6s ease' }}
              />
              <circle
                cx={blochVector.x2}
                cy={blochVector.y2}
                r="5"
                fill="#dc2626"
                style={{ transition: 'all 0.6s ease' }}
              />
            </g>
          </svg>
        </div>

        {/* Pulse Sequence & Probability Outcome */}
        <div className="card">
          <h3>Pulse Sequence &amp; Probability Outcome</h3>
          <p>
            1. <b>First &pi;/2 Pulse:</b> Rotates ground state <span className="math">|g&rang;</span> to equatorial superposition <span className="math">(|g&rang; + |e&rang;)/&radic;2</span>.
          </p>
          <p>
            2. <b>Free Precession (Time T):</b> Atom precesses at detuning frequency <span className="math">&Delta;&omega; = &omega; &minus; &omega;&sub0;</span>, picking up phase <span className="math">&phi; = &Delta;&omega; &middot; T</span>.
          </p>
          <p>
            3. <b>Second &pi;/2 Pulse:</b> Interference maps accumulated phase directly into excited state population:
          </p>
          <div className="stat" style={{ marginTop: '10px' }}>
            <div className="label">Excited State Population P_e</div>
            <div className="value">{peVal}</div>
            <small className="muted">P_e = cos&sup2;(&Delta;&omega; &middot; T / 2)</small>
          </div>
          <p className="muted" style={{ marginTop: '14px' }}>
            {statusText}
          </p>
        </div>
      </div>
    </section>
  );
}
