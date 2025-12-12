import React from 'react';
import { motion } from 'framer-motion';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import {
  HierarchyComparison,
  ColorPalette,
  SpacingComparison,
  ConsistencyGrid,
  TouchSizeComparison,
  ButtonStates,
} from './visual-components';

interface BlogPostProps {
  onBack?: () => void;
  language?: 'en' | 'es';
  slug?: string;
  onToggleLanguage?: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ onBack, language = 'es', slug, onToggleLanguage }) => {
  const [copied, setCopied] = React.useState(false);
  const [shareMenuOpen, setShareMenuOpen] = React.useState(false);

  // Por ahora solo tenemos el primer blog completo, los demás mostrarán un placeholder
  const isFirstBlog = !slug || slug === 'principios-ui-impacto-real' || slug === 'ui-principles-real-impact';
  
  const blogData = isFirstBlog ? {
    title: language === 'es' ? 'Principios de UI: De la Teoría al Impacto Real' : 'UI Principles: From Theory to Real Impact',
    subtitle: language === 'es' 
      ? 'Por qué una interfaz "bonita" no es suficiente y cómo el diseño UI estratégico aumenta conversiones, retención y satisfacción del usuario'
      : 'Why a "pretty" interface isn\'t enough and how strategic UI design increases conversions, retention, and user satisfaction',
    date: language === 'es' ? '10 de diciembre, 2025' : 'December 10, 2025',
    readTime: language === 'es' ? '15 min lectura' : '15 min read',
    category: language === 'es' ? 'Estrategia de Diseño' : 'Design Strategy',
    author: 'Alan Ponce',
  } : {
    title: language === 'es' ? 'Artículo en Desarrollo' : 'Article Coming Soon',
    subtitle: language === 'es' 
      ? 'Este artículo estará disponible próximamente.'
      : 'This article will be available soon.',
    date: '',
    readTime: '',
    category: '',
    author: 'Alan Ponce',
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${blogData.title} - ${blogData.subtitle}`;

  const handleShare = (platform: 'twitter' | 'linkedin' | 'email' | 'copy') => {
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(blogData.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShareMenuOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Cerrar menú de compartir al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (shareMenuOpen && !target.closest('[data-share-menu]')) {
        setShareMenuOpen(false);
      }
    };

    if (shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareMenuOpen]);

  return (
    <div className="w-full bg-black text-white">
      {/* Header con Botón de Volver (solo en vista completa) */}
      {onBack && (
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-900">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <ArrowBackIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">{language === 'es' ? 'Volver al portfolio' : 'Back to portfolio'}</span>
            </button>
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
              >
                <LanguageIcon className="w-4 h-4" />
                <span>{language === 'en' ? 'Español' : 'English'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <motion.article
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12 relative z-10"
      >
        {/* Header con Botón de Traducir (solo si no hay onBack) */}
        {!onBack && onToggleLanguage && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
            >
              <LanguageIcon className="w-4 h-4" />
              <span>{language === 'en' ? 'Español' : 'English'}</span>
            </button>
          </div>
        )}

        {/* Portada del Blog */}
        <motion.div variants={itemVariants} className="mb-12 -mx-6 md:-mx-8">
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&auto=format&fit=crop"
              alt={blogData.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 mb-4">
                {blogData.category}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
                {blogData.title}
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-3xl">
                {blogData.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Header */}
        <motion.header variants={itemVariants} className="mb-12">

          {/* Meta Info con Compartir */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-zinc-500 mb-8">
            <div className="flex items-center gap-2">
              <CalendarTodayIcon className="w-4 h-4" />
              <span>{blogData.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <AccessTimeIcon className="w-4 h-4" />
              <span>{blogData.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{language === 'es' ? 'Por' : 'By'}</span>
              <span className="text-white font-medium">{blogData.author}</span>
            </div>
            
            {/* Share Button en la misma línea */}
            <div className="relative ml-auto" data-share-menu>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareMenuOpen(!shareMenuOpen);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-all"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{language === 'es' ? 'Compartir' : 'Share'}</span>
              </button>

              {shareMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[180px]"
                >
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <XIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white">X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                  >
                    <LinkedInIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-white">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                  >
                    <EmailIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-white">{language === 'es' ? 'Email' : 'Email'}</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">{language === 'es' ? '¡Copiado!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <ContentCopyIcon className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-white">{language === 'es' ? 'Copiar enlace' : 'Copy link'}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Contenido del Blog - Solo mostrar si es el primer blog */}
        {isFirstBlog ? (
          <>
            {/* Introducción */}
            <motion.section variants={itemVariants} className="mb-16">
          <p className="text-lg text-zinc-300 leading-relaxed mb-4">
            {language === 'es'
              ? 'Hace unos meses, trabajé en un proyecto donde dos equipos desarrollaron aplicaciones bancarias casi idénticas en funcionalidad. Una terminó con 4.8 estrellas y millones de usuarios felices. La otra apenas llegó a 3.2 estrellas y perdió usuarios semana tras semana.'
              : 'A few months ago, I worked on a project where two teams developed banking applications almost identical in functionality. One ended up with 4.8 stars and millions of happy users. The other barely reached 3.2 stars and lost users week after week.'}
          </p>
          <p className="text-lg text-zinc-300 leading-relaxed mb-4">
            <strong className="text-white">
              {language === 'es'
                ? 'La diferencia no estaba en el código. Estaba en cómo se veía y se sentía la interfaz.'
                : 'The difference wasn\'t in the code. It was in how the interface looked and felt.'}
            </strong>
          </p>
          <p className="text-lg text-zinc-300 leading-relaxed">
            {language === 'es'
              ? 'Esto me hizo darme cuenta de algo importante: en 2024, tener una interfaz "bonita" ya no es suficiente. Necesitas una UI que realmente funcione, que guíe a los usuarios y que genere resultados. Y créeme, cuando aplicas estos principios correctamente, los números hablan por sí solos:'
              : 'This made me realize something important: in 2024, having a "pretty" interface is no longer enough. You need a UI that really works, that guides users and generates results. And believe me, when you apply these principles correctly, the numbers speak for themselves:'}
          </p>
          <ul className="mt-6 space-y-4 text-lg text-zinc-300 list-none">
            <li className="flex items-baseline gap-3">
              <span className="text-emerald-400 flex-shrink-0 text-xl leading-none">•</span>
              <span className="leading-relaxed flex-1">{language === 'es' 
                ? <>He visto proyectos reducir el tiempo de onboarding hasta en un <strong className="text-white">60%</strong> solo mejorando la jerarquía visual</>
                : <>I've seen projects reduce onboarding time by up to <strong className="text-white">60%</strong> just by improving visual hierarchy</>}</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-emerald-400 flex-shrink-0 text-xl leading-none">•</span>
              <span className="leading-relaxed flex-1">{language === 'es'
                ? <>Las conversiones pueden aumentar entre <strong className="text-white">20% y 200%</strong> dependiendo del contexto y los cambios que hagas</>
                : <>Conversions can increase between <strong className="text-white">20% and 200%</strong> depending on context and the changes you make</>}</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-emerald-400 flex-shrink-0 text-xl leading-none">•</span>
              <span className="leading-relaxed flex-1">{language === 'es'
                ? 'Menos tickets de soporte porque la interfaz se explica sola'
                : 'Fewer support tickets because the interface explains itself'}</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-emerald-400 flex-shrink-0 text-xl leading-none">•</span>
              <span className="leading-relaxed flex-1">{language === 'es'
                ? 'Usuarios que vuelven porque la experiencia es realmente buena, no solo bonita'
                : 'Users who return because the experience is truly good, not just pretty'}</span>
            </li>
          </ul>
        </motion.section>

        {/* Sección 1: Jerarquía Visual */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '1. Jerarquía Visual: Guiando la Mirada del Usuario' : '1. Visual Hierarchy: Guiding the User\'s Eye'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'La jerarquía visual es básicamente organizar los elementos de tu interfaz según qué tan importantes son. Suena simple, pero es increíble cuántos proyectos la pasan por alto.'
              : 'Visual hierarchy is basically organizing the elements of your interface according to how important they are. Sounds simple, but it\'s incredible how many projects overlook it.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'Cuando alguien abre tu app, su cerebro decide en milisegundos si se queda o se va. Si todo se ve igual de importante, se siente abrumador. Si hay un orden claro, el usuario sabe exactamente dónde mirar primero. Mira la diferencia:'
              : 'When someone opens your app, their brain decides in milliseconds whether to stay or leave. If everything looks equally important, it feels overwhelming. If there\'s a clear order, the user knows exactly where to look first. See the difference:'}
          </p>
          <HierarchyComparison language={language} />
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-300">
              <strong className="text-emerald-400">{language === 'es' ? 'Dato real:' : 'Real data:'}</strong> {language === 'es'
                ? 'Airbnb logró aumentar sus reservas un 30% simplemente haciendo que el precio fuera más visible, pero sin que se sintiera agresivo. Es todo un arte.'
                : 'Airbnb managed to increase bookings by 30% simply by making the price more visible, but without it feeling aggressive. It\'s quite an art.'}
            </p>
          </div>
        </motion.section>

        {/* Sección 2: Color y Contraste */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '2. Color y Contraste: Más que Decoración' : '2. Color and Contrast: More than Decoration'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'Los colores brillantes llaman la atención, eso lo sabemos todos. Pero aquí está el truco: el color no es solo para que se vea bonito, es para comunicar algo específico.'
              : 'Bright colors catch attention, we all know that. But here\'s the trick: color isn\'t just to make it look pretty, it\'s to communicate something specific.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'Un ejemplo que siempre me gusta mencionar es Stripe. Usan ese azul característico (#635BFF) SOLO para las acciones principales. No lo desperdician en elementos secundarios. El resultado? Los usuarios entienden qué pueden hacer 3 veces más rápido que si usaran colores al azar.'
              : 'An example I always like to mention is Stripe. They use that characteristic blue (#635BFF) ONLY for primary actions. They don\'t waste it on secondary elements. The result? Users understand what they can do 3 times faster than if they used random colors.'}
          </p>
          <ColorPalette language={language} />
          <p className="text-base text-zinc-300 mt-6 leading-relaxed">
            {language === 'es'
              ? 'La clave está en tener un sistema claro: un color para acciones importantes, otro para secundarias, y colores neutros para el resto. Si todo grita por atención, nada la obtiene.'
              : 'The key is to have a clear system: one color for important actions, another for secondary ones, and neutral colors for the rest. If everything screams for attention, nothing gets it.'}
          </p>
        </motion.section>

        {/* Sección 3: Espaciado (Gestalt) */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '3. Espaciado: Agrupa lo que Va Junto' : '3. Spacing: Group What Goes Together'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'Hay una regla simple de la psicología visual: si dos cosas están cerca, nuestro cerebro asume que están relacionadas. Si están lejos, son cosas diferentes.'
              : 'There\'s a simple rule of visual psychology: if two things are close, our brain assumes they\'re related. If they\'re far apart, they\'re different things.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'Esto es especialmente importante en formularios. He visto proyectos donde simplemente agrupando campos relacionados (nombre y apellido juntos, dirección en su propio grupo), el tiempo de completar el formulario bajó de 4 minutos a 2. Y la tasa de abandono? Cayó un 35%. Solo con espaciado.'
              : 'This is especially important in forms. I\'ve seen projects where simply grouping related fields (first and last name together, address in its own group), form completion time dropped from 4 minutes to 2. And the abandonment rate? It dropped 35%. Just with spacing.'}
          </p>
          <SpacingComparison language={language} />
          <p className="text-base text-zinc-300 mt-6 leading-relaxed">
            {language === 'es'
              ? 'La próxima vez que diseñes un formulario, piensa: "¿Qué información va junta en la vida real?" Eso te dará la pista de cómo agruparla visualmente.'
              : 'Next time you design a form, think: "What information goes together in real life?" That will give you the clue on how to group it visually.'}
          </p>
        </motion.section>

        {/* Sección 4: Consistencia */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '4. Consistencia: Menos Decisiones, Más Confianza' : '4. Consistency: Fewer Decisions, More Confidence'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'Cuando todo se ve y funciona igual en tu producto, los usuarios se sienten cómodos. No tienen que aprender cómo funciona cada botón de nuevo. Es como volver a casa: sabes dónde está todo.'
              : 'When everything looks and works the same in your product, users feel comfortable. They don\'t have to learn how each button works again. It\'s like coming home: you know where everything is.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'Cada elemento inconsistente es una micro-decisión que el usuario tiene que tomar. Y esas micro-decisiones se acumulan hasta convertirse en frustración. Mira la diferencia:'
              : 'Every inconsistent element is a micro-decision the user has to make. And those micro-decisions accumulate until they become frustration. See the difference:'}
          </p>
          <ConsistencyGrid language={language} />
          <p className="text-base text-zinc-300 mt-6 leading-relaxed">
            {language === 'es'
              ? 'Si un botón se ve de una forma en una página y diferente en otra, el usuario se pregunta "¿esto hace lo mismo?" En lugar de actuar con confianza. La consistencia elimina esa duda.'
              : 'If a button looks one way on one page and different on another, the user wonders "does this do the same thing?" Instead of acting with confidence. Consistency eliminates that doubt.'}
          </p>
        </motion.section>

        {/* Sección 5: Accesibilidad */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '5. Accesibilidad: Diseñar para Todos' : '5. Accessibility: Designing for Everyone'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es' 
              ? 'Diseñar de forma accesible no es solo lo correcto, es inteligente. El 15% de la población mundial tiene alguna discapacidad. Si tu producto no es accesible, estás dejando fuera a mucha gente y potenciales clientes.'
              : 'Designing accessibly isn\'t just the right thing to do, it\'s smart. 15% of the world\'s population has some form of disability. If your product isn\'t accessible, you\'re leaving out a lot of people and potential customers.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'La accesibilidad va más allá de cumplir estándares. Se trata de crear experiencias que funcionen para todos, independientemente de sus capacidades. Empresas como BBC y Microsoft han demostrado que la accesibilidad no solo es ética, sino que también mejora la experiencia para todos los usuarios.'
              : 'Accessibility goes beyond meeting standards. It\'s about creating experiences that work for everyone, regardless of their abilities. Companies like BBC and Microsoft have shown that accessibility isn\'t just ethical, it also improves the experience for all users.'}
          </p>
          
          {/* Ejemplo visual de accesibilidad */}
          <div className="mb-8 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&auto=format&fit=crop"
                alt={language === 'es' ? 'Ejemplo de diseño accesible' : 'Accessible design example'}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-black/60 backdrop-blur-sm px-6 py-4 rounded-lg">
                  <p className="text-white font-semibold mb-2">
                    {language === 'es' ? 'BBC - Referencia Mundial en Accesibilidad' : 'BBC - World Reference in Accessibility'}
                  </p>
                  <p className="text-sm text-zinc-300">
                    {language === 'es' 
                      ? 'Alto contraste, navegación por teclado, screen readers'
                      : 'High contrast, keyboard navigation, screen readers'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <TouchSizeComparison language={language} />
          
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300 mb-3">
                <strong className="text-blue-400">
                  {language === 'es' ? 'Principios Clave de Accesibilidad:' : 'Key Accessibility Principles:'}
                </strong>
              </p>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>• <strong>{language === 'es' ? 'Contraste:' : 'Contrast:'}</strong> {language === 'es' ? 'Ratio mínimo 4.5:1 para texto normal (WCAG AA)' : 'Minimum 4.5:1 ratio for normal text (WCAG AA)'}</li>
                <li>• <strong>{language === 'es' ? 'Tamaños táctiles:' : 'Touch targets:'}</strong> {language === 'es' ? 'Mínimo 44x44px (Apple) o 48x48px (Google)' : 'Minimum 44x44px (Apple) or 48x48px (Google)'}</li>
                <li>• <strong>{language === 'es' ? 'Navegación por teclado:' : 'Keyboard navigation:'}</strong> {language === 'es' ? 'Todo debe ser accesible sin mouse' : 'Everything must be accessible without a mouse'}</li>
                <li>• <strong>{language === 'es' ? 'Textos alternativos:' : 'Alt text:'}</strong> {language === 'es' ? 'Imágenes descriptivas para screen readers' : 'Descriptive images for screen readers'}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-300">
                <strong className="text-emerald-400">
                  {language === 'es' ? 'Herramientas recomendadas:' : 'Recommended tools:'}
                </strong> {language === 'es' 
                  ? 'WebAIM Contrast Checker, WAVE, Lighthouse (Chrome DevTools), axe DevTools'
                  : 'WebAIM Contrast Checker, WAVE, Lighthouse (Chrome DevTools), axe DevTools'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Sección 6: Feedback */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'es' ? '6. Feedback: Di "Te Escuché"' : '6. Feedback: Say "I Heard You"'}
          </h2>
          <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
            {language === 'es'
              ? '¿Alguna vez hiciste click en un botón y no pasó nada? Probablemente hiciste click de nuevo, y otra vez, hasta que te frustraste. Eso es falta de feedback.'
              : 'Have you ever clicked a button and nothing happened? You probably clicked again, and again, until you got frustrated. That\'s lack of feedback.'}
          </p>
          <p className="text-base text-zinc-300 mb-8 leading-relaxed">
            {language === 'es'
              ? 'Los usuarios necesitan saber que el sistema los escuchó. Que está procesando. Y qué pasó al final. Cada elemento interactivo debería tener estados claros: cómo se ve en reposo, al pasar el mouse, al hacer click, cuando está deshabilitado. Mira:'
              : 'Users need to know the system heard them. That it\'s processing. And what happened in the end. Every interactive element should have clear states: how it looks at rest, on hover, on click, when disabled. Look:'}
          </p>
          <ButtonStates language={language} />
          <p className="text-base text-zinc-300 mt-6 leading-relaxed">
            {language === 'es'
              ? 'Estos pequeños detalles hacen que la interfaz se sienta viva y responsiva. El usuario nunca se pregunta "¿funcionó?" porque siempre hay una respuesta visual clara.'
              : 'These small details make the interface feel alive and responsive. The user never asks "did it work?" because there\'s always a clear visual response.'}
          </p>
        </motion.section>

            {/* CTA Final */}
            <motion.section variants={itemVariants} className="mt-20 pt-12 border-t border-zinc-900">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'es' ? '¿Listo para ponerlo en práctica?' : 'Ready to put this into practice?'}
                </h3>
                <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                  {language === 'es' 
                    ? 'Estos no son conceptos abstractos. Son cosas que puedes empezar a aplicar hoy mismo en tus proyectos. La próxima vez que diseñes una interfaz, recuerda estos principios y verás la diferencia.'
                    : 'These aren\'t abstract concepts. They\'re things you can start applying to your projects today. Next time you design an interface, remember these principles and you\'ll see the difference.'}
                </p>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#635BFF] text-white rounded-lg font-medium hover:bg-[#5548FF] transition-colors"
                  >
                    {language === 'es' ? 'Volver al portfolio' : 'Back to portfolio'}
                  </button>
                )}
              </div>
            </motion.section>
          </>
        ) : (
          <motion.section variants={itemVariants} className="mb-16 text-center py-20">
            <p className="text-xl text-zinc-400 mb-8">
              {language === 'es' 
                ? 'Este artículo estará disponible próximamente.'
                : 'This article will be available soon.'}
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#635BFF] text-white rounded-lg font-medium hover:bg-[#5548FF] transition-colors"
              >
                {language === 'es' ? 'Volver al portfolio' : 'Back to portfolio'}
              </button>
            )}
          </motion.section>
        )}
      </motion.article>
    </div>
  );
};

export default BlogPost;
