import InfoClient from "./InfoClient";

export async function generateMetadata({ params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  return {
    title: decodedName,
  };
}

export default async function Page({ params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  return <InfoClient name={decodedName} />;
}