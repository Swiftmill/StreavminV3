const path = require('path');
const { readJson, writeJson, withJsonLock } = require('./fileStore');
const slugify = require('./slugify');

const ROOT = path.join(__dirname, '..', 'data');
const CATALOG_ROOT = path.join(ROOT, 'catalog');
const MOVIES_FILE = path.join(CATALOG_ROOT, 'movies.json');
const CATEGORIES_FILE = path.join(CATALOG_ROOT, 'categories.json');
const SERIES_ROOT = path.join(CATALOG_ROOT, 'series');

async function loadMovies() {
  return readJson(MOVIES_FILE, []);
}

async function saveMovies(movies) {
  await writeJson(MOVIES_FILE, movies);
}

async function loadCategories() {
  return readJson(CATEGORIES_FILE, []);
}

async function saveCategories(categories) {
  await writeJson(CATEGORIES_FILE, categories);
}

async function getSeriesFile(slug) {
  return path.join(SERIES_ROOT, `${slug}.json`);
}

async function loadSeries(slug) {
  const file = await getSeriesFile(slug);
  return readJson(file, null);
}

async function listSeriesMeta() {
  const fs = require('fs');
  const files = await fs.promises.readdir(SERIES_ROOT).catch((err) => {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  });
  const metas = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = await readJson(path.join(SERIES_ROOT, file));
    metas.push({
      id: data.id,
      slug: data.slug,
      title: data.title,
      synopsis: data.synopsis,
      poster: data.poster,
      banner: data.banner,
      tags: data.tags,
      published: data.published !== false,
      seasons: (data.seasons || []).map((s) => ({
        season: s.season,
        episodes: (s.episodes || []).filter((ep) => ep.published !== false)
      }))
    });
  }
  return metas;
}

function sortSeasonsAndEpisodes(series) {
  series.seasons = (series.seasons || [])
    .sort((a, b) => a.season - b.season)
    .map((season) => ({
      ...season,
      episodes: (season.episodes || [])
        .sort((a, b) => a.ep - b.ep)
    }));
  return series;
}

async function upsertMovie(movie) {
  if (!movie.title) {
    throw new Error('Movie title is required');
  }
  const id = movie.id || slugify(movie.title);
  movie.id = id;
  movie.slug = movie.slug || id;
  movie.published = movie.published !== false;
  return withJsonLock(MOVIES_FILE, (current = []) => {
    const index = current.findIndex((m) => m.id === id);
    if (index >= 0) {
      current[index] = { ...current[index], ...movie };
    } else {
      current.push({
        synopsis: '',
        year: null,
        duration: null,
        genres: [],
        tags: [],
        subtitles: [],
        createdAt: new Date().toISOString(),
        ...movie
      });
    }
    current.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return current;
  }, []);
}

async function deleteMovie(id) {
  return withJsonLock(MOVIES_FILE, (current = []) => current.filter((m) => m.id !== id), []);
}

async function upsertCategory(category) {
  if (!category || !category.title) {
    throw new Error('Category title required');
  }
  const id = category.id || slugify(category.title);
  category.id = id;
  return withJsonLock(CATEGORIES_FILE, (current = []) => {
    const index = current.findIndex((c) => c.id === id);
    if (index >= 0) {
      current[index] = { ...current[index], ...category };
    } else {
      current.push({
        order: current.length,
        layout: 'carousel',
        items: [],
        ...category
      });
    }
    current.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return current;
  }, []);
}

async function reorderCategories(orderIds) {
  if (!Array.isArray(orderIds)) {
    throw new Error('orderIds must be an array');
  }
  return withJsonLock(CATEGORIES_FILE, (current = []) => {
    const map = new Map(orderIds.map((id, index) => [id, index]));
    return current
      .map((cat) => ({ ...cat, order: map.has(cat.id) ? map.get(cat.id) : cat.order }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);
}

async function removeCategory(id) {
  return withJsonLock(CATEGORIES_FILE, (current = []) => current.filter((c) => c.id !== id), []);
}

async function upsertSeriesEpisode(payload) {
  const { seriesName, season, ep } = payload;
  if (!seriesName) {
    throw new Error('seriesName is required');
  }
  const seasonNum = Number(season);
  const epNum = Number(ep);
  if (!Number.isInteger(seasonNum) || seasonNum <= 0 || !Number.isInteger(epNum) || epNum <= 0) {
    throw new Error('season and ep must be positive integers');
  }
  const slug = payload.slug || slugify(seriesName);
  const file = await getSeriesFile(slug);
  const defaultSeries = {
    id: slug,
    slug,
    title: seriesName,
    synopsis: payload.synopsis || '',
    tags: payload.tags || [],
    genres: payload.genres || [],
    poster: payload.poster || '',
    banner: payload.banner || '',
    hero: payload.hero || false,
    published: payload.published !== false,
    seasons: []
  };
  const series = await readJson(file, defaultSeries);
  series.title = payload.title || series.title || seriesName;
  series.synopsis = payload.synopsis ?? series.synopsis;
  series.poster = payload.poster ?? series.poster;
  series.banner = payload.banner ?? series.banner;
  series.tags = payload.tags ?? series.tags;
  series.genres = payload.genres ?? series.genres;
  series.hero = payload.hero ?? series.hero;
  series.published = payload.published ?? series.published;

  let seasonEntry = series.seasons.find((s) => s.season === seasonNum);
  if (!seasonEntry) {
    seasonEntry = { season: seasonNum, episodes: [] };
    series.seasons.push(seasonEntry);
  }
  const baseEpisode = {
    title: payload.title || `Episode ${epNum}`,
    synopsis: payload.episodeSynopsis || '',
    duration: payload.duration || null,
    streamUrl: payload.streamUrl,
    subtitles: payload.subtitles || [],
    poster: payload.episodePoster || payload.poster || series.poster,
    published: payload.published !== false,
    previewUrl: payload.previewUrl || '',
    releaseDate: payload.releaseDate || null
  };
  const idx = seasonEntry.episodes.findIndex((episode) => episode.ep === epNum);
  if (idx >= 0) {
    seasonEntry.episodes[idx] = {
      ...seasonEntry.episodes[idx],
      ...baseEpisode,
      ep: epNum
    };
  } else {
    seasonEntry.episodes.push({ ...baseEpisode, ep: epNum, createdAt: new Date().toISOString() });
  }
  sortSeasonsAndEpisodes(series);
  await writeJson(file, series);
  return series;
}

async function deleteSeries(slug) {
  const fs = require('fs');
  const file = await getSeriesFile(slug);
  try {
    await fs.promises.unlink(file);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function catalogOverview() {
  const [movies, categories, seriesMeta] = await Promise.all([
    loadMovies(),
    loadCategories(),
    listSeriesMeta()
  ]);
  return { movies, categories, series: seriesMeta };
}

module.exports = {
  loadMovies,
  saveMovies,
  loadCategories,
  saveCategories,
  upsertMovie,
  deleteMovie,
  upsertCategory,
  reorderCategories,
  removeCategory,
  upsertSeriesEpisode,
  loadSeries,
  deleteSeries,
  catalogOverview,
  sortSeasonsAndEpisodes
};
