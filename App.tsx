import React from 'react';
import HeroSection from './components/HeroSection';

const App: React.FC = () => {
  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <HeroSection />
    </main>
  );
};

export default App;