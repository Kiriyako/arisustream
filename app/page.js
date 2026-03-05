"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./styles.css";

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
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.q.value.trim();
            if (q) window.location.href = `/search/${encodeURIComponent(q)}`;
          }}
        >
          <input name="q" placeholder="Search anime..." autoComplete="off" />
          <button type="submit">→</button>
        </form>
      </header>

      <section>
        <h2 className="section-label">Trending Today</h2>

        {loading ? (
          <div className="loader-wrap"><span className="loader" /></div>
        ) : (
          <div className="grid">
            {anime.map((item) => (
              <Link key={item.id} href={`/anime/${item.id}`} className="card">
                <div className="card-img-wrap">
                  <img src={item.poster} alt={item.japanese_title} />
                  {item.tvInfo && (
                    <div className="card-badges">
                      {item.tvInfo.showType && <span className="badge type">{item.tvInfo.showType}</span>}
                      {item.tvInfo.sub && <span className="badge sub">SUB {item.tvInfo.sub}</span>}
                    </div>
                  )}
                </div>
                <h3>{item.japanese_title || item.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}