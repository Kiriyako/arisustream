"use client";
import { useEffect, useState } from "react";
import "./styles.css";
import AnimeCard from "./AnimeCard";
import SearchBar from "./SearchBar"; 

export default function Main() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://anime-api-ten-gilt.vercel.app/api/top-ten")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnime(data.results.today);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
     <header className="site-header">
  <span className="logo">arisu</span>
  <SearchBar />
</header>
      <section>
        <h2 className="section-label">Trending Today</h2>

        {loading ? (
          <div className="loader-wrap"><span className="loader" /></div>
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