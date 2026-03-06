"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./watch.css";

const API = "https://anime-api-ten-gilt.vercel.app/api";

export default function WatchClient({ name }) {
  const searchParams = useSearchParams();
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);

  const [info, setInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [servers, setServers] = useState([]);
  const [streamData, setStreamData] = useState(null);

  const [activeEp, setActiveEp] = useState(null);
  const [activeServer, setActiveServer] = useState(null);
  const [activeType, setActiveType] = useState("sub");

  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingStream, setLoadingStream] = useState(false);

  // 1. Load anime info + episodes
  useEffect(() => {
    Promise.all([
      fetch(`${API}/info?id=${encodeURIComponent(name)}`).then((r) => r.json()),
      fetch(`${API}/episodes/${encodeURIComponent(name)}`).then((r) => r.json()),
      fetch(`${API}/schedule/${encodeURIComponent(name)}`).then((r) => r.json()).catch(() => null),
    ]).then(([infoData, epData, schedData]) => {
      if (infoData.success) setInfo(infoData.results.data);
      if (epData.success) {
        const eps = epData.results.episodes;
        setEpisodes(eps);

        // Match episode from ?ep= query param
        const epParam = searchParams.get("ep");
        const matched = epParam
          ? eps.find((e) => e.id.includes(`ep=${epParam}`))
          : null;
        setActiveEp(matched || eps[0]);
      }
      if (schedData?.success) setSchedule(schedData.results.nextEpisodeSchedule);
      setLoadingInfo(false);
    }).catch((err) => {
      console.error(err);
      setLoadingInfo(false);
    });
  }, [name]);

  // 2. Load servers when episode changes
  useEffect(() => {
    if (!activeEp) return;
    setServers([]);
    setStreamData(null);
    setActiveServer(null);

    fetch(`${API}/servers/${activeEp.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.results.length > 0) {
          setServers(data.results);
const filtered = data.results.filter((s) => s.serverName !== "HD-1");
const pool = filtered.length > 0 ? filtered : data.results;
const preferred = pool.find((s) => s.type === activeType) || pool[0];          setActiveServer(preferred);
          setActiveType(preferred.type);
        }
      })
      .catch(console.error);
  }, [activeEp]);

  // 3. Load stream when server changes
  useEffect(() => {
    if (!activeServer || !activeEp) return;
    setLoadingStream(true);

    fetch(`${API}/stream?id=${activeEp.id}&server=${activeServer.serverName}&type=${activeServer.type}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStreamData(data.results.streamingLink);
        setLoadingStream(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingStream(false);
      });
  }, [activeServer]);

  // 4. Init / update OPlayer when streamData changes
  useEffect(() => {
    if (!streamData?.link?.file || !playerRef.current) return;

    const src = `${API}/proxy?url=${encodeURIComponent(streamData.link.file)}`;
    const tracks = (streamData.tracks || [])
      .filter((t) => t.kind === "captions")
      .map((t) => ({ name: t.label, src: t.file, default: t.default || false }));

    let destroyed = false;

    (async () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.pause();
          await new Promise((r) => setTimeout(r, 50));
          playerInstanceRef.current.destroy();
        } catch (_) {}
        playerInstanceRef.current = null;
      }

      if (destroyed) return;

      const { default: Player } = await import("@oplayer/core");
      const { default: ui } = await import("@oplayer/ui");
      const { default: hls } = await import("@oplayer/hls");

      if (destroyed) return;

      const player = Player.make(playerRef.current, {
        source: {
          src,
          poster: info?.poster || "",
          title: activeEp ? `EP ${activeEp.episode_no} — ${activeEp.title}` : "",
        },
        autoplay: true,
        preload: "auto",
      })
        .use([
          hls({ forceHLS: true }),
          ui({
            subtitle: tracks.length > 0 ? { source: tracks } : undefined,
            theme: { primaryColor: "#e5a0ff" },
            pictureInPicture: true,
            screenshot: false,
          }),
        ])
        .create();

      playerInstanceRef.current = player;
    })();

    return () => {
      destroyed = true;
      if (playerInstanceRef.current) {
        try { playerInstanceRef.current.destroy(); } catch (_) {}
        playerInstanceRef.current = null;
      }
    };
  }, [streamData]);

  const handleEpSelect = (ep) => {
    if (ep.id === activeEp?.id) return;
    // Update URL without full page reload
    const epId = ep.id.split("?ep=")[1];
    window.history.pushState({}, "", `/watch/${name}?ep=${epId}`);
    setActiveEp(ep);
  };

  const handleServerSelect = (server) => {
    if (server.serverName === activeServer?.serverName && server.type === activeServer?.type) return;
    setActiveServer(server);
    setActiveType(server.type);
  };

  const subServers = servers.filter((s) => s.type === "sub");
  const dubServers = servers.filter((s) => s.type === "dub");

  const formatSchedule = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  if (loadingInfo) {
    return <div className="loader-wrap"><span className="loader" /></div>;
  }

  return (
    <div className="watch-root">
      {/* Header */}
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

      <div className="watch-layout">
        {/* LEFT: player + controls */}
        <div className="watch-main">

          {/* Breadcrumb */}
          {info && (
            <div className="breadcrumb">
              <Link href={`/anime/${name}`} className="breadcrumb-link">
                {info.title}
              </Link>
              {activeEp && (
                <>
                  <span className="breadcrumb-sep">›</span>
                  <span>Episode {activeEp.episode_no}</span>
                </>
              )}
            </div>
          )}

          {/* Player */}
          <div className="player-wrap">
            {loadingStream && (
              <div className="player-loading">
                <span className="loader" />
              </div>
            )}
            <div ref={playerRef} className="oplayer-container" />
          </div>

          {/* Episode title */}
          {activeEp && (
            <div className="ep-now-playing">
              <span className="ep-now-num">EP {activeEp.episode_no}</span>
              <span className="ep-now-title">{activeEp.title}</span>
              {activeEp.japanese_title && (
                <span className="ep-now-jp">{activeEp.japanese_title}</span>
              )}
            </div>
          )}

          {/* Server selector */}
          {servers.length > 0 && (
            <div className="servers-wrap">
              {subServers.length > 0 && (
                <div className="server-group">
                  <span className="server-group-label">SUB</span>
                  {subServers.map((s) => (
                    <button
                      key={s.serverName + s.type}
                      className={`server-btn ${activeServer?.serverName === s.serverName && activeServer?.type === s.type ? "active" : ""}`}
                      onClick={() => handleServerSelect(s)}
                    >
                      {s.serverName}
                    </button>
                  ))}
                </div>
              )}
              {dubServers.length > 0 && (
                <div className="server-group">
                  <span className="server-group-label">DUB</span>
                  {dubServers.map((s) => (
                    <button
                      key={s.serverName + s.type}
                      className={`server-btn ${activeServer?.serverName === s.serverName && activeServer?.type === s.type ? "active" : ""}`}
                      onClick={() => handleServerSelect(s)}
                    >
                      {s.serverName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Anime info strip */}
          {info && (
            <div className="anime-strip">
              <img src={info.poster} alt={info.title} className="strip-poster" />
              <div className="strip-info">
                <Link href={`/anime/${name}`} className="strip-title">{info.title}</Link>
                <p className="strip-jp">{info.japanese_title}</p>
                <div className="strip-meta">
                  {info.showType && <span className="strip-tag">{info.showType}</span>}
                  {info.animeInfo?.["MAL Score"] && (
                    <span className="strip-tag score">★ {info.animeInfo["MAL Score"]}</span>
                  )}
                  {info.animeInfo?.Status && (
                    <span className="strip-tag">{info.animeInfo.Status.replace(/-/g, " ")}</span>
                  )}
                </div>
                {schedule && (
                  <div className="schedule-badge">
                    <span className="schedule-icon">📅</span>
                    Next episode: <strong>{formatSchedule(schedule)}</strong>
                  </div>
                )}
                {info.animeInfo?.Overview && (
                  <p className="strip-overview">{info.animeInfo.Overview.slice(0, 200)}…</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: episode list */}
        <aside className="watch-episodes">
          <div className="ep-panel-header">
            <h2 className="section-label">
              Episodes <span className="ep-count">{episodes.length}</span>
            </h2>
          </div>
          <div className="episodes-list">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className={`ep-item ${activeEp?.id === ep.id ? "active" : ""}`}
                onClick={() => handleEpSelect(ep)}
              >
                <span className="ep-num">{ep.episode_no}</span>
                <div className="ep-text">
                  <span className="ep-title">{ep.title}</span>
                  <span className="ep-jp">{ep.japanese_title}</span>
                </div>
                {ep.filler && <span className="filler-badge">F</span>}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
// OH GOD I AM TIRED OF CODING TS :hearbreak: