import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap, Sparkles, Activity } from 'lucide-react';

export default function QuantumSensingSection({ isActive }) {
  const [theta, setTheta] = useState(1.57); // radians (~90 deg)
  const [nPhotons, setNPhotons] = useState(100);
  const [stateMode, setStateMode] = useState('coherent'); // 'coherent' | 'n00n'

  const [rotX, setRotX] = useState(0.35);
  const [rotY, setRotY] = useState(-0.45);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const pulseRef = useRef({ progress: 0, isPulsing: false });

  // Safe numerical calculations
  const thetaNum = typeof theta === 'number' && !isNaN(theta) ? theta : 1.57;
  const nPhotonsNum = typeof nPhotons === 'number' && !isNaN(nPhotons) ? nPhotons : 100;

  // Effective Super-resolution factor for NOON state visualization
  const nEff = Math.min(8, Math.max(2, Math.round(Math.log2(nPhotonsNum) + 1))) || 4;

  // Compute intensities safely
  const rawP0 = stateMode === 'coherent'
    ? Math.cos(thetaNum / 2) ** 2
    : Math.cos((nEff * thetaNum) / 2) ** 2;
  const p0 = isNaN(rawP0) ? 0.5 : Math.max(0, Math.min(1, rawP0));
  const p1 = 1 - p0;

  const sqlVal = (1 / Math.sqrt(nPhotonsNum)).toFixed(4);
  const hlVal = (1 / nPhotonsNum).toFixed(4);
  const sensitivityGain = Math.sqrt(nPhotonsNum).toFixed(1);
  const thetaDeg = (thetaNum * 180 / Math.PI).toFixed(0);

  // 3D Nodes
  const mziNodes = {
    laser: { x: -220, y: 0, z: 0 },
    spdc:  { x: -155, y: 0, z: 0 },
    bs1:   { x: -90,  y: 0, z: 0 },
    mTop:  { x: -90,  y: 0, z: -100 },
    mBot:  { x: 90,   y: 0, z: 100 },
    cell:  { x: 0,    y: 0, z: -100 },
    bs2:   { x: 90,   y: 0, z: 0 },
    det0:  { x: 220,  y: 0, z: 0 },
    det1:  { x: 90,   y: 0, z: -90 },
  };

  const projectMzi = useCallback(
    (x, y, z, width, height, currentRotX, currentRotY) => {
      const cosY = Math.cos(currentRotY), sinY = Math.sin(currentRotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      const cosX = Math.cos(currentRotX), sinX = Math.sin(currentRotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      const fov = 520;
      const zEff = z2 + 520;
      if (zEff <= 10) return null;

      const scale = fov / zEff;
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y2 * scale,
        scale,
        depth: zEff,
      };
    },
    []
  );

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleRecenter = () => {
    setRotX(0.35);
    setRotY(-0.45);
  };

  const handlePulse = () => {
    pulseRef.current = { progress: 0, isPulsing: true };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      setRotY((prev) => prev + dx * 0.007);
      setRotX((prev) => Math.max(-1.1, Math.min(1.1, prev + dy * 0.007)));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Main 3D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isEntangled = stateMode === 'n00n';

    const resizeCanvas = () => {
      if (container && canvas) {
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 460;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const width = canvas.width || 800;
      const height = canvas.height || 460;

      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      // Grid Table
      ctx.lineWidth = 1;
      for (let gx = -260; gx <= 260; gx += 40) {
        const pA = projectMzi(gx, 40, -160, width, height, rotX, rotY);
        const pB = projectMzi(gx, 40, 160, width, height, rotX, rotY);
        if (pA && pB) {
          ctx.strokeStyle = isEntangled ? 'rgba(88, 28, 135, 0.4)' : 'rgba(30, 41, 59, 0.5)';
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        }
      }
      for (let gz = -160; gz <= 160; gz += 40) {
        const pA = projectMzi(-260, 40, gz, width, height, rotX, rotY);
        const pB = projectMzi(260, 40, gz, width, height, rotX, rotY);
        if (pA && pB) {
          ctx.strokeStyle = isEntangled ? 'rgba(88, 28, 135, 0.4)' : 'rgba(30, 41, 59, 0.5)';
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        }
      }

      const drawBeam = (from, to, color, w, glow = false) => {
        const p1Point = projectMzi(from.x, from.y, from.z, width, height, rotX, rotY);
        const p2Point = projectMzi(to.x, to.y, to.z, width, height, rotX, rotY);
        if (p1Point && p2Point) {
          if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = isEntangled ? 14 : 8;
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = w * p1Point.scale;
          ctx.beginPath();
          ctx.moveTo(p1Point.x, p1Point.y);
          ctx.lineTo(p2Point.x, p2Point.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      };

      // Color themes based on Quantum State
      const laserColor = isEntangled ? '#c084fc' : '#ef4444';
      const armColor = isEntangled ? '#e879f9' : '#38bdf8';
      const armWidth = isEntangled ? 3.5 : 2.5;

      // Laser to BS1 (through SPDC crystal if entangled)
      drawBeam(mziNodes.laser, mziNodes.spdc, laserColor, 3.5, true);
      drawBeam(mziNodes.spdc, mziNodes.bs1, isEntangled ? '#f0abfc' : laserColor, 3.5, true);

      // Upper Arm
      drawBeam(mziNodes.bs1, mziNodes.mTop, armColor, armWidth, isEntangled);
      drawBeam(mziNodes.mTop, { x: 90, y: 0, z: -100 }, armColor, armWidth, isEntangled);
      drawBeam({ x: 90, y: 0, z: -100 }, mziNodes.bs2, armColor, armWidth, isEntangled);

      // Lower Arm
      drawBeam(mziNodes.bs1, { x: -90, y: 0, z: 100 }, armColor, armWidth, isEntangled);
      drawBeam({ x: -90, y: 0, z: 100 }, mziNodes.mBot, armColor, armWidth, isEntangled);
      drawBeam(mziNodes.mBot, mziNodes.bs2, armColor, armWidth, isEntangled);

      // Detectors
      const det0Color = isEntangled ? `rgba(192, 132, 252, ${Math.max(0.3, p0)})` : `rgba(16, 185, 129, ${Math.max(0.2, p0)})`;
      const det1Color = isEntangled ? `rgba(236, 72, 153, ${Math.max(0.3, p1)})` : `rgba(168, 85, 247, ${Math.max(0.2, p1)})`;

      drawBeam(mziNodes.bs2, mziNodes.det0, det0Color, 3 + p0 * 4, true);
      drawBeam(mziNodes.bs2, mziNodes.det1, det1Color, 3 + p1 * 4, true);

      // Components
      const drawComponent = (pos, label, color, size, strokeColor = '#fff') => {
        const p = projectMzi(pos.x, pos.y, pos.z, width, height, rotX, rotY);
        if (p) {
          ctx.fillStyle = color;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#cbd5e1';
          ctx.font = `${Math.round(11 * p.scale)}px monospace`;
          ctx.fillText(label, p.x + 8 * p.scale, p.y - 8 * p.scale);
        }
      };

      drawComponent(mziNodes.laser, 'PUMP LASER', laserColor, 8);
      
      // SPDC Non-linear Entanglement Crystal Component
      drawComponent(
        mziNodes.spdc,
        isEntangled ? 'SPDC CRYSTAL [NON-LINEAR ENTANGLER]' : 'OPTICAL ISOLATOR',
        isEntangled ? '#a855f7' : '#475569',
        isEntangled ? 9 : 6,
        isEntangled ? '#f472b6' : '#fff'
      );

      drawComponent(mziNodes.bs1, 'BS 1 (50:50)', '#0284c7', 7);
      drawComponent(mziNodes.mTop, 'MIRROR 1', '#64748b', 6);
      drawComponent({ x: 90, y: 0, z: -100 }, 'MIRROR 2', '#64748b', 6);
      drawComponent({ x: -90, y: 0, z: 100 }, 'MIRROR 3', '#64748b', 6);
      drawComponent(mziNodes.mBot, 'MIRROR 4', '#64748b', 6);
      drawComponent(
        mziNodes.cell,
        `PHASE CELL [θ=${thetaNum.toFixed(2)}]`,
        '#d97706',
        9
      );
      drawComponent(mziNodes.bs2, 'BS 2 (RECOMB)', '#0284c7', 7);
      drawComponent(
        mziNodes.det0,
        `DET 0 [${(p0 * nPhotonsNum).toFixed(0)}]`,
        isEntangled ? '#c084fc' : '#10b981',
        8
      );
      drawComponent(
        mziNodes.det1,
        `DET 1 [${(p1 * nPhotonsNum).toFixed(0)}]`,
        isEntangled ? '#ec4899' : '#a855f7',
        8
      );

      // Packet Pulse animation
      if (pulseRef.current.isPulsing) {
        pulseRef.current.progress += 0.02;
        if (pulseRef.current.progress <= 1) {
          const t = pulseRef.current.progress;
          const lerp = (a, b, progress) => ({
            x: a.x + (b.x - a.x) * progress,
            y: a.y + (b.y - a.y) * progress,
            z: a.z + (b.z - a.z) * progress,
          });
          const posP1 = lerp(mziNodes.mTop, { x: 90, y: 0, z: -100 }, t);
          const posP2 = lerp({ x: -90, y: 0, z: 100 }, mziNodes.mBot, t);

          const pA = projectMzi(posP1.x, posP1.y, posP1.z, width, height, rotX, rotY);
          const pB = projectMzi(posP2.x, posP2.y, posP2.z, width, height, rotX, rotY);

          if (pA && pB) {
            if (isEntangled) {
              // Draw glowing entangled twin pairs propagating in superposition along both arms
              ctx.shadowColor = '#e879f9';
              ctx.shadowBlur = 12;

              ctx.fillStyle = '#f472b6';
              ctx.beginPath();
              ctx.arc(pA.x, pA.y, 6 * pA.scale, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#c084fc';
              ctx.beginPath();
              ctx.arc(pB.x, pB.y, 6 * pB.scale, 0, Math.PI * 2);
              ctx.fill();

              // Draw quantum entanglement correlation bridge line
              ctx.strokeStyle = 'rgba(232, 121, 249, 0.6)';
              ctx.lineWidth = 1.5;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(pA.x, pA.y);
              ctx.lineTo(pB.x, pB.y);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.shadowBlur = 0;
            } else {
              // Standard single coherent photon packets
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(pA.x, pA.y, 5 * pA.scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(pB.x, pB.y, 5 * pB.scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          pulseRef.current.isPulsing = false;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotX, rotY, thetaNum, nPhotonsNum, stateMode, p0, p1, nEff, projectMzi, isActive]);

  // Pre-generate polyline points safely
  const coherentPoints = [];
  for (let x = 0; x <= 620; x += 4) {
    const rad = (x / 620) * Math.PI * 2;
    const val = Math.cos(rad / 2) ** 2;
    const py = 130 - val * 105;
    coherentPoints.push(`${(50 + x).toFixed(1)},${py.toFixed(1)}`);
  }

  const noonPoints = [];
  for (let x = 0; x <= 620; x += 2) {
    const rad = (x / 620) * Math.PI * 2;
    const val = Math.cos((nEff * rad) / 2) ** 2;
    const py = 130 - val * 105;
    noonPoints.push(`${(50 + x).toFixed(1)},${py.toFixed(1)}`);
  }

  const currentX = (50 + (thetaNum / (Math.PI * 2)) * 620).toFixed(1);
  const currentY = (130 - p0 * 105).toFixed(1);
  const activeColor = stateMode === 'n00n' ? '#7c3aed' : '#2563eb';

  return (
    <section className="active">
      <div className="card">
        <h2>3D Quantum Optical Metrology: Mach-Zehnder Interferometer</h2>
        <p className="muted">
          An optical field is split into two spatial arms by a 50:50 beam splitter (BS1). Arm 1 acquires an external phase shift <span className="math">&theta;</span> in a 3D phase cell. The arms recombine at BS2, causing spatial wave interference that modulates the detector ports. <b>Click and drag to rotate the optical setup.</b>
        </p>

        <div className="controls">
          <div className="slider-group">
            <label>
              <b>External Phase Shift (&theta;):</b>{' '}
              <span>{thetaNum.toFixed(2)} rad ({thetaDeg}&deg;)</span>
            </label>
            <input
              type="range"
              min="0"
              max="6.28"
              step="0.04"
              value={thetaNum}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <label>
              <b>Photon Flux (N):</b> <span>{nPhotonsNum} photons</span>
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={nPhotonsNum}
              onChange={(e) => setNPhotons(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="slider-group">
            <label>
              <b>Input Quantum State:</b>
            </label>
            <select
              value={stateMode}
              onChange={(e) => setStateMode(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: stateMode === 'n00n' ? '2px solid var(--purple)' : '1px solid var(--border-soft)',
                fontSize: '.85rem',
                background: stateMode === 'n00n' ? '#f5f3ff' : '#fff',
                color: stateMode === 'n00n' ? 'var(--purple)' : 'var(--ink)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <option value="coherent">Coherent Beam (Classical Shot Noise SQL: &Delta;&theta; = 1/&radic;N)</option>
              <option value="n00n">✦ NOON Entangled State (Non-linear Quantum Heisenberg Limit: &Delta;&theta; = 1/N)</option>
            </select>
          </div>

          <button
            className={`btn ${stateMode === 'n00n' ? 'purple' : 'primary'}`}
            onClick={handlePulse}
          >
            {stateMode === 'n00n' ? <Sparkles size={15} /> : <Zap size={15} />}
            <span>{stateMode === 'n00n' ? 'Pulse Entangled Pairs' : 'Pulse Optical Packets'}</span>
          </button>
        </div>
      </div>

      {/* 3D Optical Canvas Viewport */}
      <div className="card" style={{ marginTop: '16px', padding: 0, border: 'none' }}>
        <div
          className="canvas-container"
          ref={containerRef}
          onMouseDown={handleMouseDown}
        >
          <canvas ref={canvasRef} />
          <div className="hud-text">
            <h4>// 3D MACH-ZEHNDER METROLOGY BENCH</h4>
            <div style={{ color: stateMode === 'n00n' ? '#f0abfc' : '#38bdf8', fontWeight: 700 }}>
              MODE: {stateMode === 'n00n' ? `NOON ENTANGLED QUANTUM STATE (${nEff}x SUPER-RESOLUTION)` : 'COHERENT CLASSICAL BEAM (SQL)'}
            </div>
            <div>PORT 0 INTENSITY: {(p0 * 100).toFixed(1)}%</div>
            <div>PORT 1 INTENSITY: {(p1 * 100).toFixed(1)}%</div>
            <div>ROTATION: [X: {rotX.toFixed(2)}, Y: {rotY.toFixed(2)}]</div>
          </div>
          <div className="hud-panel">
            <span>
              {stateMode === 'n00n'
                ? '✦ Non-linear Entanglement Active: Twin photon superpositions & Heisenberg Super-resolution enabled'
                : 'Click and drag to rotate the 3D optical layout'}
            </span>
            <button
              className="btn"
              onClick={handleRecenter}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.3)',
                fontSize: '.78rem',
                padding: '4px 10px',
              }}
            >
              <RotateCcw size={13} />
              <span>Recenter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Interference Fringe Curve Comparison Plot */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color={stateMode === 'n00n' ? 'var(--purple)' : 'var(--blue)'} />
            <span>Interference Fringe Super-Resolution Comparison: P₀(&theta;)</span>
          </h3>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: stateMode === 'n00n' ? 'var(--purple)' : 'var(--blue)' }}>
            {stateMode === 'n00n' ? `Quantum Advantage: ${sensitivityGain}x Precision Boost` : 'Classical Baseline (SQL)'}
          </div>
        </div>

        <svg viewBox="0 0 700 160" style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--line)' }}>
          {/* Axis grid lines */}
          <line x1="50" y1="20" x2="50" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="50" y1="130" x2="670" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="50" y1="25" x2="670" y2="25" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50" y1="77.5" x2="670" y2="77.5" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

          <text x="15" y="30" fontSize="10" fontWeight="700" fill="#64748b">100%</text>
          <text x="25" y="81" fontSize="10" fill="#94a3b8">50%</text>
          <text x="32" y="133" fontSize="10" fill="#94a3b8">0%</text>

          <text x="50" y="148" fontSize="10" textAnchor="middle" fill="#64748b">0 rad</text>
          <text x="205" y="148" fontSize="10" textAnchor="middle" fill="#64748b">&pi;/2</text>
          <text x="360" y="148" fontSize="10" textAnchor="middle" fill="#64748b">&pi;</text>
          <text x="515" y="148" fontSize="10" textAnchor="middle" fill="#64748b">3&pi;/2</text>
          <text x="670" y="148" fontSize="10" textAnchor="middle" fill="#64748b">2&pi;</text>

          {/* Coherent curve path */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth={stateMode === 'coherent' ? 3 : 1.5}
            strokeOpacity={stateMode === 'coherent' ? 1 : 0.4}
            points={coherentPoints.join(' ')}
          />

          {/* NOON Entangled curve path */}
          <polyline
            fill="none"
            stroke="#7c3aed"
            strokeWidth={stateMode === 'n00n' ? 3 : 1.5}
            strokeOpacity={stateMode === 'n00n' ? 1 : 0.3}
            strokeDasharray={stateMode === 'n00n' ? '0' : '4 4'}
            points={noonPoints.join(' ')}
          />

          {/* Current Theta marker vertical line */}
          <g>
            <line x1={currentX} y1="20" x2={currentX} y2="130" stroke={activeColor} strokeWidth="2" strokeDasharray="3 3" />
            <circle cx={currentX} cy={currentY} r="6" fill={activeColor} stroke="#fff" strokeWidth="2" />
            <text x={Math.min(540, parseFloat(currentX) + 8)} y={Math.max(35, parseFloat(currentY) - 8)} fontSize="11" fontWeight="800" fill={activeColor}>
              &theta; = {thetaNum.toFixed(2)} rad ({(p0 * 100).toFixed(0)}%)
            </text>
          </g>
        </svg>

        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: '#2563eb', borderRadius: '2px' }} />
            <span><b>Coherent Beam (Classical):</b> Standard 1&times; Period &mdash; Shot-Noise SQL Limit (&Delta;&theta; = 1/&radic;N)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: '#7c3aed', borderRadius: '2px' }} />
            <span><b>NOON Entangled State (Quantum):</b> {nEff}&times; Super-Resolution &mdash; Heisenberg Limit (&Delta;&theta; = 1/N)</span>
          </div>
        </div>
      </div>

      {/* Equations & fundamental limits */}
      <div className="grid two" style={{ marginTop: '16px' }}>
        <div className="card">
          <h3>Interferometer State Equations</h3>
          <p>
            1. <b>Input State Transformation:</b> Mode <span className="math">a</span> receives photons; Non-linear SPDC crystal prepares quantum superposition:
          </p>
          <div className="stat" style={{ marginTop: '6px', marginBottom: '8px', background: stateMode === 'n00n' ? '#f5f3ff' : '#f8fafc' }}>
            <span className="math" style={{ color: stateMode === 'n00n' ? 'var(--purple)' : 'var(--ink)' }}>
              {stateMode === 'n00n'
                ? '|&psi;<sub>NOON</sub>&rang; = (|N, 0&rang; + |0, N&rang;) / &radic;2'
                : '|&psi;<sub>in</sub>&rang; = |&alpha;&rang;<sub>a</sub> &otimes; |0&rang;<sub>b</sub>'}
            </span>
          </div>
          <p>
            2. <b>Phase Shift Operator:</b> <span className="math"><b>U</b>(&theta;) = exp(i &theta; a&dagger;a)</span>, mapping entangled state to <span className="math">(e<sup>i N &theta;</sup>|N, 0&rang; + |0, N&rang;)/&radic;2</span>.
          </p>
          <p>
            3. <b>Super-resolution Fringe Modulations:</b>
          </p>
          <div className="stat" style={{ marginTop: '6px', background: '#f8fafc' }}>
            <span className="math">
              {stateMode === 'n00n'
                ? 'P&sub0;(&theta;) = cos&sup2;(N &middot; &theta; / 2)'
                : 'P&sub0;(&theta;) = cos&sup2;(&theta; / 2)'}
            </span>
          </div>
        </div>

        <div className="card">
          <h3>Fundamental Metrological Limits</h3>
          <div className="grid two">
            <div className="stat" style={{ borderColor: stateMode === 'coherent' ? 'var(--blue)' : 'var(--line)' }}>
              <div className="label">Standard Quantum Limit (SQL)</div>
              <div className="value" style={{ fontSize: '1.15rem' }}>
                &Delta;&theta; = {sqlVal} rad
              </div>
              <small className="muted">Classical shot noise: 1 / &radic;N</small>
            </div>
            <div className="stat" style={{ borderColor: stateMode === 'n00n' ? 'var(--purple)' : 'var(--line)', background: stateMode === 'n00n' ? '#f5f3ff' : '#fff' }}>
              <div className="label" style={{ color: stateMode === 'n00n' ? 'var(--purple)' : 'var(--muted)' }}>Heisenberg Limit (HL)</div>
              <div className="value" style={{ fontSize: '1.15rem', color: 'var(--purple)' }}>
                &Delta;&theta; = {hlVal} rad
              </div>
              <small className="muted">Entangled states (|N,0&rang;+|0,N&rang;): 1 / N</small>
            </div>
          </div>
          <p className="note" style={{ marginTop: '14px', background: stateMode === 'n00n' ? '#f5f3ff' : 'var(--gold-light)', color: stateMode === 'n00n' ? '#5b21b6' : '#78350f', borderLeftColor: stateMode === 'n00n' ? 'var(--purple)' : 'var(--gold)' }}>
            <b>Quantum Advantage in Sensing:</b> By utilizing non-linear quantum entanglement (such as NOON states generated via SPDC), measurement sensitivity improves by a factor of <b>{sensitivityGain}&times;</b> over classical light ($1/N$ vs $1/\sqrt{N}$). This quantum advantage enables next-generation atomic optical clocks, gravitational wave interferometry (LIGO), and biological sub-shot-noise microscopy.
          </p>
        </div>
      </div>
    </section>
  );
}
