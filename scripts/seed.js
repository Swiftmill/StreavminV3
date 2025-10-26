const path = require('path');
const fs = require('fs');
const { writeJson } = require('../lib/fileStore');
const slugify = require('../lib/slugify');

const ROOT = path.join(__dirname, '..', 'data');
const CATALOG_DIR = path.join(ROOT, 'catalog');
const SERIES_DIR = path.join(CATALOG_DIR, 'series');
const USERS_DIR = path.join(ROOT, 'users');

async function ensureDirs() {
  await fs.promises.mkdir(SERIES_DIR, { recursive: true });
  await fs.promises.mkdir(USERS_DIR, { recursive: true });
}

const SAMPLE_STREAMS = {
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  dash: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
  mp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
};

const SAMPLE_SUBTITLES = [
  {
    lang: 'fr',
    label: 'Français',
    url: 'https://gist.githubusercontent.com/jfsiii/7d9588506f0a7d89f5cb/raw/cc.vtt'
  },
  {
    lang: 'en',
    label: 'English',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt'
  }
];

const MOVIES = [
  {
    title: 'Voyage Stellaris',
    synopsis: "Une mission interstellaire découvre un monde inattendu.",
    year: 2022,
    duration: 128,
    genres: ['Sci-Fi'],
    tags: ['trending', 'space'],
    poster: 'https://dummyimage.com/400x600/101020/ffffff&text=Voyage+Stellaris',
    banner: 'https://dummyimage.com/1280x720/181028/ffffff&text=Voyage+Stellaris',
    streamUrl: SAMPLE_STREAMS.hls,
    subtitles: SAMPLE_SUBTITLES,
    featured: true
  },
  {
    title: 'Tokyo Night Riders',
    synopsis: 'Des motards clandestins défient la ville et leurs destins.',
    year: 2021,
    duration: 104,
    genres: ['Action'],
    tags: ['action', 'trending'],
    poster: 'https://dummyimage.com/400x600/151521/ffffff&text=Tokyo+Night+Riders',
    streamUrl: SAMPLE_STREAMS.mp4,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Coeurs de Glace',
    synopsis: 'Un thriller romantique sur fond de tempête polaire.',
    year: 2020,
    duration: 96,
    genres: ['Romance', 'Thriller'],
    tags: ['romance'],
    poster: 'https://dummyimage.com/400x600/1a1f2a/ffffff&text=Coeurs+de+Glace',
    streamUrl: SAMPLE_STREAMS.hls,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Légende de Valoria',
    synopsis: "Un royaume en péril fait appel à une héroïne improbable.",
    year: 2019,
    duration: 132,
    genres: ['Fantasy'],
    tags: ['fantasy'],
    poster: 'https://dummyimage.com/400x600/16121f/ffffff&text=Legende+de+Valoria',
    streamUrl: SAMPLE_STREAMS.dash,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Chroniques du Delta',
    synopsis: 'Un enquêteur cybernétique démantèle un syndicat numérique.',
    year: 2023,
    duration: 118,
    genres: ['Sci-Fi', 'Thriller'],
    tags: ['new', 'trending'],
    poster: 'https://dummyimage.com/400x600/1d2030/ffffff&text=Chroniques+du+Delta',
    streamUrl: SAMPLE_STREAMS.hls,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Mirage Andalou',
    synopsis: 'Une photographe traque un mythe dans le désert andalou.',
    year: 2018,
    duration: 110,
    genres: ['Adventure'],
    tags: ['drama'],
    poster: 'https://dummyimage.com/400x600/202020/ffffff&text=Mirage+Andalou',
    streamUrl: SAMPLE_STREAMS.mp4,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Pulse 98',
    synopsis: 'Une DJ découvre un complot lors d’une rave rétro-futuriste.',
    year: 2024,
    duration: 101,
    genres: ['Music', 'Mystery'],
    tags: ['new'],
    poster: 'https://dummyimage.com/400x600/141414/ffffff&text=Pulse+98',
    streamUrl: SAMPLE_STREAMS.hls,
    subtitles: SAMPLE_SUBTITLES
  },
  {
    title: 'Rivages Cachés',
    synopsis: 'Un drame familial dans un village de pêcheurs isolé.',
    year: 2017,
    duration: 94,
    genres: ['Drama'],
    tags: ['classic'],
    poster: 'https://dummyimage.com/400x600/1f1f1f/ffffff&text=Rivages+Caches',
    streamUrl: SAMPLE_STREAMS.mp4,
    subtitles: SAMPLE_SUBTITLES
  }
];

