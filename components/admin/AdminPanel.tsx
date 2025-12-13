import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/utils/api';
import BlogEditor from './BlogEditor';

const AdminPanel: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

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
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              {editingBlog ? 'Editar Blog' : 'Nuevo Blog'}
            </h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cerrar Sesión
            </Button>
          </div>
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
              variant="outline"
              onClick={handleLogout}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-zinc-400">Cargando blogs...</div>
        ) : blogs.length === 0 && !loading ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center text-zinc-400">
              No hay blogs aún. Crea tu primer blog.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Card key={blog.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{blog.title_es}</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Slug: {blog.slug} | {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'No publicado'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="bg-red-600 hover:bg-red-700"
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

