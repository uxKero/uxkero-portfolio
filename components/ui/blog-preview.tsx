import React from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface BlogPreviewProps {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  className?: string;
  onClick?: () => void;
  slug?: string;
  isAvailable?: boolean;
}

export const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  date,
  category,
  excerpt,
  readTime,
  className = "",
  onClick,
  slug,
  isAvailable = true,
}) => {
  const handleClick = () => {
    if (isAvailable && onClick) {
      onClick();
    }
  };

  return (
    <article 
      onClick={handleClick}
      className={`group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 transition-all duration-300 overflow-hidden ${
        isAvailable 
          ? 'hover:border-zinc-700/50 cursor-pointer' 
          : 'opacity-60 blur-sm cursor-not-allowed'
      } ${className}`}
    >
      {/* Subtle gradient overlay on hover - solo si está disponible */}
      {isAvailable && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      )}
      
      {/* Overlay de "Próximamente" para blogs no disponibles */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-4 py-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
            Próximamente
          </span>
        </div>
      )}
      
      <div className="relative p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
        {/* Category and Date */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 mb-2">
          <span className="font-medium tracking-wide uppercase truncate pr-2">{category}</span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <CalendarTodayIcon className="w-3 h-3" />
            <span className="whitespace-nowrap">{date}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white leading-snug tracking-tight group-hover:text-zinc-100 transition-colors duration-300 line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed line-clamp-2 font-light">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
          <span className="text-[10px] sm:text-xs text-zinc-500 font-light">{readTime}</span>
          {isAvailable && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
              <span className="text-[10px] sm:text-xs font-medium">Leer</span>
              <ArrowForwardIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

interface BlogPreviewListProps {
  blogs: Array<{
    title: string;
    date: string;
    category: string;
    excerpt: string;
    readTime: string;
    slug?: string;
  }>;
  className?: string;
  onBlogClick?: (slug?: string) => void;
}

export const BlogPreviewList: React.FC<BlogPreviewListProps> = ({
  blogs,
  className = "",
  onBlogClick,
}) => {
  // El primer blog es el que existe (principios-ui-impacto-real o ui-principles-real-impact)
  const isFirstBlogAvailable = (slug?: string) => {
    return slug === 'principios-ui-impacto-real' || slug === 'ui-principles-real-impact';
  };

  return (
    <div className={`w-full space-y-4 sm:space-y-5 md:space-y-6 ${className}`}>
      {blogs.map((blog, index) => {
        const isAvailable = isFirstBlogAvailable(blog.slug);
        return (
          <BlogPreview
            key={index}
            title={blog.title}
            date={blog.date}
            category={blog.category}
            excerpt={blog.excerpt}
            readTime={blog.readTime}
            slug={blog.slug}
            isAvailable={isAvailable}
            onClick={() => {
              if (isAvailable) {
                onBlogClick?.(blog.slug || `blog-${index}`);
              }
            }}
          />
        );
      })}
    </div>
  );
};
