const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  catalogOverview,
  loadSeries,
  loadMovies,
  loadCategories
} = require('../lib/catalog');
const { readJson, writeJson } = require('../lib/fileStore');

const router = express.Router();

router.get('/catalog', async (req, res) => {
  const catalog = await catalogOverview();
  res.json(catalog);
});

router.get('/movies', async (req, res) => {
  const movies = await loadMovies();
  res.json({ movies });
});

router.get('/series/:slug', async (req, res) => {
  const series = await loadSeries(req.params.slug);
  if (!series) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ series });
});

router.get('/categories', async (req, res) => {
  const categories = await loadCategories();
  res.json({ categories });
});

router.get('/home', async (req, res) => {
  const { movies, categories, series } = await catalogOverview();
  const featuredMovie = movies.find((m) => m.featured) || movies[0] || null;
  const hero = featuredMovie || series.find((s) => s.hero) || null;
  const continueWatchingEntries = await loadContinueWatching(req.session?.user);
  const continueItems = decorateContinueWatching(continueWatchingEntries, movies, series);
  const continueRow = continueItems.length
    ? [{
        id: 'continue',
        title: 'Continuer la lecture',
        layout: 'carousel',
        items: continueItems
      }]
    : [];

  const normalizedCategories = categories.map((cat) => ({
    ...cat,
    items: resolveCategoryItems(cat, movies, series)
  }));

  res.json({
    hero,
    categories: [...continueRow, ...normalizedCategories]
  });
});

router.get('/images/:asset', (req, res) => {
  const file = path.join(__dirname, '..', 'data', 'images', req.params.asset);
  fs.createReadStream(file)
    .on('error', () => res.status(404).end())
    .pipe(res);
});

router.get('/history', async (req, res) => {
  const history = await loadContinueWatching(req.session?.user);
  res.json({ history });
});

router.post('/history', express.json(), async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const entry = req.body;
  if (!entry?.contentId) {
    return res.status(400).json({ error: 'contentId required' });
  }
  const history = await saveHistoryEntry(req.session.user, entry);
  res.json({ history });
});

async function loadContinueWatching(user) {
  if (!user) {
    return [];
  }
  const historyFile = path.join(__dirname, '..', 'data', 'users', `${user.username}-history.json`);
  try {
    return await readJson(historyFile, []);
  } catch (err) {
    return [];
  }
}

async function saveHistoryEntry(user, entry) {
  const historyFile = path.join(__dirname, '..', 'data', 'users', `${user.username}-history.json`);
  const history = await readJson(historyFile, []);
  const filtered = history.filter((h) => h.contentId !== entry.contentId);
  filtered.unshift({ ...entry, updatedAt: new Date().toISOString() });
  const limited = filtered.slice(0, 20);
  await writeJson(historyFile, limited);
  return limited;
}

function resolveCategoryItems(category, movies, series) {
  if (!category.items || category.items.length === 0) {
    if (category.type === 'trending') {
      return movies.filter((m) => (m.tags || []).includes('trending'));
    }
    if (category.type === 'new') {
      return [...movies]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 10);
    }
    if (category.type === 'series') {
      return series.filter((s) => s.published !== false);
    }
    return movies;
  }
  return category.items
    .map((item) => {
      if (item.startsWith('movie:')) {
        const id = item.replace('movie:', '');
        return movies.find((m) => m.id === id);
      }
      if (item.startsWith('series:')) {
        const id = item.replace('series:', '');
        return series.find((s) => s.slug === id || s.id === id);
      }
      return movies.find((m) => m.id === item) || series.find((s) => s.id === item);
    })
    .filter(Boolean);
}

function decorateContinueWatching(entries, movies, series) {
  return entries
    .map((entry) => {
      if (entry.type === 'movies' || entry.type === 'movie') {
        const movie = movies.find((m) => `movie:${m.id}` === entry.contentId || m.id === entry.contentId);
        return movie && { ...movie, type: 'movies' };
      }
      if (entry.type === 'series') {
        const [_, slug, seasonEp] = entry.contentId.split(':');
        const [seasonPart, episodePart] = seasonEp ? seasonEp.split('e') : [];
        const seasonNumber = Number(seasonPart?.replace('s', ''));
        const episodeNumber = Number(episodePart);
        const serie = series.find((s) => s.slug === slug || s.id === slug);
        if (!serie) return null;
        const season = serie.seasons?.find((s) => s.season === seasonNumber);
        const episode = season?.episodes?.find((ep) => ep.ep === episodeNumber);
        return (
          episode && {
            ...episode,
            title: `${serie.title} · ${episode.title}`,
            slug: serie.slug,
            seriesTitle: serie.title,
            season: seasonNumber,
            type: 'series'
          }
        );
      }
      return null;
    })
    .filter(Boolean);
}

module.exports = router;
