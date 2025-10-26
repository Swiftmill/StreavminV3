import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { MovieForm, CategoryForm, EpisodeForm } from '@/components/AdminForms';
import { useSession } from '@/context/SessionContext';
import styles from '@/styles/AdminPage.module.css';

export default function AdminPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'admin') {
    return (
      <Layout>
        <div className={styles.loading}>Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.grid}>
        <MovieForm />
        <CategoryForm />
        <EpisodeForm />
      </div>
    </Layout>
  );
}
