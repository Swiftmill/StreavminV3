import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { login } from '@/lib/api';
import { useSession } from '@/context/SessionContext';
import styles from '@/styles/Auth.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();
  const { refresh } = useSession();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      await refresh();
      router.replace('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <form onSubmit={submit} className={styles.form}>
          <h1>Connexion</h1>
          <label>
            Nom d&apos;utilisateur
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </label>
          <label>
            Mot de passe
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button type="submit">Se connecter</button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </div>
    </Layout>
  );
}
