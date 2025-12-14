// En desarrollo local, usar servidor Express en puerto 3001
// En producción, usar las rutas de Vercel automáticamente
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

// Helper para acceder a localStorage de forma segura
const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      return window.localStorage.getItem(key);
    }
  } catch (error: any) {
    // Silenciar todos los errores de localStorage (incluyendo SecurityError)
    // Esto puede ocurrir en iframes o contextos restringidos
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.setItem(key, value);
    }
  } catch (error: any) {
    // Silenciar todos los errores de localStorage
  }
};

const removeStorageItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.removeItem(key);
    }
  } catch (error: any) {
    // Silenciar todos los errores de localStorage
  }
};

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getStorageItem('admin_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Si es 404, el servidor Express no está corriendo
        if (response.status === 404) {
          throw new Error('⚠️ El servidor API no está corriendo (404).\n\nSOLUCIÓN:\n\n1. Detén el servidor actual (Ctrl+C)\n2. Ejecuta: npm run dev\n3. Esto iniciará automáticamente el frontend Y el servidor API\n4. Espera a ver: "🚀 Servidor API corriendo en http://localhost:3001"\n5. Recarga esta página');
        }
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `Error ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Detectar errores de conexión
      if (
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError'
      ) {
        throw new Error('⚠️ El servidor API no está corriendo.\n\nSOLUCIÓN RÁPIDA:\n\n1. Detén el servidor actual (Ctrl+C)\n2. Ejecuta: npm run dev\n3. Esto iniciará automáticamente el frontend Y el servidor API\n4. Espera a ver: "🚀 Servidor API corriendo en http://localhost:3001"\n5. Recarga esta página\n\nSi solo quieres el API: npm run dev:api');
      }
      throw error;
    }
  },

  // Auth
  async login(username: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setStorageItem('admin_token', data.token);
    }
    return data;
  },

  async verify() {
    return this.request('/auth/verify');
  },

  logout() {
    removeStorageItem('admin_token');
  },

  // Blogs
  async getBlogs() {
    return this.request('/blogs');
  },

  async getBlog(slug: string) {
    return this.request(`/blogs/${slug}`);
  },

  async createBlog(blogData: any) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  async updateBlog(id: number, blogData: any) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  async deleteBlog(id: number) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};

