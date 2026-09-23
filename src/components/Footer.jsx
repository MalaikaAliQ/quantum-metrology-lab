import React from 'react';
import { ExternalLink, Triangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <span>Quantum Metrology &amp; Algorithm Interactive Laboratory</span>
        <span style={{ margin: '0 8px' }}>•</span>
        <span>Built with React &amp; Vite</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="vercel-badge"
          style={{ textDecoration: 'none' }}
        >
          <Triangle size={12} fill="#fff" />
          <span>Vercel Ready</span>
        </a>
      </div>
    </footer>
  );
}