const SERIES = [
  {
    title: 'Les Veilleurs du Néon',
    synopsis: 'Une unité spéciale protège une métropole cyberpunk.',
    poster: 'https://dummyimage.com/400x600/10122a/ffffff&text=Veilleurs+du+Neon',
    banner: 'https://dummyimage.com/1280x720/10122a/ffffff&text=Veilleurs+du+Neon',
    tags: ['action', 'trending'],
    genres: ['Action', 'Sci-Fi']
  },
  {
    title: 'Chroniques Aériennes',
    synopsis: 'Des pilotes explorent des îles flottantes.',
    poster: 'https://dummyimage.com/400x600/0f1e2f/ffffff&text=Chroniques+Aeriennes',
    banner: 'https://dummyimage.com/1280x720/0f1e2f/ffffff&text=Chroniques+Aeriennes',
    tags: ['adventure'],
    genres: ['Adventure', 'Fantasy']
  }
];

const CATEGORIES = [
  {
    id: 'trending',
    title: 'Tendances',
    type: 'trending',
    order: 0
  },
  {
    id: 'action',
    title: 'Action & Aventure',
    type: 'manual',
    items: ['movie:tokyo-night-riders', 'series:les-veilleurs-du-neon'],
    order: 1
  },
  {
    id: 'anime',
    title: 'Animation & Anime',
    type: 'manual',
    items: ['movie:pulse-98'],
    order: 2
  }
];

async function seed() {
  await ensureDirs();

  const movieEntries = MOVIES.map((movie) => ({
    id: slugify(movie.title),
    slug: slugify(movie.title),
    createdAt: new Date().toISOString(),
    published: true,
    ...movie
  }));

  await writeJson(path.join(CATALOG_DIR, 'movies.json'), movieEntries);
  await writeJson(path.join(CATALOG_DIR, 'categories.json'), CATEGORIES);

  for (const series of SERIES) {
    const slug = slugify(series.title);
    const seasons = [];
    for (let seasonNumber = 1; seasonNumber <= 2; seasonNumber++) {
      const episodes = [];
      for (let ep = 1; ep <= 3; ep++) {
        episodes.push({
          ep,
          title: `${series.title} S${seasonNumber}E${ep}`,
          synopsis: `${series.title} épisode ${ep}.`,
          streamUrl: SAMPLE_STREAMS.hls,
          subtitles: SAMPLE_SUBTITLES,
          poster: series.poster,
          duration: 45,
          published: true
        });
      }
      seasons.push({ season: seasonNumber, episodes });
    }
    await writeJson(path.join(SERIES_DIR, `${slug}.json`), {
      id: slug,
      slug,
      title: series.title,
      synopsis: series.synopsis,
      poster: series.poster,
      banner: series.banner,
      tags: series.tags,
      genres: series.genres,
      published: true,
      seasons
    });
  }

  const adminUserPath = path.join(USERS_DIR, 'admin.json');
  let passHash;
  try {
    // eslint-disable-next-line global-require
    const bcrypt = require('bcryptjs');
    passHash = bcrypt.hashSync('admin123', 10);
  } catch (err) {
    passHash = '$2y$10$DAR7onaqDoy2ycvMYW/3tuDcgRICePV.5EKr2b.7xyaKQTTfpmzPq';
  }
  const admin = {
    username: 'admin',
    role: 'admin',
    passHash
  };
  await writeJson(adminUserPath, admin);

  console.log('Seed completed. Admin credentials: admin / admin123');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
