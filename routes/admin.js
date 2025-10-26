const express = require('express');
const router = express.Router();
const {
  upsertMovie,
  deleteMovie,
  upsertCategory,
  reorderCategories,
  removeCategory,
  upsertSeriesEpisode,
  deleteSeries,
  loadSeries
} = require('../lib/catalog');

function requireAdmin(req, res, next) {
  if (req.session?.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.use(requireAdmin);

router.post('/movies', async (req, res) => {
  try {
    const movie = await upsertMovie(req.body || {});
    res.json({ movie });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/movies/:id', async (req, res) => {
  try {
    await deleteMovie(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const categories = await upsertCategory(req.body || {});
    res.json({ categories });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/categories/order', async (req, res) => {
  try {
    const categories = await reorderCategories(req.body.order || []);
    res.json({ categories });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const categories = await removeCategory(req.params.id);
    res.json({ categories });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/series/episode', async (req, res) => {
  try {
    const series = await upsertSeriesEpisode(req.body || {});
    res.json({ series });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/series/:slug', async (req, res) => {
  try {
    const ok = await deleteSeries(req.params.slug);
    res.json({ ok });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/series/:slug', async (req, res) => {
  try {
    const series = await loadSeries(req.params.slug);
    if (!series) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ series });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
