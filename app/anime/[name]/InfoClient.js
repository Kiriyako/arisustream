"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./info.css";

export default function InfoClient({ name }) {
  const [info, setInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:4444/api/info?id=${encodeURIComponent(name)}`).then((r) => r.json()),
      fetch(`http://localhost:4444/api/episodes/${encodeURIComponent(name)}`).then((r) => r.json()),
    ])
      .then(([infoData, epData]) => {
        if (infoData.success) setInfo(infoData.results.data);
        if (epData.success) setEpisodes(epData.results.episodes);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [name]);

  if (loading) return <div className="loader-wrap"><span className="loader" /></div>;
  if (!info) return <div className="loader-wrap"><p className="not-found">Anime not found.</p></div>;

  const ai = info.animeInfo;
  const score = ai?.["MAL Score"];
  const genres = ai?.Genres || [];
  const status = ai?.Status?.replace(/-/g, " ");
  const aired = ai?.Aired?.replace(/-/g, " ");
  const studios = ai?.Studios?.replace(/-/g, " ");

  return (
    <div className="info-root">
      <div className="hero-banner" style={{ backgroundImage: `url(${info.poster})` }} />
      <div className="hero-overlay" />

      <header className="site-header">
        <Link href="/" className="logo">arisu</Link>
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

      <div className="info-layout">
        <aside className="info-sidebar">
          <div className="poster-wrap">
            <img src={info.poster} alt={info.title} className="poster-img" />
            {score && <div className="score-badge">★ {score}</div>}
          </div>

          <div className="meta-block">
            {status && <MetaRow label="Status" value={status} />}
            {aired && <MetaRow label="Aired" value={aired} />}
            {ai?.Premiered && <MetaRow label="Premiered" value={ai.Premiered.replace(/-/g, " ")} />}
            {studios && <MetaRow label="Studio" value={studios} />}
            {ai?.Duration && <MetaRow label="Duration" value={ai.Duration} />}
            {ai?.tvInfo?.rating && <MetaRow label="Rating" value={ai.tvInfo.rating} />}
          </div>

          {genres.length > 0 && (
            <div className="genres">
              {genres.map((g) => (
                <span key={g} className="genre-tag">{g}</span>
              ))}
            </div>
          )}
        </aside>

        <main className="info-main">
          <div className="title-row">
            <span className="show-type">{info.showType}</span>
            <h1 className="anime-title">{info.title}</h1>
            <p className="japanese-title">{info.japanese_title}</p>
          </div>

          {ai?.Overview && (
            <div className="overview">
              <h2 className="section-label">Overview</h2>
              <p>{ai.Overview}</p>
            </div>
          )}

          {info.charactersVoiceActors?.length > 0 && (
            <div className="characters-section">
              <h2 className="section-label">Characters</h2>
              <div className="characters-grid">
                {info.charactersVoiceActors.slice(0, 8).map((cvA) => (
                  <div key={cvA.character.id} className="char-card">
                    <img src={cvA.character.poster} alt={cvA.character.name} />
                    <div className="char-info">
                      <span className="char-name">{cvA.character.name.split(", ").reverse().join(" ")}</span>
                      <span className="char-cast">{cvA.character.cast}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ai?.trailers?.filter((t) => t.thumbnail).length > 0 && (
            <div className="trailers-section">
              <h2 className="section-label">Trailers</h2>
              <div className="trailers-row">
                {ai.trailers.filter((t) => t.thumbnail).map((t) => (
                  <a key={t.url} href={t.url.replace("/embed/", "/watch?v=")} target="_blank" rel="noreferrer" className="trailer-card">
                    <img src={t.thumbnail} alt={t.title} />
                    <div className="trailer-play">▶</div>
                    <span className="trailer-title">{t.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="episodes-panel">
          <h2 className="section-label">Episodes <span className="ep-count">{episodes.length}</span></h2>
          <div className="episodes-list">
            {episodes.map((ep) => (
              <Link key={ep.id} href={`/watch/${ep.id}`} className="ep-item">
                <span className="ep-num">{ep.episode_no}</span>
                <div className="ep-text">
                  <span className="ep-title">{ep.title}</span>
                  <span className="ep-jp">{ep.japanese_title}</span>
                </div>
                {ep.filler && <span className="filler-badge">F</span>}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="meta-row">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}