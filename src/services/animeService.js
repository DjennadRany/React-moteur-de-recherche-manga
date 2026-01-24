import jikanClient from './jikanClient';

export const fetchGenres = async () => {
  const response = await jikanClient.get('/genres/anime');
  return response.data?.data || [];
};

export const searchAnime = async ({ query, page = 1, limit = 12, genre, signal }) => {
  const params = new URLSearchParams();
  params.set('q', query);
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (genre) {
    params.set('genres', genre);
  }
  const response = await jikanClient.get(`/anime?${params.toString()}`, { signal });
  return {
    items: response.data?.data || [],
    pagination: response.data?.pagination || {},
  };
};

export const fetchTopAiring = async ({ signal } = {}) => {
  const response = await jikanClient.get('/top/anime?filter=airing&limit=12', { signal });
  return response.data?.data || [];
};

export const fetchSeasonNow = async ({ signal } = {}) => {
  const response = await jikanClient.get('/seasons/now?limit=12', { signal });
  return response.data?.data || [];
};

export const fetchAnimeById = async (id, { signal } = {}) => {
  const response = await jikanClient.get(`/anime/${id}`, { signal });
  return response.data?.data || null;
};

export const fetchRelations = async (id, { signal } = {}) => {
  const response = await jikanClient.get(`/anime/${id}/relations`, { signal });
  return response.data?.data || [];
};

export const fetchRecommendations = async (id, { signal } = {}) => {
  const response = await jikanClient.get(`/anime/${id}/recommendations`, { signal });
  return response.data?.data || [];
};
