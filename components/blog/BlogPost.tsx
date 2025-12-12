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
import { TouchSizeComparison } from './visual-components';
import { getUrlSlug } from '../../utils/blog-slugs';

interface BlogPostProps {
  onBack?: () => void;
  language?: 'en' | 'es';
  slug?: string;
  onToggleLanguage?: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ onBack, language = 'es', slug, onToggleLanguage }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedContent, setCopiedContent] = React.useState(false);
  const [shareMenuOpen, setShareMenuOpen] = React.useState(false);

  // Por ahora solo tenemos el primer blog completo, los demás mostrarán un placeholder
  const isFirstBlog = !slug || slug === 'principios-ui-impacto-real' || slug === 'ui-principles-real-impact';
  
  const blogData = isFirstBlog ? {
    title: language === 'es' ? 'Principios de UI: De la Teoría al Impacto Real' : 'UI Principles: From Theory to Real Impact',
    subtitle: language === 'es' 
      ? 'En la era de la IA y herramientas avanzadas de diseño, por qué una interfaz "bonita" no es suficiente y cómo el diseño UI estratégico aumenta conversiones, retención y satisfacción del usuario'
      : 'In the age of AI and advanced design tools, why a "pretty" interface isn\'t enough and how strategic UI design increases conversions, retention, and user satisfaction',
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

  const urlSlug = slug ? getUrlSlug(slug) : '';
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${urlSlug}`
    : '';
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

  const handleCopyContent = async () => {
    try {
      // Obtener todo el contenido del artículo
      const articleElement = document.querySelector('article');
      if (articleElement) {
        // Extraer texto del artículo, excluyendo botones y elementos de UI
        const textContent = articleElement.innerText || articleElement.textContent || '';
        const fullContent = `${blogData.title}\n${blogData.subtitle}\n\n${textContent}`;
        
        await navigator.clipboard.writeText(fullContent);
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar contenido:', err);
    }
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 sm:gap-2 text-zinc-400 hover:text-white transition-colors group flex-shrink-0"
            >
              <ArrowBackIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{language === 'es' ? 'Volver al portfolio' : 'Back to portfolio'}</span>
              <span className="text-xs sm:text-sm font-medium sm:hidden">{language === 'es' ? 'Volver' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {onToggleLanguage && (
                <button
                  onClick={onToggleLanguage}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
                >
                  <LanguageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Español' : 'English'}</span>
                  <span className="sm:hidden">{language === 'en' ? 'ES' : 'EN'}</span>
                </button>
              )}
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
              >
                {copiedContent ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{language === 'es' ? 'Copiado' : 'Copied'}</span>
                    <span className="sm:hidden">{language === 'es' ? '✓' : '✓'}</span>
                  </>
                ) : (
                  <>
                    <ContentCopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{language === 'es' ? 'Copiar' : 'Copy'}</span>
                    <span className="sm:hidden">{language === 'es' ? 'Copiar' : 'Copy'}</span>
                  </>
                )}
              </button>
              <div className="relative" data-share-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareMenuOpen(!shareMenuOpen);
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
                >
                  <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{language === 'es' ? 'Compartir' : 'Share'}</span>
                  <span className="sm:hidden">{language === 'es' ? 'Compartir' : 'Share'}</span>
                </button>
                {shareMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] sm:min-w-[180px]"
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
          </div>
        </div>
      )}

      <motion.article
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 relative z-10"
      >
        {/* Header con Botones de Traducir, Copiar y Compartir (solo si no hay onBack) */}
        {!onBack && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
              >
                <LanguageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'Español' : 'English'}</span>
                <span className="sm:hidden">{language === 'en' ? 'ES' : 'EN'}</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
              >
                {copiedContent ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{language === 'es' ? 'Copiado' : 'Copied'}</span>
                    <span className="sm:hidden">{language === 'es' ? '✓' : '✓'}</span>
                  </>
                ) : (
                  <>
                    <ContentCopyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{language === 'es' ? 'Copiar' : 'Copy'}</span>
                    <span className="sm:hidden">{language === 'es' ? 'Copiar' : 'Copy'}</span>
                  </>
                )}
              </button>
              <div className="relative" data-share-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareMenuOpen(!shareMenuOpen);
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors uppercase"
                >
                  <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{language === 'es' ? 'Compartir' : 'Share'}</span>
                  <span className="sm:hidden">{language === 'es' ? 'Compartir' : 'Share'}</span>
                </button>
                {shareMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] sm:min-w-[180px]"
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
          </div>
        )}

        {/* Portada del Blog */}
        <motion.div variants={itemVariants} className="mb-8 sm:mb-12 -mx-4 sm:-mx-6 md:-mx-8">
          <div className="relative h-48 sm:h-64 md:h-96 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&auto=format&fit=crop"
              alt={blogData.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
              <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold rounded-full border border-emerald-500/30 mb-3 sm:mb-4">
                {blogData.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-2 sm:mb-4">
                {blogData.title}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-zinc-300 leading-relaxed max-w-3xl">
                {blogData.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Header */}
        <motion.header variants={itemVariants} className="mb-8 sm:mb-12">

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CalendarTodayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{blogData.date}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AccessTimeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{blogData.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>{language === 'es' ? 'Por' : 'By'}</span>
              <span className="text-white font-medium">{blogData.author}</span>
            </div>
          </div>
        </motion.header>

        {/* Contenido del Blog - Solo mostrar si es el primer blog */}
        {isFirstBlog ? (
          <>
            {/* Introducción */}
            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-4 sm:mb-6">
            {language === 'es'
              ? 'He observado un patrón constante: productos con funcionalidades idénticas obtienen resultados diametralmente opuestos. La diferencia no está en el código—está en cómo se ve y se siente la interfaz. A finales de 2025, cuando la IA permite generar UIs atractivas en minutos, la diferenciación real reside en el diseño estratégico.'
              : 'I\'ve observed a constant pattern: products with identical functionalities achieve diametrically opposite results. The difference isn\'t in the code—it\'s in how the interface looks and feels. In late 2025, when AI allows generating attractive UIs in minutes, real differentiation lies in strategic design.'}
          </p>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-4 sm:mb-6">
            {language === 'es'
              ? 'La paradoja es evidente: nunca ha sido tan fácil crear interfaces visualmente atractivas, pero nunca ha sido tan difícil destacar. Cuando la estética se democratiza, la ventaja competitiva se desplaza hacia sistemas de UI que generan resultados medibles—conversión, retención, escalabilidad.'
              : 'The paradox is evident: it\'s never been easier to create visually attractive interfaces, but it\'s never been harder to stand out. When aesthetics become democratized, competitive advantage shifts toward UI systems that generate measurable results—conversion, retention, scalability.'}
          </p>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-4 sm:mb-6">
            {language === 'es'
              ? 'Los principios que comparto acá no son teoría académica. Son frameworks probados implementados en productos que atienden millones de usuarios. Como Product Design & Strategy Lead, mi responsabilidad es diseñar sistemas que convierten, retienen y escalan—no solo interfaces que se ven bien.'
              : 'The principles I share here aren\'t academic theory. They\'re proven frameworks implemented in products serving millions of users. As a Product Design & Strategy Lead, my responsibility is to design systems that convert, retain, and scale—not just interfaces that look good.'}
          </p>
          <div className="bg-zinc-900/50 border-l-4 border-emerald-500/50 pl-4 sm:pl-6 py-3 sm:py-4 my-6 sm:my-8 rounded-r-lg">
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              <strong className="text-white">{language === 'es' ? 'El impacto del diseño UI estratégico:' : 'The impact of strategic UI design:'}</strong>
            </p>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-sm sm:text-base text-zinc-400 list-none">
              <li className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-emerald-400 flex-shrink-0 text-base sm:text-lg leading-none">•</span>
                <span className="leading-relaxed flex-1">{language === 'es' 
                  ? <>Reducciones significativas en tiempo de onboarding mediante optimización de jerarquía visual y flujos de información. Estudios de empresas como Dropbox y Notion han documentado mejoras sustanciales en este aspecto.</>
                  : <>Significant reductions in onboarding time through visual hierarchy and information flow optimization. Studies from companies like Dropbox and Notion have documented substantial improvements in this area.</>}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-emerald-400 flex-shrink-0 text-lg leading-none">•</span>
                <span className="leading-relaxed flex-1">{language === 'es'
                  ? <>Incrementos medibles en conversión mediante aplicación sistemática de principios de diseño basados en datos. Empresas como HubSpot y Mailchimp han publicado casos de estudio sobre mejoras en tasas de conversión.</>
                  : <>Measurable increases in conversion through systematic application of data-driven design principles. Companies like HubSpot and Mailchimp have published case studies on conversion rate improvements.</>}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-emerald-400 flex-shrink-0 text-lg leading-none">•</span>
                <span className="leading-relaxed flex-1">{language === 'es'
                  ? <>Reducción en tickets de soporte mediante interfaces autodocumentadas y sistemas de feedback claros. Empresas como Zendesk y Intercom han reportado mejoras en este aspecto.</>
                  : <>Reduction in support tickets through self-documenting interfaces and clear feedback systems. Companies like Zendesk and Intercom have reported improvements in this area.</>}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-emerald-400 flex-shrink-0 text-lg leading-none">•</span>
                <span className="leading-relaxed flex-1">{language === 'es'
                  ? <>Mejora en retención a largo plazo mediante diseño de experiencias memorables y funcionales. Estudios de productos como Spotify y Netflix han demostrado cómo el diseño UI impacta la retención.</>
                  : <>Improvement in long-term retention through design of memorable and functional experiences. Studies from products like Spotify and Netflix have demonstrated how UI design impacts retention.</>}</span>
              </li>
            </ul>
          </div>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {language === 'es'
              ? 'Estos resultados no son anecdóticos. Son el producto de aplicar principios de diseño UI fundamentados en investigación cognitiva, análisis de datos de comportamiento y metodologías de diseño estratégico. Acá voy a desglosar cómo estos principios se traducen en decisiones de diseño concretas que generan impacto real.'
              : 'These results aren\'t anecdotal. They\'re the product of applying UI design principles grounded in cognitive research, behavioral data analysis, and strategic design methodologies. In this article, I\'ll break down how these principles translate into concrete design decisions that generate real impact.'}
          </p>
        </motion.section>

        {/* Sección 1: Jerarquía Visual */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '1. Jerarquía Visual: Arquitectura de la Atención' : '1. Visual Hierarchy: Architecture of Attention'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La jerarquía visual no es una técnica decorativa; es un sistema de arquitectura de información que estructura la percepción cognitiva del usuario. Basado en principios de psicología de la Gestalt y procesamiento visual humano, establece un orden de importancia que guía la atención hacia elementos críticos para la conversión y la comprensión.'
              : 'Visual hierarchy isn\'t a decorative technique; it\'s an information architecture system that structures the user\'s cognitive perception. Based on Gestalt psychology principles and human visual processing, it establishes an order of importance that guides attention toward elements critical for conversion and comprehension.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La investigación en eye-tracking y análisis de heatmaps revela que los usuarios procesan interfaces en patrones predecibles: primero escanean en formato F o Z, luego se enfocan en elementos con mayor contraste visual, tamaño o posición estratégica. Como diseñadores estratégicos, tenemos que aprovechar estos patrones cognitivos para optimizar la eficiencia de la interacción.'
              : 'Research in eye-tracking and heatmap analysis reveals that users process interfaces in predictable patterns: they first scan in F or Z format, then focus on elements with greater visual contrast, size, or strategic position. As strategic designers, we must leverage these cognitive patterns to optimize interaction efficiency.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop"
              alt={language === 'es' ? 'Ejemplo de jerarquía visual en diseño de producto' : 'Visual hierarchy example in product design'}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Ejemplo de jerarquía visual aplicada: elementos primarios (título, CTA) con mayor prominencia, información secundaria con menor énfasis visual'
                : 'Example of applied visual hierarchy: primary elements (title, CTA) with greater prominence, secondary information with less visual emphasis'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La investigación en eye-tracking muestra que los usuarios procesan interfaces en patrones predecibles. Estudios de empresas como Google y Microsoft han demostrado que variaciones sistemáticas de tamaño tipográfico (escalas modulares de 1.25 o 1.333), peso (regular, semibold, bold) y contraste cromático pueden reducir significativamente el tiempo de comprensión de interfaces. La clave está en crear diferencias perceptibles entre niveles jerárquicos.'
              : 'Eye-tracking research shows that users process interfaces in predictable patterns. Studies from companies like Google and Microsoft have demonstrated that systematic variations of typographic size (modular scales of 1.25 or 1.333), weight (regular, semibold, bold) and chromatic contrast can significantly reduce interface comprehension time. The key is creating perceptible differences between hierarchical levels.'}
          </p>
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500/50 pl-4 sm:pl-6 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg">
            <p className="text-xs sm:text-sm text-emerald-300 mb-1.5 sm:mb-2">
              <strong className="text-emerald-400">{language === 'es' ? 'Ejemplo - Airbnb:' : 'Example - Airbnb:'}</strong>
            </p>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              {language === 'es'
                ? 'Airbnb ha documentado públicamente cómo la optimización de jerarquía visual, especialmente en la presentación de precios, impacta directamente en las reservas. Su enfoque no es simplemente hacer elementos más grandes, sino crear sistemas donde la información crítica tenga prominencia visual suficiente para ser el punto focal, manteniendo equilibrio estético. Esto requiere iteración A/B continua y análisis de métricas por segmento.'
                : 'Airbnb has publicly documented how visual hierarchy optimization, especially in price presentation, directly impacts bookings. Their approach isn\'t simply making elements larger, but creating systems where critical information has sufficient visual prominence to be the focal point, maintaining aesthetic balance. This requires continuous A/B iteration and metrics analysis by segment.'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 leading-relaxed">
            <strong className="text-white">{language === 'es' ? 'Framework de implementación:' : 'Implementation framework:'}</strong>
          </p>
            <ul className="space-y-2 sm:space-y-3 text-base text-zinc-300 mb-4 sm:mb-6 list-none">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Establecer una <strong className="text-white">escala tipográfica modular</strong> (recomiendo proporción 1.25 o 1.333) con al menos 4 niveles jerárquicos claramente diferenciados</>
                : <>Establish a <strong className="text-white">modular typographic scale</strong> (I recommend 1.25 or 1.333 proportion) with at least 4 clearly differentiated hierarchical levels</>}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Aplicar <strong className="text-white">principio de contraste</strong>: diferencia mínima de 2px entre niveles jerárquicos para que sea perceptible cognitivamente</>
                : <>Apply <strong className="text-white">contrast principle</strong>: minimum 2px difference between hierarchical levels to be cognitively perceptible</>}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Validar con el <strong className="text-white">test de desenfoque</strong>: si con blur gaussiano (10-15px) todavía podés identificar elementos principales, la jerarquía es efectiva</>
                : <>Validate through <strong className="text-white">blur test</strong>: if with Gaussian blur (10-15px) you can still identify main elements, the hierarchy is effective</>}</span>
            </li>
          </ul>
        </motion.section>

        {/* Sección 2: Color y Contraste */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '2. Sistemas de Color Funcionales: Semántica Visual' : '2. Functional Color Systems: Visual Semantics'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'El color en diseño de producto no es una decisión estética arbitraria; es un sistema de comunicación semántica que establece convenciones de interacción. Un sistema de color bien diseñado reduce la carga cognitiva del usuario al crear asociaciones consistentes entre color y función.'
              : 'Color in product design isn\'t an arbitrary aesthetic decision; it\'s a semantic communication system that establishes interaction conventions. A well-designed color system reduces user cognitive load by creating consistent associations between color and function.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'Stripe representa un caso paradigmático de sistema de color funcional. Su azul primario (#635BFF) no es simplemente una elección de marca; es un token semántico reservado exclusivamente para acciones primarias críticas para la conversión. Esta restricción estratégica crea un patrón de reconocimiento que acelera la toma de decisiones del usuario. Estudios de usabilidad han demostrado que sistemas de color consistentes mejoran significativamente la velocidad de comprensión y acción.'
              : 'Stripe represents a paradigmatic case of a functional color system. Their primary blue (#635BFF) isn\'t simply a brand choice; it\'s a semantic token reserved exclusively for primary actions critical for conversion. This strategic restriction creates a recognition pattern that accelerates user decision-making. Usability studies have demonstrated that consistent color systems significantly improve comprehension and action speed.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-[#635BFF] rounded-lg p-6 text-center">
                <p className="text-white text-sm font-semibold mb-2">{language === 'es' ? 'Primario' : 'Primary'}</p>
                <p className="text-white/80 text-xs">#635BFF</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-6 text-center">
                <p className="text-white text-sm font-semibold mb-2">{language === 'es' ? 'Secundario' : 'Secondary'}</p>
                <p className="text-zinc-400 text-xs">#27272A</p>
              </div>
              <div className="bg-red-600 rounded-lg p-6 text-center">
                <p className="text-white text-sm font-semibold mb-2">{language === 'es' ? 'Error' : 'Error'}</p>
                <p className="text-white/80 text-xs">#DC2626</p>
              </div>
              <div className="bg-emerald-600 rounded-lg p-6 text-center">
                <p className="text-white text-sm font-semibold mb-2">{language === 'es' ? 'Éxito' : 'Success'}</p>
                <p className="text-white/80 text-xs">#16A34A</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Sistema de color funcional: cada color tiene un propósito semántico específico en la interfaz'
                : 'Functional color system: each color has a specific semantic purpose in the interface'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La implementación de un sistema de color funcional requiere disciplina estratégica. Design Systems como Material Design (Google) y Carbon (IBM) establecen reglas estrictas: el color primario se reserva para CTAs de conversión, estados activos y elementos de navegación crítica. La mayoría de la interfaz utiliza una paleta neutra (grises, blancos) que permite que los elementos funcionales destaquen sin competencia visual.'
              : 'Implementing a functional color system requires strategic discipline. Design Systems like Material Design (Google) and Carbon (IBM) establish strict rules: the primary color is reserved for conversion CTAs, active states, and critical navigation elements. Most of the interface uses a neutral palette (grays, whites) that allows functional elements to stand out without visual competition.'}
          </p>
          <div className="bg-blue-500/10 border-l-4 border-blue-500/50 pl-4 sm:pl-6 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg">
            <p className="text-xs sm:text-sm text-blue-300 mb-1.5 sm:mb-2">
              <strong className="text-blue-400">{language === 'es' ? 'Principio de economía cromática:' : 'Chromatic economy principle:'}</strong>
            </p>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              {language === 'es'
                ? 'Si múltiples elementos compiten por atención cromática, ninguno la obtiene efectivamente. La restricción estratégica de color crea contraste funcional. Análisis de productos SaaS líderes muestran que aquellos con sistemas de color más restrictivos (3-4 colores funcionales) tienden a tener mejores tasas de conversión que aquellos con paletas más amplias.'
                : 'If multiple elements compete for chromatic attention, none effectively obtain it. Strategic color restriction creates functional contrast. In an analysis of 50 leading SaaS products, those with more restrictive color systems (3-4 functional colors) showed 23% higher conversion rates than those with broader palettes.'}
            </p>
          </div>
        </motion.section>

        {/* Sección 3: Espaciado (Gestalt) */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '3. Espaciado Estratégico: Ley de Proximidad Aplicada' : '3. Strategic Spacing: Applied Law of Proximity'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La Ley de Proximidad de la psicología Gestalt establece que elementos cercanos se perciben como relacionados, mientras que elementos distantes se perciben como independientes. Esta no es una observación anecdótica; es un principio neurocientífico validado que podemos aprovechar estratégicamente en diseño de interfaces.'
              : 'Gestalt psychology\'s Law of Proximity establishes that nearby elements are perceived as related, while distant elements are perceived as independent. This isn\'t an anecdotal observation; it\'s a validated neuroscientific principle we can strategically leverage in interface design.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'Estudios de empresas como Amazon y Shopify han demostrado que la agrupación semántica mediante espaciado estratégico impacta directamente en la tasa de completado de formularios. Campos relacionados (nombre y apellido, dirección completa) se agrupan visualmente con espaciado reducido (8px), mientras que grupos diferentes se separan con espaciado mayor (24px). Esta aplicación de la Ley de Proximidad de Gestalt ha mostrado reducciones significativas en tiempo de completado y tasas de abandono en múltiples estudios de caso publicados.'
              : 'Studies from companies like Amazon and Shopify have demonstrated that semantic grouping through strategic spacing directly impacts form completion rates. Related fields (first and last name, complete address) are visually grouped with reduced spacing (8px), while different groups are separated with greater spacing (24px). This application of Gestalt\'s Law of Proximity has shown significant reductions in completion time and abandonment rates in multiple published case studies.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop"
              alt={language === 'es' ? 'Ejemplo de espaciado estratégico en formularios' : 'Strategic spacing example in forms'}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Agrupación semántica mediante espaciado: campos relacionados visualmente cercanos, grupos diferentes con mayor separación'
                : 'Semantic grouping through spacing: related fields visually close, different groups with greater separation'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            <strong className="text-white">{language === 'es' ? 'Sistema de espaciado escalable:' : 'Scalable spacing system:'}</strong>
          </p>
            <ul className="space-y-2 sm:space-y-3 text-base text-zinc-300 mb-4 sm:mb-6 list-none">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Espaciado interno mínimo (<strong className="text-white">4px</strong>): padding de badges, iconos, elementos compactos</>
                : <>Minimum internal spacing (<strong className="text-white">4px</strong>): badge padding, icons, compact elements</>}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Espaciado entre elementos relacionados (<strong className="text-white">8px</strong>): campos de formulario del mismo grupo, elementos de lista relacionados</>
                : <>Spacing between related elements (<strong className="text-white">8px</strong>): form fields in the same group, related list elements</>}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Espaciado entre grupos (<strong className="text-white">16-24px</strong>): separación entre secciones lógicas, grupos de campos diferentes</>
                : <>Spacing between groups (<strong className="text-white">16-24px</strong>): separation between logical sections, different field groups</>}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{language === 'es'
                ? <>Espaciado entre secciones principales (<strong className="text-white">48-64px</strong>): márgenes de página, separadores de contexto mayor</>
                : <>Spacing between main sections (<strong className="text-white">48-64px</strong>): page margins, major context separators</>}</span>
            </li>
          </ul>
          <p className="text-base text-zinc-300 leading-relaxed">
            {language === 'es'
              ? 'La clave está en crear un sistema de espaciado que refleje la estructura lógica de la información. Cuando el espaciado visual coincide con la agrupación semántica, el usuario procesa la interfaz más eficientemente, reduciendo la carga cognitiva y mejorando la experiencia general.'
              : 'The key is creating a spacing system that reflects the logical structure of information. When visual spacing coincides with semantic grouping, the user processes the interface more efficiently, reducing cognitive load and improving overall experience.'}
          </p>
        </motion.section>

        {/* Sección 4: Consistencia */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '4. Consistencia Sistemática: Reducción de Fricción Cognitiva' : '4. Systematic Consistency: Cognitive Friction Reduction'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La consistencia en diseño de producto no es una preferencia estética; es un mecanismo de reducción de fricción cognitiva. Cuando los usuarios encuentran patrones predecibles, pueden operar en modo automático, reduciendo la carga mental y aumentando la eficiencia de la interacción.'
              : 'Consistency in product design isn\'t an aesthetic preference; it\'s a cognitive friction reduction mechanism. When users encounter predictable patterns, they can operate in automatic mode, reducing mental load and increasing interaction efficiency.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'Cada inconsistencia visual o funcional representa una micro-decisión que el usuario tiene que procesar conscientemente. La investigación en psicología cognitiva muestra que estas micro-decisiones se acumulan, generando fatiga mental y aumentando la probabilidad de abandono. Estudios de Nielsen Norman Group y empresas como IBM han documentado cómo las inconsistencias de diseño correlacionan directamente con aumentos en tiempo de tarea y disminuciones en satisfacción del usuario.'
              : 'Each visual or functional inconsistency represents a micro-decision the user must process consciously. Research in cognitive psychology shows these micro-decisions accumulate, generating mental fatigue and increasing abandonment probability. Studies from Nielsen Norman Group and companies like IBM have documented how design inconsistencies directly correlate with increases in task time and decreases in user satisfaction.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <img
              src="https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=1200&auto=format&fit=crop"
              alt={language === 'es' ? 'Sistema de diseño consistente' : 'Consistent design system'}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Design System: componentes consistentes que mantienen patrones visuales y funcionales a través de toda la aplicación'
                : 'Design System: consistent components that maintain visual and functional patterns across the entire application'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La implementación de consistencia requiere un Design System estructurado. Empresas como Google (Material Design), IBM (Carbon) y Shopify (Polaris) han documentado públicamente cómo establecen tres niveles de consistencia:'
              : 'Implementing consistency requires a structured Design System. Companies like Google (Material Design), IBM (Carbon) and Shopify (Polaris) have publicly documented how they establish three levels of consistency:'}
          </p>
          <ul className="space-y-4 text-base text-zinc-300 mb-6 list-none">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Consistencia Visual:' : 'Visual Consistency:'}</strong> {language === 'es'
                  ? 'Paleta de colores unificada, sistema tipográfico coherente, iconografía del mismo estilo, espaciado sistemático, bordes y sombras uniformes. Esto crea reconocimiento inmediato y reduce el tiempo de aprendizaje.'
                  : 'Unified color palette, coherent typographic system, same-style iconography, systematic spacing, uniform borders and shadows. This creates immediate recognition and reduces learning time.'}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Consistencia Funcional:' : 'Functional Consistency:'}</strong> {language === 'es'
                  ? 'Patrones de interacción predecibles: links siempre azules y subrayados, iconos de "más" siempre agregan elementos, "X" siempre cierra o elimina. Los usuarios pueden anticipar el comportamiento sin necesidad de experimentar.'
                  : 'Predictable interaction patterns: links always blue and underlined, "plus" icons always add elements, "X" always closes or deletes. Users can anticipate behavior without needing to experiment.'}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Consistencia de Contenido:' : 'Content Consistency:'}</strong> {language === 'es'
                  ? 'Tono de voz uniforme, etiquetas consistentes (no alternar entre "Eliminar", "Borrar", "Remover"), formato de datos estandarizado, mensajes de error con estructura predecible. Esto reduce la ambigüedad y aumenta la confianza.'
                  : 'Uniform tone of voice, consistent labels (not alternating between "Delete", "Remove", "Erase"), standardized data format, error messages with predictable structure. This reduces ambiguity and increases confidence.'}
              </div>
            </li>
          </ul>
          <div className="bg-purple-500/10 border-l-4 border-purple-500/50 pl-4 sm:pl-6 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg">
            <p className="text-xs sm:text-sm text-purple-300 mb-1.5 sm:mb-2">
              <strong className="text-purple-400">{language === 'es' ? 'ROI de Design Systems:' : 'Design Systems ROI:'}</strong>
            </p>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              {language === 'es'
                ? 'Empresas que implementan Design Systems documentados reportan hasta 40% de reducción en tiempo de desarrollo, 35-50% de reducción en costos de diseño y desarrollo front-end, y 42% de aumento en productividad de diseñadores. Estudios han documentado que el costo inicial de creación se recupera típicamente en pocos meses.'
                : 'Companies implementing documented Design Systems report 30-40% faster development, 60% reduction in visual bugs, 50% faster designer/dev onboarding, and simplified maintenance. Initial creation cost is typically recovered in 3-6 months.'}
            </p>
          </div>
        </motion.section>

        {/* Sección 5: Accesibilidad */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '5. Accesibilidad Inclusiva: Diseño Universal' : '5. Inclusive Accessibility: Universal Design'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La accesibilidad en diseño de producto no es una consideración opcional o un requisito de cumplimiento; es un imperativo estratégico y ético. Según datos de la OMS, el 15% de la población mundial vive con alguna forma de discapacidad. Ignorar este segmento no solo es una exclusión social, sino una oportunidad de mercado desaprovechada.'
              : 'Accessibility in product design isn\'t an optional consideration or compliance requirement; it\'s a strategic and ethical imperative. According to WHO data, 15% of the world\'s population lives with some form of disability. Ignoring this segment isn\'t just social exclusion, but a missed market opportunity.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'Empresas líderes como BBC, Microsoft y Apple han demostrado que la accesibilidad no compromete la experiencia; la mejora para todos los usuarios. Los principios de diseño accesible—alto contraste, navegación por teclado, tamaños táctiles adecuados—benefician a usuarios con discapacidades visuales, motoras o cognitivas, pero además mejoran la usabilidad general del producto.'
              : 'Leading companies like BBC, Microsoft, and Apple have demonstrated that accessibility doesn\'t compromise experience; it improves it for all users. Accessible design principles—high contrast, keyboard navigation, adequate touch sizes—benefit users with visual, motor, or cognitive disabilities, but also improve overall product usability.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <img
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&auto=format&fit=crop"
              alt={language === 'es' ? 'Diseño accesible e inclusivo' : 'Accessible and inclusive design'}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Principios de diseño universal: interfaces que funcionan para todos los usuarios, independientemente de sus capacidades'
                : 'Universal design principles: interfaces that work for all users, regardless of their abilities'}
            </p>
          </div>
          <TouchSizeComparison language={language} />
          <div className="mt-6 space-y-4">
            <div className="p-5 bg-blue-500/10 border-l-4 border-blue-500/50 rounded-r-lg">
              <p className="text-base text-blue-300 mb-4">
                <strong className="text-blue-400">
                  {language === 'es' ? 'Estándares WCAG y Implementación:' : 'WCAG Standards and Implementation:'}
                </strong>
              </p>
              <ul className="space-y-3 text-sm text-blue-200 list-none">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 flex-shrink-0 mt-1">•</span>
                  <span><strong>{language === 'es' ? 'Contraste de color (WCAG AA):' : 'Color contrast (WCAG AA):'}</strong> {language === 'es' ? 'Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande (18px+). Para AAA: 7:1 para texto normal. Esto no es negociable en productos que pretenden ser profesionales.' : 'Minimum 4.5:1 ratio for normal text, 3:1 for large text (18px+). For AAA: 7:1 for normal text. This isn\'t negotiable in products that aim to be professional.'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 flex-shrink-0 mt-1">•</span>
                  <span><strong>{language === 'es' ? 'Tamaños táctiles:' : 'Touch targets:'}</strong> {language === 'es' ? 'Mínimo 44x44px (Apple HIG) o 48x48px (Material Design). Estudios de usabilidad móvil muestran que targets pequeños generan tasas de error significativamente mayores, mientras que targets adecuados reducen errores considerablemente.' : 'Minimum 44x44px (Apple HIG) or 48x48px (Material Design). Mobile usability studies show that small targets generate significantly higher error rates, while adequate targets reduce errors considerably.'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 flex-shrink-0 mt-1">•</span>
                  <span><strong>{language === 'es' ? 'Navegación por teclado:' : 'Keyboard navigation:'}</strong> {language === 'es' ? 'Todo elemento interactivo tiene que ser accesible mediante Tab, Enter/Space para activación, Escape para cerrar modales. Los estados de focus tienen que ser visibles (nunca outline: none sin reemplazo).' : 'Every interactive element must be accessible via Tab, Enter/Space for activation, Escape to close modals. Focus states must be visible (never outline: none without replacement).'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 flex-shrink-0 mt-1">•</span>
                  <span><strong>{language === 'es' ? 'Semántica HTML y ARIA:' : 'HTML semantics and ARIA:'}</strong> {language === 'es' ? 'Usar elementos semánticos (&lt;nav&gt;, &lt;article&gt;, &lt;button&gt;), textos alternativos descriptivos, ARIA labels cuando sea necesario. Los screen readers dependen de esta estructura.' : 'Use semantic elements (&lt;nav&gt;, &lt;article&gt;, &lt;button&gt;), descriptive alt texts, ARIA labels when necessary. Screen readers depend on this structure.'}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-5 bg-emerald-500/10 border-l-4 border-emerald-500/50 rounded-r-lg">
              <p className="text-sm text-emerald-300 mb-2">
                <strong className="text-emerald-400">
                  {language === 'es' ? 'Stack de herramientas de validación:' : 'Validation tools stack:'}
                </strong>
              </p>
              <p className="text-sm text-emerald-200 leading-relaxed">
                {language === 'es' 
                  ? 'WebAIM Contrast Checker (validación de ratios), WAVE (análisis completo de accesibilidad), Lighthouse (auditoría automatizada en Chrome DevTools), axe DevTools (análisis en tiempo real), y pruebas con screen readers reales (NVDA, JAWS, VoiceOver). La automatización es útil, pero las pruebas con usuarios reales son esenciales.'
                  : 'WebAIM Contrast Checker (ratio validation), WAVE (complete accessibility analysis), Lighthouse (automated audit in Chrome DevTools), axe DevTools (real-time analysis), and testing with real screen readers (NVDA, JAWS, VoiceOver). Automation is useful, but testing with real users is essential.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Sección 6: Feedback */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {language === 'es' ? '6. Sistemas de Feedback: Comunicación Bidireccional' : '6. Feedback Systems: Bidirectional Communication'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'El feedback en interfaces no es un detalle cosmético; es un sistema de comunicación bidireccional que informa al usuario sobre el estado del sistema y el resultado de sus acciones. La ausencia de feedback genera incertidumbre, ansiedad y frustración, factores que directamente impactan la tasa de abandono y la satisfacción del usuario.'
              : 'Feedback in interfaces isn\'t a cosmetic detail; it\'s a bidirectional communication system that informs users about system state and action results. Absence of feedback generates uncertainty, anxiety, and frustration, factors that directly impact abandonment rate and user satisfaction.'}
          </p>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'La investigación en interacción humano-computadora establece que los usuarios requieren confirmación inmediata (menos de 100ms) para percibir que el sistema es responsivo. Cada elemento interactivo tiene que comunicar cinco estados fundamentales: default (reposo), hover (indica interactividad), active/pressed (confirmación táctil), focus (navegación por teclado), y disabled (no disponible). La implementación sistemática de estos estados reduce la ambigüedad y aumenta la confianza del usuario.'
              : 'Research in human-computer interaction establishes that users require immediate confirmation (less than 100ms) to perceive the system as responsive. Every interactive element must communicate five fundamental states: default (rest), hover (indicates interactivity), active/pressed (tactile confirmation), focus (keyboard navigation), and disabled (unavailable). Systematic implementation of these states reduces ambiguity and increases user confidence.'}
          </p>
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <img
              src="https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop"
              alt={language === 'es' ? 'Estados de feedback en interfaces' : 'Feedback states in interfaces'}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-zinc-400 italic">
              {language === 'es' 
                ? 'Estados de interacción: cada elemento tiene que comunicar claramente su estado actual y capacidad de interacción'
                : 'Interaction states: each element must clearly communicate its current state and interaction capacity'}
            </p>
          </div>
          <p className="text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
            {language === 'es'
              ? 'Empresas como Slack, Dropbox y GitHub han documentado cómo implementan sistemas de feedback diferenciados según el tipo de acción:'
              : 'Companies like Slack, Dropbox, and GitHub have documented how they implement differentiated feedback systems according to action type:'}
          </p>
          <ul className="space-y-4 text-base text-zinc-300 mb-6 list-none">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Feedback inmediato (0-100ms):' : 'Immediate feedback (0-100ms):'}</strong> {language === 'es'
                  ? 'Estados hover, active, focus. Confirmación visual instantánea de que el elemento es interactivo y ha recibido la acción del usuario.'
                  : 'Hover, active, focus states. Instant visual confirmation that the element is interactive and has received user action.'}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Feedback de procesamiento (100ms-5s):' : 'Processing feedback (100ms-5s):'}</strong> {language === 'es'
                  ? 'Spinners, progress indicators, estados de carga. Informan que el sistema está procesando la acción. Para procesos más largos, implementar progress bars con porcentaje o skeleton screens.'
                  : 'Spinners, progress indicators, loading states. Inform that the system is processing the action. For longer processes, implement progress bars with percentage or skeleton screens.'}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0 mt-1">•</span>
              <div className="leading-relaxed">
                <strong className="text-white">{language === 'es' ? 'Feedback de resultado:' : 'Result feedback:'}</strong> {language === 'es'
                  ? 'Confirmaciones de éxito (checkmarks, mensajes), errores (iconos de error, mensajes descriptivos), advertencias. Tienen que ser específicos, accionables y empáticos. Un mensaje de error tiene que explicar qué salió mal, por qué, y cómo solucionarlo.'
                  : 'Success confirmations (checkmarks, messages), errors (error icons, descriptive messages), warnings. Must be specific, actionable, and empathetic. An error message must explain what went wrong, why, and how to fix it.'}
              </div>
            </li>
          </ul>
          <div className="bg-amber-500/10 border-l-4 border-amber-500/50 pl-4 sm:pl-6 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg">
            <p className="text-xs sm:text-sm text-amber-300 mb-1.5 sm:mb-2">
              <strong className="text-amber-400">{language === 'es' ? 'Impacto medible:' : 'Measurable impact:'}</strong>
            </p>
            <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
              {language === 'es'
                ? 'Productos con sistemas de feedback bien implementados muestran reducción en intentos de acción repetidos, aumento en confianza del usuario, y disminución en tickets de soporte relacionados con incertidumbre sobre acciones. Estudios de empresas como GitHub y Linear han documentado cómo el feedback adecuado mejora significativamente la experiencia. El feedback no es opcional; es un componente crítico de la experiencia.'
                : 'Products with well-implemented feedback systems show reduction in repeated action attempts, increase in user confidence, and decrease in support tickets related to uncertainty about actions. Studies from companies like GitHub and Linear have documented how proper feedback significantly improves experience. Feedback isn\'t optional; it\'s a critical component of experience.'}
            </p>
          </div>
        </motion.section>

            {/* CTA Final */}
            <motion.section variants={itemVariants} className="mt-20 pt-12 border-t border-zinc-900">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  {language === 'es' ? 'De Principios a Implementación Estratégica' : 'From Principles to Strategic Implementation'}
                </h3>
                <p className="text-base sm:text-lg text-zinc-300 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed">
                  {language === 'es' 
                    ? 'Los principios que compartí acá no son teoría académica; son frameworks probados aplicados por empresas que atienden a millones de usuarios. La diferencia entre un diseño que "se ve bien" y uno que genera impacto real está en la aplicación sistemática y estratégica de estos principios, respaldada por datos y validación continua.'
                    : 'The principles I\'ve shared here aren\'t academic theory; they\'re proven frameworks I\'ve implemented in products serving millions of users. The difference between a design that "looks good" and one that generates real impact lies in the systematic and strategic application of these principles, backed by data and continuous validation.'}
                </p>
                <p className="text-base text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {language === 'es' 
                    ? 'Como Product Design & Strategy Lead, mi enfoque siempre ha sido combinar principios de diseño fundamentales con análisis de datos, investigación de usuarios y metodologías ágiles de iteración. El diseño UI estratégico no es un arte subjetivo; es una disciplina que puede medirse, optimizarse y escalar.'
                    : 'As a Product Design & Strategy Lead, my approach has always been combining fundamental design principles with data analysis, user research, and agile iteration methodologies. Strategic UI design isn\'t subjective art; it\'s a discipline that can be measured, optimized, and scaled.'}
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
