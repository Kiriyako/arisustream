import SearchClient from "./SearchClient";

export async function generateMetadata({ params }) {
  const { name } = await params;

  const decodedName = decodeURIComponent(name);

  return {
    title: `Searching for ${decodedName}`,
  };
}

export default async function Page({ params }) {
  const { name } = await params;

  const decodedName = decodeURIComponent(name);

  return <SearchClient name={decodedName} />;
}