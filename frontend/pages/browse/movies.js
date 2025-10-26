import Layout from '@/components/Layout';
import TitleCard from '@/components/TitleCard';
import { SERVER_API_BASE } from '@/lib/config';
import styles from '@/styles/BrowsePage.module.css';

export default function MoviesPage({ movies }) {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Films</h1>
        <div className={styles.grid}>
          {movies.map((movie) => (
            <TitleCard key={movie.id} item={movie} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`${SERVER_API_BASE}/movies`);
  const { movies } = await res.json();
  return { props: { movies } };
}
