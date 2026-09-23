import React, { useState } from 'react';
import HeroHeader from './components/HeroHeader';
import Navbar from './components/Navbar';
import OverviewSection from './components/OverviewSection';
import SearchPuzzleSection from './components/SearchPuzzleSection';
import QuantumSensingSection from './components/QuantumSensingSection';
import RamseyMetrologySection from './components/RamseyMetrologySection';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="wrap">
      <HeroHeader />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ minHeight: '600px' }}>
        {activeTab === 'home' && <OverviewSection />}
        {activeTab === 'search' && <SearchPuzzleSection />}
        {activeTab === 'sensing' && (
          <QuantumSensingSection isActive={activeTab === 'sensing'} />
        )}
        {activeTab === 'ramsey' && <RamseyMetrologySection />}
      </main>

      <Footer />
    </div>
  );
}
