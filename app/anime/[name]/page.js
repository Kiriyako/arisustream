import InfoClient from "./InfoClient";

export async function generateMetadata({ params }) {
  const { name } = await params;

  try {
    const res = await fetch(`https://anime-api-ten-gilt.vercel.app/api/info?id=${name}`);
    const data = await res.json();
    const title = data?.results?.data?.title || decodeURIComponent(name);
    return { title };
  } catch {
    return { title: decodeURIComponent(name) };
  }
}

export default async function Page({ params }) {
  const { name } = await params;
  return <InfoClient name={decodeURIComponent(name)} />;
}