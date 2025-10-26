import { API_BASE, AUTH_BASE } from './config';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getHome() {
  const data = await request('/home');
  return data;
}

export async function getCatalog() {
  return request('/catalog');
}

export async function getSeries(slug) {
  const data = await request(`/series/${slug}`);
  return data.series;
}

export async function getMovies() {
  const data = await request('/movies');
  return data.movies;
}

export async function login(username, password) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }
  const { user } = await res.json();
  return user;
}

export async function logout() {
  await fetch(`${AUTH_BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

export async function getMe() {
  const res = await fetch(`${AUTH_BASE}/me`, {
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  const { user } = await res.json();
  return user;
}

export async function createMovie(movie) {
  const data = await request('/admin/movies', {
    method: 'POST',
    body: JSON.stringify(movie)
  });
  return data.movie;
}

export async function createCategory(category) {
  const data = await request('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(category)
  });
  return data.categories;
}

export async function upsertEpisode(payload) {
  const data = await request('/admin/series/episode', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.series;
}

export async function recordProgress(entry) {
  const data = await request('/history', {
    method: 'POST',
    body: JSON.stringify(entry)
  });
  return data.history;
}

export async function getHistory() {
  const data = await request('/history');
  return data.history;
}
