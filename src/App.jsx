import React, { useState } from 'react';
import HeroHeader from './components/HeroHeader';
import Navbar from './components/Navbar';
import OverviewSection from './components/OverviewSection';
import SearchPuzzleSection from './components/SearchPuzzleSection';
import QuantumSensingSection from './components/QuantumSensingSection';
import RamseyMetrologySection from './components/RamseyMetrologySection';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="wrap">
      <HeroHeader />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ minHeight: '600px' }}>
        <ErrorBoundary>
          {activeTab === 'home' && <OverviewSection />}
        </ErrorBoundary>

        <ErrorBoundary>
          {activeTab === 'search' && <SearchPuzzleSection />}
        </ErrorBoundary>

        <ErrorBoundary>
          {activeTab === 'sensing' && (
            <QuantumSensingSection isActive={activeTab === 'sensing'} />
          )}
        </ErrorBoundary>

        <ErrorBoundary>
          {activeTab === 'ramsey' && <RamseyMetrologySection />}
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
