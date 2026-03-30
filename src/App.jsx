import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000";

const GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
};

const StarRating = ({ rating }) => {
  const stars = rating / 2;
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = stars >= i;
        const half = !filled && stars >= i - 0.5;
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`g${i}`}>
                <stop offset={half ? "50%" : filled ? "100%" : "0%"} stopColor="#00c030" />
                <stop offset={half ? "50%" : filled ? "100%" : "0%"} stopColor="#1a1a1a" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? "#00c030" : half ? `url(#g${i})` : "#2a2a2a"}
              stroke={filled || half ? "#00c030" : "#3a3a3a"}
              strokeWidth="1"
            />
          </svg>
        );
      })}
      <span style={{ color: "#00c030", fontSize: "12px", fontWeight: 700, marginLeft: "4px", fontFamily: "monospace" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const ScoreBadge = ({ score }) => {
  const pct = Math.min(100, Math.round((score / 30) * 100));
  const color = pct >= 75 ? "#00c030" : pct >= 50 ? "#e8b84b" : "#e84b4b";
  return (
    <div style={{
      position: "absolute", top: "10px", right: "10px",
      width: "40px", height: "40px", borderRadius: "50%",
      background: `conic-gradient(${color} ${pct * 3.6}deg, #1a1a1a ${pct * 3.6}deg)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 10px ${color}60`,
    }}>
      <div style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: "#141414", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "9px", fontWeight: 800, color, fontFamily: "monospace",
      }}>
        {pct}%
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onClick, rank }) => {
  const [hovered, setHovered] = useState(false);
  const year = movie.release_date?.slice(0, 4);
  const genres = (movie.genre_ids || []).slice(0, 2).map(id => GENRES[id]).filter(Boolean);

  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "6px", overflow: "hidden",
        background: "#1a1a1a", border: `1px solid ${hovered ? "#00c030" : "#2a2a2a"}`,
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "none",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,192,48,0.15)" : "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: "absolute", top: "10px", left: "10px", zIndex: 2,
        width: "28px", height: "28px", borderRadius: "50%",
        background: "rgba(0,0,0,0.85)", border: "1.5px solid #00c030",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 900, color: "#00c030", fontFamily: "monospace",
      }}>
        #{rank}
      </div>

      {movie.score && <ScoreBadge score={movie.score} />}

      {/* Poster */}
      <div style={{ position: "relative", paddingBottom: "150%", background: "#111" }}>
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "48px", background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)"
          }}>🎬</div>
        )}
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: hovered ? 1 : 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 40%, transparent)",
          transition: "opacity 0.25s",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px",
        }}>
          <p style={{ color: "#ccc", fontSize: "12px", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {movie.overview}
          </p>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: "11px", color: "#888", fontFamily: "monospace", marginBottom: "4px" }}>{year}</div>
        <div style={{ fontWeight: 700, fontSize: "13px", color: "#f0f0f0", lineHeight: 1.3, marginBottom: "8px", fontFamily: "'Playfair Display', serif" }}>
          {movie.title}
        </div>
        <StarRating rating={movie.vote_average} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
          {genres.map(g => (
            <span key={g} style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "2px 7px", borderRadius: "20px", background: "#252525", color: "#888", border: "1px solid #333",
              fontFamily: "monospace"
            }}>{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MovieDetailModal = ({ movieId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/movie/${movieId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [movieId]);

  if (!detail && !loading) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141414", borderRadius: "12px", maxWidth: "760px", width: "100%",
          maxHeight: "90vh", overflow: "auto", border: "1px solid #2a2a2a",
          boxShadow: "0 40px 100px rgba(0,0,0,0.9)",
          scrollbarWidth: "thin", scrollbarColor: "#333 #111",
        }}
      >
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#666", fontFamily: "monospace" }}>Loading...</div>
        ) : detail ? (
          <>
            {detail.backdrop_path && (
              <div style={{ position: "relative", height: "240px", overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                <img src={detail.backdrop_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #141414 20%, transparent)" }} />
                <button onClick={onClose} style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: "rgba(0,0,0,0.7)", border: "1px solid #333", color: "#ccc",
                  width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "16px",
                }}>×</button>
              </div>
            )}
            <div style={{ padding: "28px", display: "flex", gap: "24px" }}>
              {detail.poster_path && (
                <img src={detail.poster_path} alt={detail.title} style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "6px", flexShrink: 0, border: "1px solid #2a2a2a", marginTop: detail.backdrop_path ? "-60px" : "0", position: "relative" }} />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 4px", color: "#f0f0f0", fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>{detail.title}</h2>
                {detail.tagline && <p style={{ margin: "0 0 10px", color: "#00c030", fontStyle: "italic", fontSize: "13px", fontFamily: "monospace" }}>{detail.tagline}</p>}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                  <span style={{ color: "#888", fontSize: "12px", fontFamily: "monospace" }}>{detail.release_date?.slice(0, 4)}</span>
                  {detail.runtime && <span style={{ color: "#888", fontSize: "12px", fontFamily: "monospace" }}>{detail.runtime} min</span>}
                  {detail.director && <span style={{ color: "#aaa", fontSize: "12px" }}>Dir. <span style={{ color: "#00c030" }}>{detail.director}</span></span>}
                </div>
                <StarRating rating={detail.vote_average} />
                <p style={{ color: "#bbb", fontSize: "13px", lineHeight: 1.7, margin: "14px 0", fontFamily: "Georgia, serif" }}>{detail.overview}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(detail.genres || []).map(g => (
                    <span key={g} style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: "20px", background: "#1e1e1e", color: "#00c030", border: "1px solid #00c03050", fontFamily: "monospace" }}>{g}</span>
                  ))}
                </div>
                {detail.cast?.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <p style={{ color: "#666", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", margin: "0 0 10px" }}>Cast</p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {detail.cast.map(c => (
                        <div key={c.name} style={{ textAlign: "center", width: "56px" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", background: "#222", margin: "0 auto 4px", border: "1.5px solid #333" }}>
                            {c.profile_path ? <img src={c.profile_path} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>}
                          </div>
                          <div style={{ fontSize: "9px", color: "#aaa", fontFamily: "monospace", lineHeight: 1.3 }}>{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [totalFound, setTotalFound] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  const suggestions = ["Inception", "The Godfather", "Parasite", "Interstellar", "Pulp Fiction", "The Dark Knight"];

  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/recommend?q=${encodeURIComponent(q)}&limit=5`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setResults(data.recommendations);
      setTotalFound(data.total_found);
    } catch (e) {
      setError("Could not connect to backend. Make sure the FastAPI server is running on port 8000.");
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0e0e0e",
      fontFamily: "'Inter', sans-serif", color: "#f0f0f0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1f1f1f",
        background: "rgba(14,14,14,0.95)",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #00c030, #009020)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 900, fontFamily: "monospace", color: "#000",
            boxShadow: "0 0 14px rgba(0,192,48,0.4)",
          }}>🎞</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.02em" }}>
            cine<span style={{ color: "#00c030" }}>match</span>
          </span>
        </div>
        <nav style={{ display: "flex", gap: "24px" }}>
          {["Films", "Lists", "Members"].map(n => (
            <span key={n} style={{ color: "#666", fontSize: "13px", cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#00c030"}
              onMouseLeave={e => e.target.style.color = "#666"}
            >{n}</span>
          ))}
        </nav>
      </header>

      {/* Hero search */}
      <div style={{
        padding: hasSearched ? "40px 32px 32px" : "80px 32px",
        maxWidth: "700px", margin: "0 auto", textAlign: "center",
        transition: "padding 0.4s ease",
      }}>
        {!hasSearched && (
          <>
            <div style={{ fontSize: "11px", color: "#00c030", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>
              AI-Powered Film Discovery
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(32px, 6vw, 52px)",
              lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.02em",
            }}>
              Find your next<br />
              <span style={{ color: "#00c030", fontStyle: "italic" }}>favorite film.</span>
            </h1>
            <p style={{ color: "#666", fontSize: "15px", marginBottom: "40px", lineHeight: 1.6 }}>
              Search any movie, genre, or vibe — our algorithm surfaces the 5 best matches.
            </p>
          </>
        )}

        {/* Search bar */}
        <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: "0",
            background: "#181818", borderRadius: "10px",
            border: "1.5px solid #2a2a2a",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            <span style={{ padding: "0 16px", display: "flex", alignItems: "center", color: "#555", fontSize: "18px" }}>🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Search movies, genres, moods..."
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#f0f0f0", fontSize: "15px", padding: "14px 0",
                fontFamily: "inherit", caretColor: "#00c030",
              }}
            />
            <button
              onClick={() => search()}
              disabled={loading}
              style={{
                padding: "12px 22px", background: loading ? "#1a3a22" : "#00c030",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                color: "#000", fontWeight: 800, fontSize: "13px", fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.05em", transition: "background 0.2s",
              }}
            >
              {loading ? "..." : "GO"}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!hasSearched && (
          <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setQuery(s); search(s); }}
                style={{
                  background: "#181818", border: "1px solid #2a2a2a", color: "#888",
                  padding: "5px 14px", borderRadius: "20px", cursor: "pointer",
                  fontSize: "12px", fontFamily: "JetBrains Mono, monospace",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#00c030"; e.target.style.color = "#00c030"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: "700px", margin: "0 auto 24px", padding: "0 32px" }}>
          <div style={{ background: "#1a0a0a", border: "1px solid #c0302050", borderRadius: "8px", padding: "14px 18px", color: "#e86060", fontSize: "13px", fontFamily: "JetBrains Mono, monospace" }}>
            ⚠ {error}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px" }}>
            <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700 }}>
              Top 5 for <span style={{ color: "#00c030", fontStyle: "italic" }}>"{query}"</span>
            </h2>
            <span style={{ color: "#555", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
              from {totalFound} candidates
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "linear-gradient(to right, #00c030, transparent)", marginBottom: "28px", opacity: 0.4 }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "20px",
          }}>
            {results.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} rank={i + 1} onClick={m => setSelectedId(m.id)} />
            ))}
          </div>

          {/* Score legend */}
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "20px", justifyContent: "center" }}>
            <span style={{ color: "#444", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>MATCH SCORE:</span>
            {[["≥75%", "#00c030"], ["50–74%", "#e8b84b"], ["<50%", "#e84b4b"]].map(([label, c]) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666", fontFamily: "JetBrains Mono, monospace" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "inline-block" }} />{label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state after search */}
      {hasSearched && results.length === 0 && !loading && !error && (
        <div style={{ textAlign: "center", padding: "60px 32px", color: "#444" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px" }}>No movies found. Try a different search.</p>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ color: "#333", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", margin: 0 }}>
          cinematch · powered by{" "}
          <span style={{ color: "#00c030" }}>FastAPI + TMDB</span>
          {" "}· data from{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" style={{ color: "#00c030", textDecoration: "none" }}>TMDB</a>
        </p>
      </footer>

      {selectedId && <MovieDetailModal movieId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
