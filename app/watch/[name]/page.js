import WatchClient from "./WatchClient";

export async function generateMetadata({ params, searchParams }) {
  const { name } = await params;
  const ep = searchParams?.ep;

  try {
    const [infoRes, epRes] = await Promise.all([
      fetch(`https://anime-api-ten-gilt.vercel.app/api/info?id=${name}`),
      ep ? fetch(`https://anime-api-ten-gilt.vercel.app/api/episodes/${name}`) : Promise.resolve(null),
    ]);

    const infoData = await infoRes.json();
    const title = infoData?.results?.data?.title || decodeURIComponent(name);

    if (epRes) {
      const epData = await epRes.json();
      const episode = epData?.results?.episodes?.find((e) => e.id.includes(`ep=${ep}`));
      if (episode) return { title: `EP ${episode.episode_no} — ${title}` };
    }

    return { title };
  } catch {
    return { title: decodeURIComponent(name) };
  }
}

export default async function Page({ params }) {
  const { name } = await params;
  return <WatchClient name={decodeURIComponent(name)} />;
}