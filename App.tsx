import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import BlogPost from './components/blog/BlogPost';
import AdminPanel from './components/admin/AdminPanel';
import Login from './components/admin/Login';
import GuiaPage from './components/guide/GuiaPage';
import { getInternalSlug } from './utils/blog-slugs';
import { useSEO } from './utils/useSEO';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState<'en' | 'es'>('en');

  // Rutas de admin
  if (location.pathname.startsWith('/admin')) {
    return null; // Las rutas de admin se manejan en Routes
  }

  // Detectar si estamos en una ruta de blog
  // Convertir slug de URL a slug interno si es necesario
  const blogPath = location.pathname.slice(1); // Remover el "/"
  // Excluir rutas reservadas de la detección de blog slugs
  const reservedPaths = ['guia'];
  const blogSlug = blogPath && !reservedPaths.includes(blogPath)
    ? (getInternalSlug(blogPath) || blogPath)
    : null;

  // SEO para página principal
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  useSEO({
    title: 'Alan Ponce | Product Design & Strategy Lead | UXKERO',
    description: 'Product Design & Strategy Lead specializing in Business Acumen and UX/UI Mastery. Transforming business vision into viable digital experiences.',
    url: baseUrl,
    type: 'website',
  });

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
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/guia" element={<div className="w-full min-h-screen overflow-y-auto"><GuiaPage /></div>} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;