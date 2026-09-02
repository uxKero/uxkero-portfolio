import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Lifeline from './components/Lifeline';
import MinimalHome from './components/MinimalHome';
import Editorial from './components/editorial/Editorial';
import ThreePortfolio from './components/three/ThreePortfolio';
import Mundo from './components/mundo/Mundo';
import './components/mundo/mundo.css';
import BlogPost from './components/blog/BlogPost';
import WritingIndexPage from './components/blog/WritingIndexPage';
import AdminPanel from './components/admin/AdminPanel';
import Login from './components/admin/Login';
import GuiaPage from './components/guide/GuiaPage';
import Guia2Page from './components/guide/Guia2Page';
import GuidesIndexPage from './components/guide/GuidesIndexPage';
import { getInternalSlug } from './utils/blog-slugs';

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
  const reservedPaths = ['guia', 'guide', 'guides', 'writing', 'lifeline', 'minimal'];
  const blogSlug = blogPath && !reservedPaths.some(p => blogPath === p || blogPath.startsWith(p + '/'))
    ? (getInternalSlug(blogPath) || blogPath)
    : null;

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

  // Si no hay blog en la URL, mostrar la home editorial
  return <Editorial />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/writing" element={<WritingIndexPage />} />
        <Route path="/lifeline" element={<Lifeline />} />
        {/* Home anterior, a mano para comparar */}
        <Route path="/minimal" element={<MinimalHome />} />
        <Route path="/3d" element={<ThreePortfolio />} />
        <Route path="/mundo" element={<Mundo />} />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/openclaw" element={<div className="w-full h-screen overflow-hidden"><GuiaPage /></div>} />
        <Route path="/guides/openclaw-avanzado" element={<div className="w-full h-screen overflow-hidden"><Guia2Page /></div>} />
        {/* Legacy routes — kept for backwards compatibility */}
        <Route path="/guia" element={<div className="w-full h-screen overflow-hidden"><GuiaPage /></div>} />
        <Route path="/guide" element={<div className="w-full h-screen overflow-hidden"><GuiaPage /></div>} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
