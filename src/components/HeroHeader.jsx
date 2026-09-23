import React from 'react';
import { Atom } from 'lucide-react';

export default function HeroHeader() {
  return (
    <header className="hero">
      <div className="eyebrow">
        <Atom size={16} />
        <span>Interactive Physics Laboratory</span>
      </div>
      <h1>Quantum Search &amp; Precision Metrology Bench</h1>
      <p>
        A dual-purpose platform demonstrating algorithmic speedups via Grover amplitude amplification alongside the physical principles of Quantum Metrology: real-time 3D Mach-Zehnder optical interferometers, atomic Ramsey interferometry with 2D Bloch sphere projections, and SQL vs. Heisenberg limits.
      </p>
    </header>
  );
}
