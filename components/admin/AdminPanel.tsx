import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/utils/api';
import { useSEO } from '@/utils/useSEO';
import BlogEditor from './BlogEditor';

const AdminPanel: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  // SEO para panel de admin
  useSEO({
    title: 'Admin Panel | UXKERO',
    description: 'Administración de blogs y contenido',
  });

  useEffect(() => {
    checkAuth();
    loadBlogs();
  }, []);

  const checkAuth = async () => {
    try {
      await api.verify();
    } catch (err: any) {
      if (err.message?.includes('servidor no está corriendo')) {
        // Si el servidor no está corriendo, mostrar mensaje pero no redirigir
        return;
      }
      navigate('/admin/login');
    }
  };

  const loadBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (err: any) {
      console.error('Error cargando blogs:', err);
      if (err.message?.includes('servidor no está corriendo')) {
        // El error ya tiene un mensaje claro
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este blog?')) return;

    try {
      await api.deleteBlog(id);
      loadBlogs();
    } catch (err: any) {
      alert('Error eliminando blog: ' + err.message);
    }
  };

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingBlog(null);
    setShowEditor(true);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingBlog(null);
    loadBlogs();
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingBlog(null);
  };

  const handleLogout = () => {
    api.logout();
    navigate('/admin/login');
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <BlogEditor blog={editingBlog} onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleNew}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Nuevo Blog
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">Cargando blogs...</div>
          </div>
        ) : blogs.length === 0 && !loading ? (
          <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-zinc-400 text-lg mb-2">No hay blogs aún</div>
              <div className="text-zinc-500 text-sm">Crea tu primer blog para comenzar</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Card key={blog.id} className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-zinc-700/50">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-xl mb-2">{blog.title_es || blog.title_en || 'Sin título'}</CardTitle>
                      <CardDescription className="text-zinc-400 text-sm flex flex-wrap gap-2 items-center">
                        <span className="px-2 py-1 bg-zinc-800/50 rounded text-xs font-mono">{blog.slug}</span>
                        {blog.category_es && (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">
                            {blog.category_es}
                          </span>
                        )}
                        {blog.published_at ? (
                          <span className="text-zinc-500">
                            {new Date(blog.published_at).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        ) : (
                          <span className="text-zinc-600 italic">No publicado</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(blog)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="bg-red-600/80 hover:bg-red-700 text-white"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

