import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import CarouselRow from '@/components/CarouselRow';
import { SERVER_API_BASE } from '@/lib/config';

export default function Home({ hero, categories }) {
  return (
    <Layout>
      <HeroBanner item={hero} />
      {categories.map((category) => (
        <CarouselRow key={category.id} category={category} />
      ))}
    </Layout>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`${SERVER_API_BASE}/home`);
  const data = await res.json();
  return {
    props: {
      hero: data.hero ?? null,
      categories: data.categories ?? []
    }
  };
}
