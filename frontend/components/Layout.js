import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import styles from '@/styles/Layout.module.css';

export default function Layout({ children }) {
  const { user } = useSession();
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Streavmin
        </Link>
        <nav className={styles.nav}>
          <Link href="/">Accueil</Link>
          <Link href="/browse/movies">Films</Link>
          <Link href="/browse/series">Séries</Link>
          {user?.role === 'admin' ? <Link href="/admin">Admin</Link> : null}
        </nav>
        <div className={styles.user}>{user ? <span>Bonjour {user.username}</span> : <Link href="/login">Connexion</Link>}</div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
