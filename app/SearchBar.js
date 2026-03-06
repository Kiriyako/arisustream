"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import "./searchbar.css";

const API = "https://anime-api-ten-gilt.vercel.app/api";

export default function SearchBar({ defaultValue = "" }) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/search/suggest?keyword=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.results.length > 0) {
          setSuggestions(data.results.slice(0, 8));
          setOpen(true);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch (_) {}
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setOpen(false);
      window.location.href = `/search/${encodeURIComponent(q)}`;
    }
  };

  const handleSelect = () => {
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapRef} className="searchbar-wrap">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search anime..."
          autoComplete="off"
        />
        <button type="submit">→</button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((item) => (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="suggestion-item"
              onClick={handleSelect}
            >
              <img src={item.poster} alt={item.title} className="suggestion-poster" />
              <div className="suggestion-info">
                <span className="suggestion-title">{item.title}</span>
                {item.japanese_title && item.japanese_title !== item.title && (
                  <span className="suggestion-jp">{item.japanese_title}</span>
                )}
                <div className="suggestion-meta">
                  {item.showType && <span className="suggestion-tag">{item.showType}</span>}
                  {item.releaseDate && <span className="suggestion-date">{item.releaseDate}</span>}
                  {item.duration && <span className="suggestion-date">{item.duration}</span>}
                </div>
              </div>
            </Link>
          ))}

          <button
            className="suggestion-search-all"
            onClick={() => {
              setOpen(false);
              window.location.href = `/search/${encodeURIComponent(query)}`;
            }}
          >
            Search all results for "{query}" →
          </button>
        </div>
      )}
    </div>
  );
}