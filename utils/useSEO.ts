import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author = 'Alan Ponce',
  publishedTime,
  modifiedTime,
}: SEOProps) => {
  useEffect(() => {
    // Actualizar título
    document.title = title;

    // Función helper para actualizar o crear meta tags
    const setMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta tags básicos
    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, 'property');
      setMetaTag('twitter:description', description);
    }

    // Open Graph tags
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:type', type, 'property');
    if (url) {
      setMetaTag('og:url', url, 'property');
    }
    if (image) {
      // Asegurar que la imagen sea una URL absoluta
      const absoluteImageUrl = image.startsWith('http') 
        ? image 
        : `${typeof window !== 'undefined' ? window.location.origin : ''}${image.startsWith('/') ? image : '/' + image}`;
      
      setMetaTag('og:image', absoluteImageUrl, 'property');
      setMetaTag('og:image:secure_url', absoluteImageUrl, 'property');
      setMetaTag('og:image:type', 'image/jpeg', 'property');
      setMetaTag('og:image:width', '1200', 'property');
      setMetaTag('og:image:height', '630', 'property');
      setMetaTag('og:image:alt', title, 'property');
      
      // Twitter Card
      setMetaTag('twitter:image', absoluteImageUrl);
      setMetaTag('twitter:image:alt', title);
    } else {
      // Si no hay imagen, usar una imagen por defecto
      const defaultImage = typeof window !== 'undefined' 
        ? `${window.location.origin}/favicon.svg`
        : '';
      if (defaultImage) {
        setMetaTag('og:image', defaultImage, 'property');
        setMetaTag('og:image:secure_url', defaultImage, 'property');
        setMetaTag('og:image:type', 'image/svg+xml', 'property');
        setMetaTag('og:image:width', '1200', 'property');
        setMetaTag('og:image:height', '630', 'property');
        setMetaTag('twitter:image', defaultImage);
      }
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:site', '@uxkero');

    // Article tags (para blogs)
    if (type === 'article') {
      if (author) {
        setMetaTag('article:author', author, 'property');
      }
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, 'property');
      }
    }

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Limpiar al desmontar (opcional, pero mejor mantener los meta tags)
    return () => {
      // No limpiar los meta tags para mantener SEO
    };
  }, [title, description, image, url, type, author, publishedTime, modifiedTime]);
};
