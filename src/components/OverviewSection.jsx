import React from 'react';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export default function OverviewSection() {
  return (
    <section className="active">
      <div className="grid two">
        <div className="card">
          <h2>Laboratory Modules</h2>
          <p>
            This laboratory links discrete quantum computing algorithms with continuous-variable physical metrology and precise state vector visualization.
          </p>
          <div className="grid three" style={{ marginTop: '14px' }}>
            <div className="stat">
              <div className="label">Algorithms</div>
              <div className="value">
                <i className="math">O</i>(&radic;<i className="math">N</i>)
              </div>
              <small className="muted">Grover register</small>
            </div>
            <div className="stat">
              <div className="label">3D Phase Arm</div>
              <div className="value">&Delta;&theta; Precision</div>
              <small className="muted">Interferometry</small>
            </div>
            <div className="stat">
              <div className="label">Heisenberg Limit</div>
              <div className="value">
                1 / <i className="math">N</i>
              </div>
              <small className="muted">Entangled states</small>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Physical Core Principles</h2>
          <p className="note">
            <b>1. Grover Search:</b> Coherent unitary evolution rotates the state vector toward a marked basis state by reflecting amplitudes about their average, achieving quadratic speedup over classical brute-force checks.
          </p>
          <p className="note" style={{ marginTop: '8px' }}>
            <b>2. Quantum Metrology:</b> Quantum sensors convert unknown physical quantities (magnetic fields, gravity, acceleration) into phase shifts{' '}
            <span className="math">&Delta;&theta; = &gamma; B t</span>. Entanglement allows detection sensitivity to surpass the classical shot-noise limit{' '}
            <span className="math">1/&radic;N</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
