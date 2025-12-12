// Mapeo de slugs a títulos en inglés para URLs amigables
export const blogSlugMap: Record<string, string> = {
  'principios-ui-impacto-real': 'From-Theory-to-Real-Impact',
  'ui-principles-real-impact': 'From-Theory-to-Real-Impact',
  'sistemas-diseno-escala': 'Design-Systems-at-Scale',
  'design-systems-scale': 'Design-Systems-at-Scale',
  'psicologia-decisiones-usuario': 'Psychology-of-User-Decision-Making',
  'psychology-user-decisions': 'Psychology-of-User-Decision-Making',
};

// Función para obtener slug de URL desde slug interno
export const getUrlSlug = (internalSlug: string): string => {
  return blogSlugMap[internalSlug] || internalSlug;
};

// Función para obtener slug interno desde slug de URL
export const getInternalSlug = (urlSlug: string): string | null => {
  const entry = Object.entries(blogSlugMap).find(([_, url]) => url === urlSlug);
  return entry ? entry[0] : null;
};
