import React from 'react';
import { LayoutDashboard, Search, Eye, Orbit } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'search', label: 'Search Puzzle (Grover)', icon: Search },
    { id: 'sensing', label: '✦ 3D Quantum Sensing & Metrology', icon: Eye, highlight: true },
    { id: 'ramsey', label: 'Atomic Ramsey Metrology', icon: Orbit },
  ];

  return (
    <nav id="nav">
      <div className="nav-brand">
        <img src="/logo.jpg" alt="Quantum Lab Logo" className="nav-logo" />
        <span className="nav-title">QML</span>
      </div>
      <div className="nav-tabs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
              style={
                item.highlight && !isActive
                  ? { color: 'var(--blue)', fontWeight: 700 }
                  : {}
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
