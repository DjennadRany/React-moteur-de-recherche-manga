export const getLocalizedTitle = (anime, lang) => {
  if (!anime) return 'Sans titre';
  if (lang === 'fr') {
    return anime.title_french || anime.title || anime.name || 'Sans titre';
  }
  return anime.title || anime.name || 'Sans titre';
};

export const getLocalizedSynopsis = (anime, lang) => {
  if (!anime) {
    return { text: 'Synopsis indisponible.', isFallback: false };
  }
  const frenchSynopsis = anime.synopsis_french || anime.synopsis_fr;
  if (lang === 'fr') {
    if (frenchSynopsis) {
      return { text: frenchSynopsis, isFallback: false };
    }
    if (anime.synopsis) {
      return { text: anime.synopsis, isFallback: true };
    }
  }
  return { text: anime.synopsis || 'Synopsis indisponible.', isFallback: false };
};
