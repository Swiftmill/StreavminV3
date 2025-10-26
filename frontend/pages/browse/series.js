import Layout from '@/components/Layout';
import TitleCard from '@/components/TitleCard';
import { SERVER_API_BASE } from '@/lib/config';
import styles from '@/styles/BrowsePage.module.css';

export default function SeriesPage({ series }) {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Séries</h1>
        <div className={styles.grid}>
          {series.map((show) => (
            <TitleCard key={show.id} item={show} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`${SERVER_API_BASE}/catalog`);
  const data = await res.json();
  return { props: { series: data.series || [] } };
}
