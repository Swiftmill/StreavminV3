import { useState } from 'react';
import { createMovie, createCategory, upsertEpisode } from '@/lib/api';
import styles from '@/styles/AdminForms.module.css';

export function MovieForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    synopsis: '',
    year: '',
    duration: '',
    genres: '',
    tags: '',
    poster: '',
    banner: '',
    streamUrl: '',
    subtitles: ''
  });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        genres: form.genres ? form.genres.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
        tags: form.tags ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
        subtitles: parseSubtitles(form.subtitles)
      };
      const movie = await createMovie(payload);
      setStatus(`Film enregistré (${movie.title})`);
      setForm({ title: '', synopsis: '', year: '', duration: '', genres: '', tags: '', poster: '', banner: '', streamUrl: '', subtitles: '' });
      onCreated?.(movie);
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <h3>Créer / Mettre à jour un film</h3>
      <label>
        Titre
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Synopsis
        <textarea value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
      </label>
      <div className={styles.inlineFields}>
        <label>
          Année
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </label>
        <label>
          Durée (min)
          <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </label>
      </div>
      <label>
        Genres (séparés par des virgules)
        <input value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} />
      </label>
      <label>
        Tags (séparés par des virgules)
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </label>
      <label>
        URL poster
        <input value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} />
      </label>
      <label>
        URL bannière
        <input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
      </label>
      <label>
        URL du flux
        <input value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} required />
      </label>
      <label>
        Sous-titres (JSON array)
        <textarea
          placeholder='[{"lang":"fr","label":"Français","url":"https://..."}]'
          value={form.subtitles}
          onChange={(e) => setForm({ ...form, subtitles: e.target.value })}
        />
      </label>
      <button type="submit">Enregistrer</button>
      {status ? <p className={styles.status}>{status}</p> : null}
    </form>
  );
}

export function CategoryForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', type: 'manual', items: '' });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        items: form.items
          ? form.items
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined
      };
      await createCategory(payload);
      setStatus('Catégorie enregistrée');
      setForm({ title: '', type: 'manual', items: '' });
      onCreated?.();
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <h3>Nouvelle catégorie</h3>
      <label>
        Titre
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Type
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="manual">Manuel</option>
          <option value="trending">Tendances</option>
          <option value="new">Nouveautés</option>
          <option value="series">Séries</option>
        </select>
      </label>
      <label>
        Items (ex: <code>movie:slug, series:slug</code>)
        <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
      </label>
      <button type="submit">Ajouter</button>
      {status ? <p className={styles.status}>{status}</p> : null}
    </form>
  );
}

export function EpisodeForm({ onCreated }) {
  const [form, setForm] = useState({
    seriesName: '',
    season: 1,
    ep: 1,
    title: '',
    synopsis: '',
    poster: '',
    banner: '',
    tags: '',
    genres: '',
    episodeSynopsis: '',
    streamUrl: '',
    episodePoster: '',
    subtitles: ''
  });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const series = await upsertEpisode({
        ...form,
        season: Number(form.season),
        ep: Number(form.ep),
        subtitles: parseSubtitles(form.subtitles),
        tags: form.tags ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
        genres: form.genres ? form.genres.split(',').map((item) => item.trim()).filter(Boolean) : undefined
      });
      setStatus(`Episode enregistré pour ${series.title}`);
      onCreated?.(series);
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <h3>Ajouter / Mettre à jour un épisode</h3>
      <label>
        Série
        <input value={form.seriesName} onChange={(e) => setForm({ ...form, seriesName: e.target.value })} required />
      </label>
      <label>
        Synopsis série
        <textarea value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
      </label>
      <label>
        Poster série
        <input value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} />
      </label>
      <label>
        Bannière série
        <input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
      </label>
      <label>
        Tags série (virgules)
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </label>
      <label>
        Genres série (virgules)
        <input value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} />
      </label>
      <div className={styles.inlineFields}>
        <label>
          Saison
          <input type="number" min="1" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} required />
        </label>
        <label>
          Episode
          <input type="number" min="1" value={form.ep} onChange={(e) => setForm({ ...form, ep: e.target.value })} required />
        </label>
      </div>
      <label>
        Titre de l&apos;épisode
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label>
        Synopsis
        <textarea value={form.episodeSynopsis} onChange={(e) => setForm({ ...form, episodeSynopsis: e.target.value })} />
      </label>
      <label>
        URL du flux
        <input value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} required />
      </label>
      <label>
        URL poster épisode
        <input value={form.episodePoster} onChange={(e) => setForm({ ...form, episodePoster: e.target.value })} />
      </label>
      <label>
        Sous-titres (JSON array)
        <textarea
          placeholder='[{"lang":"fr","label":"Français","url":"https://..."}]'
          value={form.subtitles}
          onChange={(e) => setForm({ ...form, subtitles: e.target.value })}
        />
      </label>
      <button type="submit">Enregistrer l&apos;épisode</button>
      {status ? <p className={styles.status}>{status}</p> : null}
    </form>
  );
}

function parseSubtitles(raw) {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch (err) {
    return undefined;
  }
}
