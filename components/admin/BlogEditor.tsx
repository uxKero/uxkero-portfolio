import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/utils/api';

interface BlogEditorProps {
  blog?: any;
  onSave: () => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onSave, onCancel }) => {
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
  const [readTimeEs, setReadTimeEs] = useState('');
  const [readTimeEn, setReadTimeEn] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (blog) {
      setSlug(blog.slug || '');
      setTitleEs(blog.title_es || '');
      setTitleEn(blog.title_en || '');
      setSubtitleEs(blog.subtitle_es || '');
      setSubtitleEn(blog.subtitle_en || '');
      setContentEs(blog.content_es || '');
      setContentEn(blog.content_en || '');
      setCategoryEs(blog.category_es || '');
      setCategoryEn(blog.category_en || '');
      setAuthor(blog.author || 'Alan Ponce');
      setCoverImageUrl(blog.cover_image_url || '');
      setReadTimeEs(blog.read_time_es || '');
      setReadTimeEn(blog.read_time_en || '');
      setPublishedAt(blog.published_at ? new Date(blog.published_at).toISOString().slice(0, 16) : '');
    }
  }, [blog]);

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
        published_at: publishedAt || null,
      };

      if (blog?.id) {
        await api.updateBlog(blog.id, blogData);
      } else {
        await api.createBlog(blogData);
      }

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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mi-blog-post"
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Autor</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Título (Español)</Label>
              <Input
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Título (English)</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Subtítulo (Español)</Label>
              <Textarea
                value={subtitleEs}
                onChange={(e) => setSubtitleEs(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Subtítulo (English)</Label>
              <Textarea
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Categoría (Español)</Label>
              <Input
                value={categoryEs}
                onChange={(e) => setCategoryEs(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Categoría (English)</Label>
              <Input
                value={categoryEn}
                onChange={(e) => setCategoryEn(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Tiempo de Lectura (Español)</Label>
              <Input
                value={readTimeEs}
                onChange={(e) => setReadTimeEs(e.target.value)}
                placeholder="15 min lectura"
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Tiempo de Lectura (English)</Label>
              <Input
                value={readTimeEn}
                onChange={(e) => setReadTimeEn(e.target.value)}
                placeholder="15 min read"
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">URL de Imagen de Portada</Label>
            <Input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Fecha de Publicación</Label>
            <Input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Contenido (Español)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <ReactQuill
              theme="snow"
              value={contentEs}
              onChange={setContentEs}
              modules={quillModules}
              style={{ minHeight: '400px' }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Contenido (English)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <ReactQuill
              theme="snow"
              value={contentEn}
              onChange={setContentEn}
              modules={quillModules}
              style={{ minHeight: '400px' }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Blog'}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;

