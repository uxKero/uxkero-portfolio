import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import BlogPost from './components/blog/BlogPost';
import { getInternalSlug } from './utils/blog-slugs';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState<'en' | 'es'>('en');

  // Detectar si estamos en una ruta de blog
  const blogPath = location.pathname.slice(1); // Remover el "/"
  const blogSlug = blogPath ? getInternalSlug(blogPath) : null;

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Si hay un slug de blog en la URL, mostrar el blog directamente
  if (blogSlug) {
    return (
      <div className="w-full h-screen overflow-y-auto">
        <BlogPost
          onBack={() => navigate('/')}
          language={language}
          slug={blogSlug}
          onToggleLanguage={toggleLanguage}
        />
      </div>
    );
  }

  // Si no hay blog en la URL, mostrar el portfolio normal
  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <HeroSection />
    </main>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;