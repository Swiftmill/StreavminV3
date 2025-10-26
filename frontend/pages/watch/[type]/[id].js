import { useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import VideoPlayer from '@/components/VideoPlayer';
import { recordProgress } from '@/lib/api';
import { SERVER_API_BASE } from '@/lib/config';
import styles from '@/styles/WatchPage.module.css';

export default function WatchPage({ item, episode, type }) {
  const router = useRouter();
  if (!item) {
    return (
      <Layout>
        <div className={styles.empty}>Flux indisponible</div>
      </Layout>
    );
  }
  const title = episode ? `${item.title} · ${episode.title}` : item.title;
  const streamUrl = episode?.streamUrl || item.streamUrl;
  const subtitles = episode?.subtitles || item.subtitles || [];
  const contentId = episode ? `series:${item.slug}:s${episode.season}e${episode.ep}` : `movie:${item.id}`;

  const handleProgress = useCallback(
    ({ currentTime, duration }) => {
      recordProgress({
        contentId,
        title,
        type,
        progress: currentTime,
        duration
      }).catch(() => {});
    },
    [contentId, title, type]
  );

  const nextEpisode = getNextEpisode(item, episode);

  return (
    <Layout>
      <div className={styles.wrapper}>
        <VideoPlayer title={title} streamUrl={streamUrl} subtitles={subtitles} onProgress={handleProgress} />
        {nextEpisode ? (
          <button
            type="button"
            className={styles.next}
            onClick={() => router.push(`/watch/series/${item.slug}?season=${nextEpisode.season}&ep=${nextEpisode.ep}`)}
          >
            Épisode suivant
          </button>
        ) : null}
      </div>
    </Layout>
  );
}

function getNextEpisode(series, episode) {
  if (!episode || !series?.seasons) return null;
  const season = series.seasons.find((s) => s.season === episode.season);
  if (!season) return null;
  const index = season.episodes.findIndex((ep) => ep.ep === episode.ep);
  if (index >= 0 && index + 1 < season.episodes.length) {
    return { ...season.episodes[index + 1], season: season.season };
  }
  const nextSeason = series.seasons.find((s) => s.season === episode.season + 1);
  if (nextSeason && nextSeason.episodes.length) {
    return { ...nextSeason.episodes[0], season: nextSeason.season };
  }
  return null;
}

export async function getServerSideProps({ params, query }) {
  const { type, id } = params;
  if (type === 'movies') {
    const res = await fetch(`${SERVER_API_BASE}/movies`);
    const { movies } = await res.json();
    const movie = movies.find((m) => m.id === id);
    return { props: { item: movie || null, episode: null, type } };
  }
  if (type === 'series') {
    const res = await fetch(`${SERVER_API_BASE}/series/${id}`);
    if (!res.ok) {
      return { props: { item: null, episode: null, type } };
    }
    const { series } = await res.json();
    const season = Number(query.season || 1);
    const ep = Number(query.ep || 1);
    const seasonEntry = series.seasons?.find((s) => s.season === season);
    const episode = seasonEntry?.episodes?.find((episode) => episode.ep === ep);
    if (episode) {
      episode.season = seasonEntry.season;
    }
    return { props: { item: series, episode: episode || null, type } };
  }
  return { props: { item: null, episode: null, type } };
}
