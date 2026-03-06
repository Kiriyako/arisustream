"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

const API = "https://anime-api-ten-gilt.vercel.app/api";

export default function AnimeCard({ item }) {
  const [qtip, setQtip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ side: "right" });
  const hoverTimer = useRef(null);
  const cardRef = useRef(null);

  // Extract numeric ID from item.id like "blend-s-1900" → "1900"
  const getNumericId = (id) => {
    const match = id?.match(/(\d+)$/);
    return match ? match[1] : null;
  };

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(async () => {
      if (qtip) return;

      // Figure out which side to show the popup
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right;
        setPos({ side: spaceRight < 280 ? "left" : "right" });
      }

      const numId = getNumericId(item.id);
      if (!numId) return;

      setLoading(true);
      try {
        const res = await fetch(`${API}/qtip/${numId}`);
        const data = await res.json();
        if (data.success) setQtip(data.results);
      } catch (_) {}
      setLoading(false);
    }, 600); // 400ms delay before fetching
  }, [item.id, qtip]);

const handleMouseLeave = useCallback(() => {
  clearTimeout(hoverTimer.current);
  // Small delay so moving between card and popup doesn't flicker
  hoverTimer.current = setTimeout(() => {
    setQtip(null);
    setLoading(false);
  }, 100);
}, []);

  return (
    <div
      ref={cardRef}
      className="card-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/anime/${item.id}`} className="card">
        <div className="card-img-wrap">
          <img src={item.poster} alt={item.japanese_title || item.title} />
          {item.tvInfo && (
            <div className="card-badges">
              {item.tvInfo.showType && (
                <span className="badge type">{item.tvInfo.showType}</span>
              )}
              {item.tvInfo.sub && (
                <span className="badge sub">SUB {item.tvInfo.sub}</span>
              )}
            </div>
          )}
        </div>
        <h3>{item.japanese_title || item.title}</h3>
      </Link>

      {/* Qtip popup */}
      {(loading || qtip) && (
        <div className={`qtip-popup ${pos.side}`}>
          {loading && !qtip ? (
            <div className="qtip-loading">
              <span className="qtip-spinner" />
            </div>
          ) : qtip ? (
            <>
              <div className="qtip-header">
                <span className="qtip-type">{qtip.type}</span>
                {qtip.quality && <span className="qtip-quality">{qtip.quality}</span>}
                {qtip.rating && <span className="qtip-rating">★ {qtip.rating}</span>}
              </div>

              <h4 className="qtip-title">{qtip.title}</h4>
              {qtip.japaneseTitle && (
                <p className="qtip-jp">{qtip.japaneseTitle}</p>
              )}

              <div className="qtip-counts">
                {qtip.subCount > 0 && (
                  <span className="qtip-count sub">SUB {qtip.subCount}</span>
                )}
                {qtip.dubCount > 0 && (
                  <span className="qtip-count dub">DUB {qtip.dubCount}</span>
                )}
                {qtip.episodeCount > 0 && (
                  <span className="qtip-count eps">{qtip.episodeCount} eps</span>
                )}
              </div>

              {qtip.status && (
                <div className="qtip-status">
                  <span className={`qtip-dot ${qtip.status.toLowerCase().includes("airing") ? "airing" : "finished"}`} />
                  {qtip.status}
                </div>
              )}

              {qtip.airedDate && (
                <p className="qtip-aired">{qtip.airedDate.replace(/-/g, " ")}</p>
              )}

              {qtip.genres?.length > 0 && (
                <div className="qtip-genres">
                  {qtip.genres.slice(0, 4).map((g) => (
                    <span key={g.name || g} className="qtip-genre">
                      {g.name || g}
                    </span>
                  ))}
                </div>
              )}

              {qtip.description && (
                <p className="qtip-desc">{qtip.description.slice(0, 120)}…</p>
              )}

              <Link href={`/anime/${item.id}`} className="qtip-btn">
                View Details →
              </Link>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}