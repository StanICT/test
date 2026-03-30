from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from typing import List, Optional
import math

app = FastAPI(title="Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using TMDB API - free tier, no key needed for basic search via proxy
# Falls back to mock data if API unavailable
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

# TMDB API key (public demo key for read-only access)
TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8"  # public demo key

class MovieResult(BaseModel):
    id: int
    title: str
    overview: str
    poster_path: Optional[str]
    release_date: Optional[str]
    vote_average: float
    vote_count: int
    genre_ids: List[int]
    popularity: float
    score: Optional[float] = None  # recommendation score

class RecommendationResponse(BaseModel):
    query: str
    recommendations: List[MovieResult]
    total_found: int

def fetch_tmdb(endpoint: str, params: dict = {}):
    params["api_key"] = TMDB_API_KEY
    try:
        r = requests.get(f"{TMDB_BASE}/{endpoint}", params=params, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return None

def compute_recommendation_score(movie: dict, query_keywords: List[str], search_results: List[dict]) -> float:
    """
    Recommendation algorithm:
    - Base score from TMDB popularity + vote average
    - Keyword match boost in title/overview
    - Penalize very old movies slightly unless well-rated
    - Normalize against search results pool
    """
    title = (movie.get("title") or "").lower()
    overview = (movie.get("overview") or "").lower()
    vote_avg = movie.get("vote_average", 0) or 0
    vote_count = movie.get("vote_count", 0) or 0
    popularity = movie.get("popularity", 0) or 0
    release_date = movie.get("release_date") or ""
    year = int(release_date[:4]) if release_date and len(release_date) >= 4 else 2000

    # Weighted vote score (Bayesian average with min 100 votes)
    C = 7.0  # assumed mean vote
    m = 100   # minimum votes required
    vote_score = (vote_count / (vote_count + m)) * vote_avg + (m / (vote_count + m)) * C

    # Keyword match boost
    keyword_boost = 0
    for kw in query_keywords:
        if kw in title:
            keyword_boost += 3.0
        if kw in overview:
            keyword_boost += 1.0

    # Recency factor: slight boost for post-2000 films
    recency = 1.0 + max(0, (year - 1990) / 100)

    # Log-scale popularity (prevents mega-blockbusters dominating)
    pop_score = math.log1p(popularity) * 0.5

    final_score = (vote_score * 2.5) + (pop_score) + keyword_boost + recency

    return round(final_score, 3)

@app.get("/")
def root():
    return {"message": "Movie Recommender API is running"}

@app.get("/recommend", response_model=RecommendationResponse)
def get_recommendations(q: str, limit: int = 5):
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query too short")

    query_keywords = [w.lower() for w in q.strip().split() if len(w) > 2]

    # Search TMDB
    data = fetch_tmdb("search/movie", {"query": q, "include_adult": "false", "page": 1})

    if not data or not data.get("results"):
        raise HTTPException(status_code=404, detail="No movies found for that query")

    results = data["results"]

    # Also fetch page 2 for more candidates
    data2 = fetch_tmdb("search/movie", {"query": q, "include_adult": "false", "page": 2})
    if data2 and data2.get("results"):
        results += data2["results"]

    # Filter out movies with no overview or poster
    results = [m for m in results if m.get("overview") and m.get("poster_path")]

    # Score each movie
    for movie in results:
        movie["score"] = compute_recommendation_score(movie, query_keywords, results)

    # Sort by score descending
    results.sort(key=lambda x: x.get("score", 0), reverse=True)

    # Take top N
    top = results[:limit]

    recommendations = []
    for m in top:
        poster = f"{TMDB_IMAGE_BASE}{m['poster_path']}" if m.get("poster_path") else None
        recommendations.append(MovieResult(
            id=m["id"],
            title=m.get("title", "Unknown"),
            overview=m.get("overview", ""),
            poster_path=poster,
            release_date=m.get("release_date"),
            vote_average=m.get("vote_average", 0),
            vote_count=m.get("vote_count", 0),
            genre_ids=m.get("genre_ids", []),
            popularity=m.get("popularity", 0),
            score=m.get("score"),
        ))

    return RecommendationResponse(
        query=q,
        recommendations=recommendations,
        total_found=len(results),
    )

@app.get("/movie/{movie_id}")
def get_movie_detail(movie_id: int):
    data = fetch_tmdb(f"movie/{movie_id}", {"append_to_response": "credits,similar"})
    if not data:
        raise HTTPException(status_code=404, detail="Movie not found")

    poster = f"{TMDB_IMAGE_BASE}{data['poster_path']}" if data.get("poster_path") else None
    backdrop = f"https://image.tmdb.org/t/p/original{data['backdrop_path']}" if data.get("backdrop_path") else None

    cast = []
    if data.get("credits") and data["credits"].get("cast"):
        cast = [
            {"name": c["name"], "character": c.get("character", ""), "profile_path": f"https://image.tmdb.org/t/p/w185{c['profile_path']}" if c.get("profile_path") else None}
            for c in data["credits"]["cast"][:6]
        ]

    return {
        "id": data["id"],
        "title": data.get("title"),
        "tagline": data.get("tagline"),
        "overview": data.get("overview"),
        "poster_path": poster,
        "backdrop_path": backdrop,
        "release_date": data.get("release_date"),
        "runtime": data.get("runtime"),
        "vote_average": data.get("vote_average"),
        "vote_count": data.get("vote_count"),
        "genres": [g["name"] for g in data.get("genres", [])],
        "cast": cast,
        "director": next(
            (c["name"] for c in data.get("credits", {}).get("crew", []) if c.get("job") == "Director"),
            None
        ),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
