import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';
import { getUrlSlug } from '../../utils/blog-slugs';
import { useSEO } from '../../utils/useSEO';
import SiteHeader from '../SiteHeader';

type Lang = 'en' | 'es';

interface BlogItem {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  slug: string;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return 'dark';
};

const FEATURED = {
  url: 'https://x.com/uxKero/status/2061923515725468155',
  cover: '/prompt.jpg',
  title: {
    en: 'When a "better" prompt makes things worse',
    es: 'Cuando un prompt "mejor" empeora las cosas',
  },
  kicker: { en: 'Featured on X', es: 'Destacado en X' },
};

const WritingIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [language] = useState<Lang>('en');
  const [theme] = useState<'dark' | 'light'>(getInitialTheme);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Writing · Alan Ponce | UXKERO',
    description: 'Essays and notes on product, design strategy, and agentic AI by Alan Ponce.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/writing` : '',
    type: 'website',
  });

  // Keep the persisted theme applied on this route too.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getBlogs();
        const formatted: BlogItem[] = data
          .filter((b: any) => b.published_at)
          .map((b: any) => {
            const d = new Date(b.published_at);
            const date = d.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            let excerpt = '';
            if (language === 'es' && b.subtitle_es) excerpt = b.subtitle_es;
            else if (language === 'en' && b.subtitle_en) excerpt = b.subtitle_en;
            else {
              const c = language === 'es' ? b.content_es : b.content_en;
              excerpt = (c || '').replace(/<[^>]*>/g, '').substring(0, 140) + '…';
            }
            return {
              title: language === 'es' ? b.title_es : b.title_en,
              date,
              category: language === 'es' ? b.category_es || 'Blog' : b.category_en || 'Blog',
              excerpt,
              readTime: language === 'es' ? b.read_time_es || '5 min lectura' : b.read_time_en || '5 min read',
              slug: b.slug,
            };
          });
        setBlogs(formatted);
      } catch (e) {
        console.error('Error loading blogs:', e);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  return (
    <div className="min-h-dvh bg-white text-black dark:bg-black dark:text-white font-sans">
      <SiteHeader language={language} theme={theme} />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <h1 className="mb-2 text-3xl font-medium tracking-tight">
          {language === 'es' ? 'Escritos' : 'Writing'}
        </h1>
        <p className="mb-10 max-w-md text-[14px] leading-[1.55] tracking-[-0.01em] text-zinc-500">
          {language === 'es'
            ? 'Notas sobre producto, estrategia de diseño e IA agéntica.'
            : 'Notes on product, design strategy, and agentic AI.'}
        </p>

        {/* Featured banner → X post */}
        <a
          href={FEATURED.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mb-14 block overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
        >
          <div className="aspect-[16/7] w-full overflow-hidden">
            <img
              src={FEATURED.cover}
              alt={FEATURED.title[language]}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {FEATURED.kicker[language]}
              </div>
              <h2 className="max-w-xl text-xl font-medium leading-snug tracking-tight text-white md:text-2xl">
                {FEATURED.title[language]}
              </h2>
            </div>
            <ArrowUpRight className="mb-1 h-5 w-5 shrink-0 text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </a>

        {loading ? (
          <p className="text-[14px] text-zinc-500">{language === 'es' ? 'Cargando…' : 'Loading…'}</p>
        ) : blogs.length === 0 ? (
          <p className="text-[14px] text-zinc-500">
            {language === 'es' ? 'No hay escritos disponibles todavía.' : 'No writing available yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-black/10 border-t border-black/10 dark:divide-white/10 dark:border-white/10">
            {blogs.map((b) => (
              <li key={b.slug}>
                <button
                  onClick={() => navigate(`/${getUrlSlug(b.slug)}`)}
                  className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                >
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                      <span>{b.category}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{b.date}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{b.readTime}</span>
                    </div>
                    <h2 className="text-[16px] font-medium tracking-tight text-zinc-500 transition-colors group-hover:text-black dark:group-hover:text-white">
                      {b.title}
                    </h2>
                    <p className="mt-1 max-w-xl text-[14px] leading-[1.55] tracking-[-0.01em] text-zinc-500">
                      {b.excerpt}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black dark:group-hover:text-white" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default WritingIndexPage;
