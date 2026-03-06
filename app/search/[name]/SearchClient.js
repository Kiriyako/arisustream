"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "../../styles.css";
import AnimeCard from "../../AnimeCard";
import SearchBar from "../../SearchBar";

export default function SearchClient({ name }) {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://anime-api-ten-gilt.vercel.app/api/search?keyword=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnime(data.results.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [name]);

  return (
    <div className="container">
      <header className="site-header">
        <Link href="/" className="logo">arisu</Link>
        <SearchBar defaultValue={name} />
      </header>

      <section>
        <h2 className="section-label">Results for "{name}"</h2>

        {loading ? (
          <div className="loader-wrap"><span className="loader" /></div>
        ) : anime.length === 0 ? (
          <p className="not-found">No results found.</p>
        ) : (
          <div className="grid">
            {anime.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}