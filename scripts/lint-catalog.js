const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const { readJson } = require('../lib/fileStore');

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

const movieSchema = {
  type: 'object',
  required: ['id', 'title', 'streamUrl'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    synopsis: { type: 'string' },
    year: { type: ['number', 'null'] },
    duration: { type: ['number', 'null'] },
    genres: { type: 'array', items: { type: 'string' } },
    tags: { type: 'array', items: { type: 'string' } },
    poster: { type: 'string' },
    banner: { type: 'string' },
    streamUrl: { type: 'string', minLength: 4 },
    subtitles: {
      type: 'array',
      items: {
        type: 'object',
        required: ['lang', 'url'],
        properties: {
          lang: { type: 'string' },
          label: { type: 'string' },
          url: { type: 'string' }
        }
      }
    }
  }
};

const categorySchema = {
  type: 'object',
  required: ['id', 'title'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    order: { type: ['number', 'null'] },
    type: { type: 'string' },
    layout: { type: 'string' },
    items: { type: 'array', items: { type: 'string' } }
  }
};

const seriesSchema = {
  type: 'object',
  required: ['id', 'title', 'seasons'],
  properties: {
    id: { type: 'string' },
    slug: { type: 'string' },
    title: { type: 'string' },
    synopsis: { type: 'string' },
    poster: { type: 'string' },
    banner: { type: 'string' },
    seasons: {
      type: 'array',
      items: {
        type: 'object',
        required: ['season', 'episodes'],
        properties: {
          season: { type: 'number' },
          episodes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['ep', 'title', 'streamUrl'],
              properties: {
                ep: { type: 'number' },
                title: { type: 'string' },
                streamUrl: { type: 'string' },
                subtitles: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['lang', 'url'],
                    properties: {
                      lang: { type: 'string' },
                      label: { type: 'string' },
                      url: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const validateMovie = ajv.compile(movieSchema);
const validateCategory = ajv.compile(categorySchema);
const validateSeries = ajv.compile(seriesSchema);

async function run() {
  const catalogDir = path.join(__dirname, '..', 'data', 'catalog');
  const movies = await readJson(path.join(catalogDir, 'movies.json'), []);
  const categories = await readJson(path.join(catalogDir, 'categories.json'), []);

  let errors = [];
  for (const movie of movies) {
    if (!validateMovie(movie)) {
      errors = errors.concat(validateMovie.errors.map((e) => `Movie ${movie.id}: ${e.message}`));
    }
  }
  for (const category of categories) {
    if (!validateCategory(category)) {
      errors = errors.concat(validateCategory.errors.map((e) => `Category ${category.id}: ${e.message}`));
    }
  }

  const seriesDir = path.join(catalogDir, 'series');
  const files = await fs.promises.readdir(seriesDir).catch(() => []);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = await readJson(path.join(seriesDir, file), {});
    if (!validateSeries(data)) {
      errors = errors.concat(validateSeries.errors.map((e) => `Series ${data.id || file}: ${e.message}`));
    }
  }

  if (errors.length) {
    console.error('Catalog validation failed:');
    errors.forEach((err) => console.error(` - ${err}`));
    process.exit(1);
  }
  console.log('Catalog validation successful');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
