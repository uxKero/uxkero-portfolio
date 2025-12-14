import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/utils/api';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import WarningIcon from '@mui/icons-material/Warning';
import LinkIcon from '@mui/icons-material/Link';

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
  const [showHtmlEditor, setShowHtmlEditor] = useState({ es: false, en: false });
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
  
  // Estados para diálogos personalizados
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showVimeoDialog, setShowVimeoDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [vimeoHtml, setVimeoHtml] = useState('');
  const [pendingQuillAction, setPendingQuillAction] = useState<{ type: 'image' | 'video' | 'link' | 'vimeo'; quill: Quill | null; index: number; length?: number } | null>(null);

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
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
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

  // Configuración mejorada de Quill con todas las opciones
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: function(this: any) {
          const range = this.quill.getSelection(true);
          const index = range ? range.index : this.quill.getLength();
          setPendingQuillAction({ type: 'image', quill: this.quill, index });
          setShowImageDialog(true);
        },
        video: function(this: any) {
          const range = this.quill.getSelection(true);
          const index = range ? range.index : this.quill.getLength();
          setPendingQuillAction({ type: 'video', quill: this.quill, index });
          setShowVideoDialog(true);
        },
        link: function(this: any) {
          const range = this.quill.getSelection(true);
          if (range) {
            // Si hay texto seleccionado, obtener el texto y la posición
            const text = this.quill.getText(range.index, range.length);
            const index = range.index;
            const length = range.length;
            setLinkText(text || '');
            setPendingQuillAction({ type: 'link', quill: this.quill, index, length });
          } else {
            // Si no hay selección, usar la posición actual
            const index = this.quill.getLength();
            setLinkText('');
            setPendingQuillAction({ type: 'link', quill: this.quill, index, length: 0 });
          }
          setShowLinkDialog(true);
        }
      }
    }
  };

  // Refs para los editores Quill
  const quillRefEs = useRef<Quill | null>(null);
  const quillRefEn = useRef<Quill | null>(null);
  const editorRefEs = useRef<HTMLDivElement>(null);
  const editorRefEn = useRef<HTMLDivElement>(null);

  // Inicializar Quill para español
  useEffect(() => {
    if (editorRefEs.current && !quillRefEs.current && !showHtmlEditor.es) {
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
  }, [showHtmlEditor.es]);

  // Reinicializar Quill para español cuando se vuelve de HTML a visual
  useEffect(() => {
    if (!showHtmlEditor.es && editorRefEs.current && !quillRefEs.current) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timeoutId = setTimeout(() => {
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
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showHtmlEditor.es, contentEs]);

  // Inicializar Quill para inglés
  useEffect(() => {
    if (editorRefEn.current && !quillRefEn.current && !showHtmlEditor.en) {
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
  }, [showHtmlEditor.en]);

  // Reinicializar Quill para inglés cuando se vuelve de HTML a visual
  useEffect(() => {
    if (!showHtmlEditor.en && editorRefEn.current && !quillRefEn.current) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timeoutId = setTimeout(() => {
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
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showHtmlEditor.en, contentEn]);

  // Sincronizar contenido cuando se vuelve de HTML a visual (ES)
  useEffect(() => {
    if (!showHtmlEditor.es && quillRefEs.current && contentEs) {
      // Esperar a que el DOM esté completamente renderizado
      const timeoutId = setTimeout(() => {
        if (quillRefEs.current && contentEs) {
          const currentContent = quillRefEs.current.root.innerHTML.trim();
          const newContent = contentEs.trim();
          // Solo actualizar si el contenido es diferente y no está vacío
          if (newContent && newContent !== '<p><br></p>' && newContent !== '<p></p>' && currentContent !== newContent) {
            quillRefEs.current.root.innerHTML = newContent;
          }
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showHtmlEditor.es, contentEs]);

  // Sincronizar contenido cuando se vuelve de HTML a visual (EN)
  useEffect(() => {
    if (!showHtmlEditor.en && quillRefEn.current && contentEn) {
      // Esperar a que el DOM esté completamente renderizado
      const timeoutId = setTimeout(() => {
        if (quillRefEn.current && contentEn) {
          const currentContent = quillRefEn.current.root.innerHTML.trim();
          const newContent = contentEn.trim();
          // Solo actualizar si el contenido es diferente y no está vacío
          if (newContent && newContent !== '<p><br></p>' && newContent !== '<p></p>' && currentContent !== newContent) {
            quillRefEn.current.root.innerHTML = newContent;
          }
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showHtmlEditor.en, contentEn]);

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

  // Funciones para manejar diálogos de imagen/video
  const handleInsertImage = () => {
    if (pendingQuillAction && imageUrl.trim()) {
      pendingQuillAction.quill.insertEmbed(pendingQuillAction.index, 'image', imageUrl.trim(), 'user');
      setImageUrl('');
      setShowImageDialog(false);
      setPendingQuillAction(null);
    }
  };

  const handleInsertVideo = () => {
    if (pendingQuillAction && videoUrl.trim()) {
      pendingQuillAction.quill.insertEmbed(pendingQuillAction.index, 'video', videoUrl.trim(), 'user');
      setVideoUrl('');
      setShowVideoDialog(false);
      setPendingQuillAction(null);
    }
  };

  const handleInsertVimeo = () => {
    if (pendingQuillAction && vimeoHtml.trim()) {
      const range = pendingQuillAction.quill.getSelection(true);
      const index = range ? range.index : pendingQuillAction.index;
      
      // Insertar el HTML de Vimeo directamente
      const delta = pendingQuillAction.quill.clipboard.convert({ html: vimeoHtml.trim() });
      pendingQuillAction.quill.updateContents(delta, 'user');
      
      // Mover el cursor después del contenido insertado
      const length = delta.length();
      pendingQuillAction.quill.setSelection(index + length);
      
      setVimeoHtml('');
      setShowVimeoDialog(false);
      setPendingQuillAction(null);
    }
  };

  const handleInsertLink = () => {
    if (pendingQuillAction && linkUrl.trim()) {
      const quill = pendingQuillAction.quill;
      const index = pendingQuillAction.index;
      const length = pendingQuillAction.length || 0;
      
      if (length > 0) {
        // Si hay texto seleccionado, convertir ese texto en enlace
        quill.formatText(index, length, 'link', linkUrl.trim());
      } else if (linkText.trim()) {
        // Si hay texto ingresado pero no seleccionado, insertar el texto como enlace
        quill.insertText(index, linkText.trim(), 'link', linkUrl.trim(), 'user');
        quill.setSelection(index + linkText.trim().length);
      } else {
        // Si no hay texto, insertar la URL como texto enlazado
        quill.insertText(index, linkUrl.trim(), 'link', linkUrl.trim(), 'user');
        quill.setSelection(index + linkUrl.trim().length);
      }
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
      setPendingQuillAction(null);
    }
  };

  // Función para alternar editor HTML
  const toggleHtmlEditor = (lang: 'es' | 'en') => {
    const isCurrentlyHtml = lang === 'es' ? showHtmlEditor.es : showHtmlEditor.en;
    
    if (lang === 'es') {
      if (!isCurrentlyHtml) {
        // Cambiar a HTML - guardar contenido de Quill primero
        if (quillRefEs.current) {
          const htmlContent = quillRefEs.current.root.innerHTML;
          // Guardar el contenido antes de cambiar el estado
          setContentEs(htmlContent);
          // Destruir la instancia de Quill para liberar recursos
          quillRefEs.current = null;
        }
        setShowHtmlEditor(prev => ({ ...prev, es: true }));
      } else {
        // Volver a Quill - el useEffect se encargará de reinicializar
        setShowHtmlEditor(prev => ({ ...prev, es: false }));
      }
    } else {
      if (!isCurrentlyHtml) {
        // Cambiar a HTML - guardar contenido de Quill primero
        if (quillRefEn.current) {
          const htmlContent = quillRefEn.current.root.innerHTML;
          // Guardar el contenido antes de cambiar el estado
          setContentEn(htmlContent);
          // Destruir la instancia de Quill para liberar recursos
          quillRefEn.current = null;
        }
        setShowHtmlEditor(prev => ({ ...prev, en: true }));
      } else {
        // Volver a Quill - el useEffect se encargará de reinicializar
        setShowHtmlEditor(prev => ({ ...prev, en: false }));
      }
    }
  };

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
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-zinc-300">Contenido</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const quill = activeTab === 'es' ? quillRefEs.current : quillRefEn.current;
                          if (quill) {
                            const range = quill.getSelection(true);
                            const index = range ? range.index : quill.getLength();
                            setPendingQuillAction({ type: 'vimeo', quill, index });
                            setShowVimeoDialog(true);
                          }
                        }}
                        className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white text-xs"
                      >
                        <VideoLibraryIcon className="w-3 h-3 mr-1" />
                        Insertar Vimeo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHtmlEditor('es')}
                        className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white text-xs"
                      >
                        <CodeIcon className="w-3 h-3 mr-1" />
                        {showHtmlEditor.es ? 'Editor Visual' : 'Editar HTML'}
                      </Button>
                    </div>
                  </div>
                  {showHtmlEditor.es ? (
                    <Textarea
                      value={contentEs}
                      onChange={(e) => setContentEs(e.target.value)}
                      placeholder="Edita el HTML directamente..."
                      rows={20}
                      className="bg-zinc-900 border-zinc-700 text-white font-mono text-sm resize-none"
                    />
                  ) : (
                    <div 
                      className="bg-white rounded-lg border border-zinc-700/30 shadow-inner min-h-[600px]"
                      style={{ 
                        pointerEvents: 'auto', 
                        zIndex: 1, 
                        position: 'relative',
                        overflow: 'visible',
                        display: 'block'
                      }}
                    >
                      <div 
                        ref={editorRefEs} 
                        className="quill-editor-container"
                        style={{ 
                          minHeight: '600px',
                          position: 'relative',
                          zIndex: 1,
                          overflow: 'visible',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
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
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-zinc-300">Content</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const quill = activeTab === 'es' ? quillRefEs.current : quillRefEn.current;
                          if (quill) {
                            const range = quill.getSelection(true);
                            const index = range ? range.index : quill.getLength();
                            setPendingQuillAction({ type: 'vimeo', quill, index });
                            setShowVimeoDialog(true);
                          }
                        }}
                        className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white text-xs"
                      >
                        <VideoLibraryIcon className="w-3 h-3 mr-1" />
                        Insert Vimeo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHtmlEditor('en')}
                        className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white text-xs"
                      >
                        <CodeIcon className="w-3 h-3 mr-1" />
                        {showHtmlEditor.en ? 'Visual Editor' : 'Edit HTML'}
                      </Button>
                    </div>
                  </div>
                  {showHtmlEditor.en ? (
                    <Textarea
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      placeholder="Edit HTML directly..."
                      rows={20}
                      className="bg-zinc-900 border-zinc-700 text-white font-mono text-sm resize-none"
                    />
                  ) : (
                    <div 
                      className="bg-white rounded-lg border border-zinc-700/30 shadow-inner min-h-[600px]"
                      style={{ 
                        pointerEvents: 'auto', 
                        zIndex: 1, 
                        position: 'relative',
                        overflow: 'visible',
                        display: 'block'
                      }}
                    >
                      <div 
                        ref={editorRefEn} 
                        className="quill-editor-container"
                        style={{ 
                          minHeight: '600px',
                          position: 'relative',
                          zIndex: 1,
                          overflow: 'visible',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
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

      {/* Diálogo de confirmación para cancelar */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <WarningIcon className="w-5 h-5 text-amber-500" />
              ¿Descartar cambios?
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              Tienes cambios sin guardar. Si cancelas, se perderán todos los cambios no guardados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              Continuar editando
            </Button>
            <Button
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Descartar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para insertar imagen */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              Insertar Imagen
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              Ingresa la URL de la imagen que deseas insertar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsertImage();
                }
              }}
              autoFocus
            />
            {imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-zinc-700/50">
                <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl('');
                setPendingQuillAction(null);
              }}
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInsertImage}
              disabled={!imageUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Insertar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para insertar video */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <VideoLibraryIcon className="w-5 h-5 text-emerald-500" />
              Insertar Video
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              Ingresa la URL del video (YouTube, Vimeo, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsertVideo();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVideoDialog(false);
                setVideoUrl('');
                setPendingQuillAction(null);
              }}
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInsertVideo}
              disabled={!videoUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Insertar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para insertar HTML de Vimeo */}
      <Dialog open={showVimeoDialog} onOpenChange={setShowVimeoDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <VideoLibraryIcon className="w-5 h-5 text-emerald-500" />
              Insertar HTML de Vimeo
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              Pega el código HTML completo de Vimeo (incluyendo el div, iframe y script)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={vimeoHtml}
              onChange={(e) => setVimeoHtml(e.target.value)}
              placeholder='<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/..." frameborder="0" ...></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>'
              rows={8}
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 font-mono text-sm"
              autoFocus
            />
            <p className="text-xs text-zinc-500 mt-2">
              Pega el código HTML completo que Vimeo proporciona, incluyendo el div, iframe y el script.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVimeoDialog(false);
                setVimeoHtml('');
                setPendingQuillAction(null);
              }}
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInsertVimeo}
              disabled={!vimeoHtml.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Insertar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para insertar enlace */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <LinkIcon className="w-5 h-5 text-emerald-500" />
              Insertar Enlace
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              Ingresa la URL del enlace y opcionalmente el texto a mostrar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">URL del enlace</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkUrl.trim()) {
                    handleInsertLink();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">Texto del enlace (opcional)</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Texto a mostrar"
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkUrl.trim()) {
                    handleInsertLink();
                  }
                }}
              />
              {pendingQuillAction && pendingQuillAction.length && pendingQuillAction.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  Texto seleccionado: "{linkText}"
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkDialog(false);
                setLinkUrl('');
                setLinkText('');
                setPendingQuillAction(null);
              }}
              className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInsertLink}
              disabled={!linkUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Insertar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogEditor;
