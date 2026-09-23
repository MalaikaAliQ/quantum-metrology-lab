import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap } from 'lucide-react';

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

  // Compute intensities
  const p0 = stateMode === 'coherent'
    ? Math.cos(theta / 2) ** 2
    : Math.cos((nPhotons * theta) / 2) ** 2;
  const p1 = 1 - p0;

  const sqlVal = (1 / Math.sqrt(nPhotons)).toFixed(4);
  const hlVal = (1 / nPhotons).toFixed(4);
  const thetaDeg = (theta * 180 / Math.PI).toFixed(0);

  // 3D Nodes
  const mziNodes = {
    laser: { x: -220, y: 0, z: 0 },
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

    const render = () => {
      const width = (canvas.width = container.clientWidth);
      const height = (canvas.height = container.clientHeight);

      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      // Grid Table
      ctx.lineWidth = 1;
      for (let gx = -260; gx <= 260; gx += 40) {
        const pA = projectMzi(gx, 40, -160, width, height, rotX, rotY);
        const pB = projectMzi(gx, 40, 160, width, height, rotX, rotY);
        if (pA && pB) {
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
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
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
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
            ctx.shadowBlur = 8;
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

      // Beams
      drawBeam(mziNodes.laser, mziNodes.bs1, '#ef4444', 3.5, true);
      // Upper Arm
      drawBeam(mziNodes.bs1, mziNodes.mTop, '#38bdf8', 2.5);
      drawBeam(mziNodes.mTop, { x: 90, y: 0, z: -100 }, '#38bdf8', 2.5);
      drawBeam({ x: 90, y: 0, z: -100 }, mziNodes.bs2, '#38bdf8', 2.5);
      // Lower Arm
      drawBeam(mziNodes.bs1, { x: -90, y: 0, z: 100 }, '#38bdf8', 2.5);
      drawBeam({ x: -90, y: 0, z: 100 }, mziNodes.mBot, '#38bdf8', 2.5);
      drawBeam(mziNodes.mBot, mziNodes.bs2, '#38bdf8', 2.5);
      // Detectors
      drawBeam(
        mziNodes.bs2,
        mziNodes.det0,
        `rgba(16, 185, 129, ${Math.max(0.2, p0)})`,
        3 + p0 * 3,
        true
      );
      drawBeam(
        mziNodes.bs2,
        mziNodes.det1,
        `rgba(168, 85, 247, ${Math.max(0.2, p1)})`,
        3 + p1 * 3,
        true
      );

      // Components
      const drawComponent = (pos, label, color, size) => {
        const p = projectMzi(pos.x, pos.y, pos.z, width, height, rotX, rotY);
        if (p) {
          ctx.fillStyle = color;
          ctx.strokeStyle = '#fff';
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

      drawComponent(mziNodes.laser, 'LASER [|ψ_in⟩]', '#ef4444', 8);
      drawComponent(mziNodes.bs1, 'BS 1 (50:50)', '#0284c7', 7);
      drawComponent(mziNodes.mTop, 'MIRROR 1', '#64748b', 6);
      drawComponent({ x: 90, y: 0, z: -100 }, 'MIRROR 2', '#64748b', 6);
      drawComponent({ x: -90, y: 0, z: 100 }, 'MIRROR 3', '#64748b', 6);
      drawComponent(mziNodes.mBot, 'MIRROR 4', '#64748b', 6);
      drawComponent(
        mziNodes.cell,
        `PHASE CELL [θ=${theta.toFixed(2)}]`,
        '#d97706',
        9
      );
      drawComponent(mziNodes.bs2, 'BS 2 (RECOMB)', '#0284c7', 7);
      drawComponent(
        mziNodes.det0,
        `DET 0 [${(p0 * nPhotons).toFixed(0)}]`,
        '#10b981',
        8
      );
      drawComponent(
        mziNodes.det1,
        `DET 1 [${(p1 * nPhotons).toFixed(0)}]`,
        '#a855f7',
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
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(pA.x, pA.y, 5 * pA.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pB.x, pB.y, 5 * pB.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          pulseRef.current.isPulsing = false;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotX, rotY, theta, nPhotons, stateMode, p0, p1, projectMzi]);

  return (
    <section className="active">
      <div className="card">
        <h2>3D Quantum Optical Metrology: Mach-Zehnder Interferometer</h2>
        <p className="muted">
          An optical field is split into two spatial arms by a 50:50 beam splitter (BS1). Arm 1 acquires an external phase shift <span class="math">&theta;</span> in a 3D phase cell. The arms recombine at BS2, causing spatial wave interference that modulates the detector ports. <b>Click and drag to rotate the optical setup.</b>
        </p>

        <div className="controls">
          <div className="slider-group">
            <label>
              <b>External Phase Shift (&theta;):</b>{' '}
              <span>{theta.toFixed(2)} rad ({thetaDeg}&deg;)</span>
            </label>
            <input
              type="range"
              min="0"
              max="6.28"
              step="0.04"
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <label>
              <b>Photon Flux (N):</b> <span>{nPhotons} photons</span>
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={nPhotons}
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
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid var(--border-soft)',
                fontSize: '.85rem',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="coherent">Coherent Beam (Classical Shot Noise SQL: &Delta;&theta; = 1/&radic;N)</option>
              <option value="n00n">NOON Entangled State (Quantum Heisenberg Limit: &Delta;&theta; = 1/N)</option>
            </select>
          </div>

          <button className="btn primary" onClick={handlePulse}>
            <Zap size={15} />
            <span>Pulse Optical Packets</span>
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
            <div>BEAM PROPAGATION: CONTINUOUS COHERENT MODES</div>
            <div>PORT 0 INTENSITY: {(p0 * 100).toFixed(1)}%</div>
            <div>PORT 1 INTENSITY: {(p1 * 100).toFixed(1)}%</div>
            <div>ROTATION: [X: {rotX.toFixed(2)}, Y: {rotY.toFixed(2)}]</div>
          </div>
          <div className="hud-panel">
            <span>Click and drag to rotate the 3D optical layout</span>
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

      {/* Equations & fundamental limits */}
      <div className="grid two" style={{ marginTop: '16px' }}>
        <div className="card">
          <h3>Interferometer State Equations</h3>
          <p>
            1. <b>Input State:</b> Mode <span className="math">a</span> receives coherent photons; Mode <span className="math">b</span> enters as vacuum <span className="math">|0&rang;</span>.
          </p>
          <p>
            2. <b>BS1 Unitary Transform:</b> Creates the spatial superposition <span className="math">|&psi;&sbmulti;1&rang; = (|1, 0&rang; + |0, 1&rang;)/&radic;2</span>.
          </p>
          <p>
            3. <b>Phase Shift Operator:</b> <span className="math"><b>U</b>(&theta;) = exp(i &theta; a&dagger;a)</span>, mapping state to <span className="math">(e<sup>i&theta;</sup>|1, 0&rang; + |0, 1&rang;)/&radic;2</span>.
          </p>
          <p>
            4. <b>Recombination (BS2):</b> Interference converts phase modulation into photon flux difference:
          </p>
          <div className="stat" style={{ marginTop: '10px', background: '#f8fafc' }}>
            <span className="math">&lang;N&sub0; &minus; N&sub1;&rang; = N &middot; cos(&theta;)</span>
          </div>
        </div>

        <div className="card">
          <h3>Fundamental Metrological Limits</h3>
          <div className="grid two">
            <div className="stat">
              <div className="label">Standard Quantum Limit (SQL)</div>
              <div className="value" style={{ fontSize: '1.15rem' }}>
                &Delta;&theta; = {sqlVal} rad
              </div>
              <small className="muted">Classical shot noise: 1 / &radic;N</small>
            </div>
            <div className="stat">
              <div className="label">Heisenberg Limit (HL)</div>
              <div className="value" style={{ fontSize: '1.15rem', color: 'var(--purple)' }}>
                &Delta;&theta; = {hlVal} rad
              </div>
              <small className="muted">Entangled states (|N,0&rang;+|0,N&rang;): 1 / N</small>
            </div>
          </div>
          <p className="note" style={{ marginTop: '14px' }}>
            <b>Quantum Advantage in Sensing:</b> By utilizing quantum entanglement (such as squeezed vacuum states injected into BS1's unused port, or NOON states), the measurement uncertainty narrows from the classical shot-noise limit <span className="math">&Delta;&theta; = 1/&radic;N</span> down to the fundamental quantum Heisenberg limit <span className="math">&Delta;&theta; = 1/N</span>. This exact technique enables gravitational wave detectors (LIGO/Virgo) to measure phase shifts of <span className="math">10<sup>&minus;10</sup> rad</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
