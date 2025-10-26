import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '@/styles/HeroBanner.module.css';

export default function HeroBanner({ item }) {
  if (!item) return null;
  const href = item.seasons ? `/title/series/${item.slug}` : `/title/movies/${item.id}`;
  return (
    <motion.section className={styles.hero} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className={styles.backdrop}>
        {item.banner ? (
          <Image src={item.banner} alt={item.title} fill priority className={styles.backdropImage} sizes="100vw" />
        ) : null}
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <h1>{item.title}</h1>
        {item.synopsis ? <p>{item.synopsis}</p> : null}
        <div className={styles.actions}>
          <Link href={href} className={styles.primaryButton}>
            Regarder
          </Link>
          <Link href={href} className={styles.secondaryButton}>
            Plus d&apos;infos
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
