import { useRef } from 'react';
import { motion } from 'framer-motion';
import TitleCard from './TitleCard';
import styles from '@/styles/CarouselRow.module.css';

export default function CarouselRow({ category }) {
  const containerRef = useRef(null);
  if (!category?.items?.length) return null;

  return (
    <section className={styles.row}>
      <header className={styles.header}>
        <h2>{category.title}</h2>
        <div className={styles.controls}>
          <button type="button" onClick={() => scroll(containerRef, -1)} aria-label="Précédent">
            ◀
          </button>
          <button type="button" onClick={() => scroll(containerRef, 1)} aria-label="Suivant">
            ▶
          </button>
        </div>
      </header>
      <motion.div ref={containerRef} className={styles.scroller}>
        {category.items.map((item) => (
          <TitleCard key={`${item.slug || item.id || 'item'}-${item.ep || ''}`} item={item} />
        ))}
      </motion.div>
    </section>
  );
}

function scroll(ref, direction) {
  if (!ref.current) return;
  ref.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
}
