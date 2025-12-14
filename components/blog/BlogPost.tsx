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
import { api } from '@/utils/api';
import { getInternalSlug } from '@/utils/blog-slugs';
import { useSEO } from '@/utils/useSEO';

interface BlogPostProps {
  onBack?: () => void;
  language?: 'en' | 'es';
  slug?: string;
  onToggleLanguage?: () => void;
}

interface BlogData {
  id: number;
  slug: string;
  title_es: string;
  title_en: string;
  subtitle_es?: string;
  subtitle_en?: string;
  content_es: string;
  content_en: string;
  category_es?: string;
  category_en?: string;
  author: string;
  cover_image_url?: string;
  published_at?: string;
  read_time_es?: string;
  read_time_en?: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ onBack, language = 'es', slug, onToggleLanguage }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedContent, setCopiedContent] = React.useState(false);
  const [shareMenuOpen, setShareMenuOpen] = React.useState(false);
  const [blogData, setBlogData] = React.useState<BlogData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBlog = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Convertir slug de URL a slug interno si es necesario
        const internalSlug = getInternalSlug(slug) || slug;
        console.log('[BlogPost] Cargando blog con slug:', internalSlug);
        const data = await api.getBlog(internalSlug);
        console.log('[BlogPost] Blog cargado:', data);
        setBlogData(data);
      } catch (err: any) {
        console.error('[BlogPost] Error cargando blog:', err);
        // Extraer mensaje de error más descriptivo
        let errorMessage = 'Error cargando blog';
        if (err.message) {
          errorMessage = err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  // Cargar script de Vimeo si hay contenido de Vimeo
  React.useEffect(() => {
    if (blogData) {
      const content = language === 'es' ? blogData.content_es : blogData.content_en;
      if (content && content.includes('player.vimeo.com')) {
        // Verificar si el script ya está cargado
        if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://player.vimeo.com/api/player.js';
          script.async = true;
          document.body.appendChild(script);
        }
      }
    }
  }, [blogData, language]);

  // useEffect para manejar clicks fuera del menú de compartir
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

  if (loading) {
    return (
      <div className="w-full bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Cargando blog...</div>
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className="w-full bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Blog no encontrado'}</div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  const title = language === 'es' ? blogData.title_es : blogData.title_en;
  const subtitle = language === 'es' ? blogData.subtitle_es : blogData.subtitle_en;
  const content = language === 'es' ? blogData.content_es : blogData.content_en;
  const category = language === 'es' ? blogData.category_es : blogData.category_en;
  const readTime = language === 'es' ? blogData.read_time_es : blogData.read_time_en;

  // SEO para blogs
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${blogData.slug}`
    : '';
  
  // Extraer texto limpio del contenido para description
  const getPlainText = (html: string, maxLength: number = 160) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text.trim();
  };

  // Aplicar SEO solo cuando blogData está disponible
  useSEO({
    title: `${title} | UXKERO Blog`,
    description: subtitle || getPlainText(content),
    image: blogData.cover_image_url || undefined,
    url: shareUrl,
    type: 'article',
    author: blogData.author || 'Alan Ponce',
    publishedTime: blogData.published_at || undefined,
    modifiedTime: blogData.updated_at || undefined,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return language === 'es'
      ? date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const shareText = `${title} - ${subtitle || ''}`;

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
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShareMenuOpen(false);
  };

  const handleCopyContent = async () => {
    try {
      const articleElement = document.querySelector('article');
      if (articleElement) {
        const textContent = articleElement.innerText || articleElement.textContent || '';
        const fullContent = `${title}\n${subtitle || ''}\n\n${textContent}`;
        
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
              src={blogData.cover_image_url || "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&auto=format&fit=crop"}
              alt={title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
              {category && (
              <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold rounded-full border border-emerald-500/30 mb-3 sm:mb-4">
                  {category}
              </span>
              )}
              <h1 className={`${language === 'es' ? 'text-xl sm:text-2xl md:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl md:text-5xl lg:text-6xl'} font-bold tracking-tight leading-tight mb-2 sm:mb-4`}>
                {title}
              </h1>
              {subtitle && (
              <p className="text-sm sm:text-lg md:text-xl text-zinc-300 leading-relaxed max-w-3xl">
                  {subtitle}
              </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hero Header */}
        <motion.header variants={itemVariants} className="mb-8 sm:mb-12">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8">
            {blogData.published_at && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CalendarTodayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{formatDate(blogData.published_at)}</span>
            </div>
            )}
            {readTime && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AccessTimeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{readTime}</span>
            </div>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>{language === 'es' ? 'Por' : 'By'}</span>
              <span className="text-white font-medium">{blogData.author}</span>
            </div>
          </div>
        </motion.header>

        {/* Contenido del Blog */}
        <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
          <div 
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-ul:text-zinc-300 prose-ol:text-zinc-300
              prose-li:text-zinc-300
              prose-blockquote:border-l-emerald-500/50 prose-blockquote:bg-zinc-900/50 prose-blockquote:text-zinc-300
              prose-code:text-emerald-400 prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-lg prose-img:my-8
              prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-3"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </motion.section>

            {/* CTA Final */}
        {onBack && (
            <motion.section variants={itemVariants} className="mt-20 pt-12 border-t border-zinc-900">
              <div className="text-center">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#635BFF] text-white rounded-lg font-medium hover:bg-[#5548FF] transition-colors"
              >
                {language === 'es' ? 'Volver al portfolio' : 'Back to portfolio'}
              </button>
            </div>
          </motion.section>
        )}
      </motion.article>
    </div>
  );
};

export default BlogPost;
