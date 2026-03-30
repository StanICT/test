# 🎬 CineMatch — Movie Recommendation App

Letterboxd-inspired movie recommender with a React frontend and FastAPI backend.

## Tech Stack
- **Frontend**: React (Vite), CSS-in-JS
- **Backend**: FastAPI (Python), TMDB API
- **Algorithm**: Bayesian weighted rating + keyword matching + recency score

---

## Setup

### Backend (Python / FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
# Server starts at http://localhost:8000
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend (React / Vite)

```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

---

## How the Recommendation Algorithm Works

Each movie is scored using:

1. **Bayesian Average** — Weighted vote score that penalizes movies with few votes
2. **Keyword Match Boost** — Title/overview matches boost the score
3. **Log Popularity** — Prevents mega-blockbusters from always dominating
4. **Recency Factor** — Slight boost for post-1990 films

Top 5 results are returned, ranked by this composite score.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommend?q=inception&limit=5` | Get top 5 recommendations |
| GET | `/movie/{id}` | Get full movie details with cast |

---

## Features
- 🔍 Search any movie, genre, or mood
- 🏆 Top 5 ranked recommendations with match % badges
- ⭐ Star ratings from TMDB
- 🎭 Genre tags, cast info, director
- 🖼 Movie detail modal with backdrop image
- 💡 Quick-search suggestions
