import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/TitleCard.module.css';

export default function TitleCard({ item }) {
  if (!item) return null;
  const isSeries = Boolean(item.seasons);
  const isEpisode = item.type === 'series' && !item.seasons;
  const href = isEpisode
    ? `/watch/series/${item.slug}?season=${item.season}&ep=${item.ep}`
    : isSeries
    ? `/title/series/${item.slug}`
    : `/title/movies/${item.id}`;
  const image = item.poster || item.banner;
  let label = '';
  if (item.duration) {
    label = `${item.duration} min`;
  } else if (isSeries) {
    label = `${item.seasons.length} saisons`;
  } else if (isEpisode) {
    label = `S${item.season} · E${item.ep}`;
  }
  return (
    <Link href={href} className={styles.card}>
      {image ? <Image src={image} alt={item.title} width={180} height={260} className={styles.poster} /> : <div className={styles.placeholder}>{item.title}</div>}
      <div className={styles.info}>
        <h3>{item.title}</h3>
        {label ? <span>{label}</span> : null}
      </div>
    </Link>
  );
}
