import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import LanguageIcon from '@mui/icons-material/Language';
import BlogPost from './BlogPost';
import { getUrlSlug } from '../../utils/blog-slugs';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  language: 'en' | 'es';
  onToggleLanguage: () => void;
  onExpand: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  slug,
  language,
  onToggleLanguage,
  onExpand,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full md:w-[90%] md:h-[90%] md:max-w-5xl md:max-h-[90vh] bg-black border-0 md:border border-zinc-800 rounded-none md:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Modal */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                aria-label="Cerrar"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => {
                if (slug) {
                  const urlSlug = getUrlSlug(slug);
                  navigate(`/${urlSlug}`);
                  onClose();
                } else {
                  setIsExpanded(true);
                  onExpand();
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors"
            >
              <OpenInFullIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{language === 'es' ? 'Expandir a vista completa' : 'Expand to full view'}</span>
              <span className="sm:hidden">{language === 'es' ? 'Expandir' : 'Expand'}</span>
            </button>
          </div>

          {/* Contenido del Blog con Scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-black">
            <div className="min-h-full">
              <BlogPost
                onBack={undefined}
                language={language}
                slug={slug}
                onToggleLanguage={onToggleLanguage}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BlogModal;
