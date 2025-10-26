import Link from 'next/link';
import Layout from '@/components/Layout';
import { SERVER_API_BASE } from '@/lib/config';
import styles from '@/styles/TitlePage.module.css';

export default function TitlePage({ item, type }) {
  if (!item) {
    return (
      <Layout>
        <div className={styles.empty}>Contenu introuvable</div>
      </Layout>
    );
  }
  const isSeries = type === 'series';
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.meta}>
          <h1>{item.title}</h1>
          {item.synopsis ? <p>{item.synopsis}</p> : null}
          <div className={styles.tags}>
            {(item.genres || []).map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
          <Link href={isSeries ? `/watch/series/${item.slug}?season=1&ep=1` : `/watch/movies/${item.id}`} className={styles.watch}>
            Lecture
          </Link>
        </div>
        {isSeries ? (
          <div className={styles.episodes}>
            {item.seasons?.map((season) => (
              <div key={season.season} className={styles.season}>
                <h2>Saison {season.season}</h2>
                <ul>
                  {season.episodes?.map((episode) => (
                    <li key={episode.ep}>
                      <Link href={`/watch/series/${item.slug}?season=${season.season}&ep=${episode.ep}`}>
                        <strong>Épisode {episode.ep}.</strong> {episode.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const { type, id } = params;
  if (type === 'movies') {
    const res = await fetch(`${SERVER_API_BASE}/movies`);
    const { movies } = await res.json();
    const item = movies.find((movie) => movie.id === id);
    return { props: { item: item || null, type } };
  }
  if (type === 'series') {
    const res = await fetch(`${SERVER_API_BASE}/series/${id}`);
    if (!res.ok) {
      return { props: { item: null, type } };
    }
    const { series } = await res.json();
    return { props: { item: series, type } };
  }
  return { props: { item: null, type } };
}
