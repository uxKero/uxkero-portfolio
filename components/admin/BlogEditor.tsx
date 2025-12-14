import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/utils/api';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface BlogEditorProps {
  blog?: any;
  onSave: () => void;
  onCancel: () => void;
}

// Función para calcular tiempo de lectura
const calculateReadTime = (htmlContent: string, language: 'es' | 'en'): string => {
  if (!htmlContent) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  
  return language === 'es' 
    ? `${minutes} min lectura`
    : `${minutes} min read`;
};

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('es');
  const [showPreview, setShowPreview] = useState(false);
  const [slug, setSlug] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleEs, setSubtitleEs] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [categoryEs, setCategoryEs] = useState('');
  const [categoryEn, setCategoryEn] = useState('');
  const [author, setAuthor] = useState('Alan Ponce');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Calcular tiempo de lectura automáticamente
  const readTimeEs = calculateReadTime(contentEs, 'es');
  const readTimeEn = calculateReadTime(contentEn, 'en');

  useEffect(() => {
    if (blog) {
      const data = {
        slug: blog.slug || '',
        titleEs: blog.title_es || '',
        titleEn: blog.title_en || '',
        subtitleEs: blog.subtitle_es || '',
        subtitleEn: blog.subtitle_en || '',
        contentEs: blog.content_es || '',
        contentEn: blog.content_en || '',
        categoryEs: blog.category_es || '',
        categoryEn: blog.category_en || '',
        author: blog.author || 'Alan Ponce',
        coverImageUrl: blog.cover_image_url || '',
        publishedAt: blog.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : '',
      };
      
      setInitialData(data);
      setSlug(data.slug);
      setTitleEs(data.titleEs);
      setTitleEn(data.titleEn);
      setSubtitleEs(data.subtitleEs);
      setSubtitleEn(data.subtitleEn);
      setContentEs(data.contentEs);
      setContentEn(data.contentEn);
      setCategoryEs(data.categoryEs);
      setCategoryEn(data.categoryEn);
      setAuthor(data.author);
      setCoverImageUrl(data.coverImageUrl);
      setPublishedAt(data.publishedAt);
    } else {
      setInitialData(null);
    }
  }, [blog]);

  // Detectar cambios
  useEffect(() => {
    if (!initialData) {
      setHasChanges(!!(slug || titleEs || titleEn || contentEs || contentEn));
      return;
    }

    const changed = 
      slug !== initialData.slug ||
      titleEs !== initialData.titleEs ||
      titleEn !== initialData.titleEn ||
      subtitleEs !== initialData.subtitleEs ||
      subtitleEn !== initialData.subtitleEn ||
      contentEs !== initialData.contentEs ||
      contentEn !== initialData.contentEn ||
      categoryEs !== initialData.categoryEs ||
      categoryEn !== initialData.categoryEn ||
      author !== initialData.author ||
      coverImageUrl !== initialData.coverImageUrl ||
      publishedAt !== initialData.publishedAt;

    setHasChanges(changed);
  }, [slug, titleEs, titleEn, subtitleEs, subtitleEn, contentEs, contentEn, categoryEs, categoryEn, author, coverImageUrl, publishedAt, initialData]);

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.')) {
        return;
      }
    }
    onCancel();
  };

  const handleSave = async () => {
    if (!slug || !titleEs || !titleEn || !contentEs || !contentEn) {
      setError('Slug, títulos y contenidos son requeridos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const blogData = {
        slug,
        title_es: titleEs,
        title_en: titleEn,
        subtitle_es: subtitleEs,
        subtitle_en: subtitleEn,
        content_es: contentEs,
        content_en: contentEn,
        category_es: categoryEs,
        category_en: categoryEn,
        author,
        cover_image_url: coverImageUrl,
        read_time_es: readTimeEs,
        read_time_en: readTimeEn,
        published_at: publishedAt ? (publishedAt.includes('T') ? publishedAt : `${publishedAt}T00:00:00`) : null,
      };

      if (blog?.id) {
        await api.updateBlog(blog.id, blogData);
      } else {
        await api.createBlog(blogData);
      }

      setHasChanges(false);
      onSave();
    } catch (err: any) {
      setError(err.message || 'Error guardando blog');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  // Refs para los editores Quill
  const quillRefEs = useRef<Quill | null>(null);
  const quillRefEn = useRef<Quill | null>(null);
  const editorRefEs = useRef<HTMLDivElement>(null);
  const editorRefEn = useRef<HTMLDivElement>(null);

  // Inicializar Quill para español
  useEffect(() => {
    if (editorRefEs.current && !quillRefEs.current) {
      quillRefEs.current = new Quill(editorRefEs.current, {
        theme: 'snow',
        modules: quillModules,
        placeholder: 'Escribe el contenido de tu blog aquí...',
      });
      
      if (contentEs) {
        quillRefEs.current.root.innerHTML = contentEs;
      }
      
      quillRefEs.current.on('text-change', () => {
        if (quillRefEs.current) {
          const html = quillRefEs.current.root.innerHTML;
          setContentEs(html);
        }
      });
    }
  }, []);

  // Inicializar Quill para inglés
  useEffect(() => {
    if (editorRefEn.current && !quillRefEn.current) {
      quillRefEn.current = new Quill(editorRefEn.current, {
        theme: 'snow',
        modules: quillModules,
        placeholder: 'Write your blog content here...',
      });
      
      if (contentEn) {
        quillRefEn.current.root.innerHTML = contentEn;
      }
      
      quillRefEn.current.on('text-change', () => {
        if (quillRefEn.current) {
          const html = quillRefEn.current.root.innerHTML;
          setContentEn(html);
        }
      });
    }
  }, []);

  // Actualizar contenido cuando cambia el blog
  useEffect(() => {
    if (blog) {
      if (quillRefEs.current && blog.content_es !== undefined) {
        const currentContent = quillRefEs.current.root.innerHTML;
        if (currentContent !== blog.content_es) {
          quillRefEs.current.root.innerHTML = blog.content_es || '';
        }
      }
      if (quillRefEn.current && blog.content_en !== undefined) {
        const currentContent = quillRefEn.current.root.innerHTML;
        if (currentContent !== blog.content_en) {
          quillRefEn.current.root.innerHTML = blog.content_en || '';
        }
      }
    }
  }, [blog]);

  // Preview del blog
  const renderPreview = () => {
    const currentLanguage = activeTab === 'es' ? 'es' : 'en';
    const title = currentLanguage === 'es' ? titleEs : titleEn;
    const subtitle = currentLanguage === 'es' ? subtitleEs : subtitleEn;
    const content = currentLanguage === 'es' ? contentEs : contentEn;
    const category = currentLanguage === 'es' ? categoryEs : categoryEn;
    const readTime = currentLanguage === 'es' ? readTimeEs : readTimeEn;

    return (
      <div className="bg-black text-white min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setShowPreview(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al Editor
            </Button>
          </div>
          
          {coverImageUrl && (
            <div className="mb-8 -mx-6">
              <img src={coverImageUrl} alt={title} className="w-full h-64 object-cover" />
            </div>
          )}
          
          {category && (
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full mb-4">
              {category}
            </span>
          )}
          
          <h1 className="text-4xl font-bold mb-4">{title || 'Sin título'}</h1>
          {subtitle && <p className="text-xl text-zinc-300 mb-6">{subtitle}</p>}
          
          <div className="flex gap-4 text-sm text-zinc-500 mb-8">
            {publishedAt && (
              <span>{new Date(publishedAt).toLocaleDateString('es-ES')}</span>
            )}
            {readTime && <span>{readTime}</span>}
            <span>Por {author}</span>
          </div>
          
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '<p>Sin contenido</p>' }}
          />
        </div>
      </div>
    );
  };

  if (showPreview) {
    return renderPreview();
  }

  return (
    <div className="relative pb-24">
      {/* Barra superior fija */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50 -mx-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleCancel}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="text-white font-semibold">
              {blog?.id ? 'Editar Blog' : 'Nuevo Blog'}
              {hasChanges && <span className="ml-2 text-emerald-400 text-sm">● Sin guardar</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              <PreviewIcon className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Configuración General */}
      <Card className="bg-zinc-900/50 border-zinc-800/50 shadow-xl mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mi-blog-post"
                className="bg-zinc-800/50 border-zinc-700/50 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">Autor</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700/50 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">Fecha de Publicación</Label>
              <Input
                type="date"
                value={publishedAt ? (publishedAt.includes('T') ? publishedAt.split('T')[0] : publishedAt) : ''}
                onChange={(e) => setPublishedAt(e.target.value || '')}
                className="bg-zinc-800/50 border-zinc-700/50 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-zinc-300">URL de Imagen de Portada</Label>
            <Input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-zinc-800/50 border-zinc-700/50 text-white"
              disabled={loading}
            />
            {coverImageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700/50 max-w-md">
                <img src={coverImageUrl} alt="Preview" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenido con Tabs */}
      <Card className="bg-zinc-900/50 border-zinc-800/50 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Contenido del Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="es" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                🇪🇸 Español
              </TabsTrigger>
              <TabsTrigger value="en" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                🇬🇧 English
              </TabsTrigger>
            </TabsList>

            {/* Tab Español */}
            <TabsContent value="es" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Título</Label>
                  <Input
                    value={titleEs}
                    onChange={(e) => setTitleEs(e.target.value)}
                    placeholder="Título del blog en español"
                    className="bg-zinc-800/50 border-zinc-700/50 text-white text-base"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Subtítulo</Label>
                  <Textarea
                    value={subtitleEs}
                    onChange={(e) => setSubtitleEs(e.target.value)}
                    placeholder="Subtítulo o descripción breve"
                    rows={2}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-300">Categoría</Label>
                    <Input
                      value={categoryEs}
                      onChange={(e) => setCategoryEs(e.target.value)}
                      placeholder="Diseño UI"
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-300">Tiempo de Lectura</Label>
                    <div className="bg-zinc-800/30 border border-zinc-700/30 text-zinc-400 px-3 py-2 rounded-md text-sm">
                      {readTimeEs || 'Calculando...'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Contenido</Label>
                  <div className="bg-white rounded-lg border border-zinc-700/30 shadow-inner overflow-visible min-h-[500px]">
                    <div 
                      ref={editorRefEs} 
                      className="quill-editor-container"
                      style={{ 
                        minHeight: '500px',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Inglés */}
            <TabsContent value="en" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Title</Label>
                  <Input
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Blog title in English"
                    className="bg-zinc-800/50 border-zinc-700/50 text-white text-base"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Subtitle</Label>
                  <Textarea
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="Subtitle or brief description"
                    rows={2}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-300">Category</Label>
                    <Input
                      value={categoryEn}
                      onChange={(e) => setCategoryEn(e.target.value)}
                      placeholder="UI Design"
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-300">Read Time</Label>
                    <div className="bg-zinc-800/30 border border-zinc-700/30 text-zinc-400 px-3 py-2 rounded-md text-sm">
                      {readTimeEn || 'Calculating...'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-300">Content</Label>
                  <div className="bg-white rounded-lg border border-zinc-700/30 shadow-inner overflow-visible min-h-[500px]">
                    <div 
                      ref={editorRefEn} 
                      className="quill-editor-container"
                      style={{ 
                        minHeight: '500px',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Barra de acciones fija en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-zinc-800/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Button
            onClick={handleCancel}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
            disabled={loading}
          >
            <CloseIcon className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-zinc-400">Cambios sin guardar</span>
            )}
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
              disabled={loading}
            >
              <PreviewIcon className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Blog'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
