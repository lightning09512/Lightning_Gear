export const getImageUrl = (url?: string): string => {
  if (!url) return 'https://placehold.co/600x600?text=No+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const apiURL = import.meta.env.VITE_API_URL || '';
  const backendURL = apiURL.replace(/\/api$/, '') || 'http://localhost:5000';
  return `${backendURL}${url.startsWith('/') ? '' : '/'}${url}`;
};
