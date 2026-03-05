import WatchClient from "./WatchClient";

export async function generateMetadata({ params }) {
  const { name } = await params;
  return { title: `Watching — ${decodeURIComponent(name)}` };
}

export default async function Page({ params }) {
  const { name } = await params;
  return <WatchClient name={decodeURIComponent(name)} />;
}