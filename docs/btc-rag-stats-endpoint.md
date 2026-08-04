# btc_rag: `GET /api/stats` endpoint (corpus metadata for the website)

The website's BitResearch page (`src/pages/Chat/CorpusStats.jsx`) fetches
`GET /api/stats` from the backend and shows exact corpus numbers. If the
endpoint is missing or unreachable it silently falls back to a hardcoded
snapshot, so this can be deployed independently.

Because the scraper delivers a fresh `pdf_metadata.csv` daily (~3 a.m.) and the
endpoint caches by the file's mtime, the numbers refresh automatically after
every harvest — no extra cron job needed.

## Expected response shape

```json
{
  "as_of": "2026-08-04",
  "papers": 3947,
  "researchers": 7412,
  "venues": 1004,
  "citations": 72840,
  "by_year": { "1938": 1, "2008": 52, "2025": 507, "2026": 245 }
}
```

Only `papers` and `by_year` are required by the frontend; the other headline
tiles keep their snapshot values if a field is missing.

## Drop-in code (add to btc_rag)

Save as `stats.py` next to the FastAPI app and register with
`app.include_router(stats.router)`. **Adjust `METADATA_CSV` and the column
names** (`year`, `authors`, `journal`/`venue`, `citations`) to match the real
header of `pdf_metadata.csv`.

```python
import csv
import os
from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter

# Path to the metadata file the scraper refreshes daily.
METADATA_CSV = os.environ.get("PDF_METADATA_CSV", "/data/corpus/pdf_metadata.csv")

# Split character(s) for multi-author cells — adjust to match the CSV.
AUTHOR_SEPARATOR = ";"

router = APIRouter()
_cache = {"mtime": None, "payload": None}


def _to_int(value):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _compute():
    papers = 0
    citations = 0
    by_year = Counter()
    researchers = set()
    venues = set()

    with open(METADATA_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            papers += 1

            year = _to_int(row.get("year"))
            if year:
                by_year[str(year)] += 1

            for author in (row.get("authors") or "").split(AUTHOR_SEPARATOR):
                author = author.strip().lower()
                if author:
                    researchers.add(author)

            venue = (row.get("journal") or row.get("venue") or "").strip().lower()
            if venue:
                venues.add(venue)

            citations += _to_int(row.get("citations")) or 0

    return {
        "as_of": datetime.fromtimestamp(
            os.path.getmtime(METADATA_CSV), tz=timezone.utc
        ).date().isoformat(),
        "papers": papers,
        "researchers": len(researchers),
        "venues": len(venues),
        "citations": citations,
        "by_year": dict(sorted(by_year.items())),
    }


@router.get("/api/stats")
def stats():
    mtime = os.path.getmtime(METADATA_CSV)
    if _cache["mtime"] != mtime:
        _cache["payload"] = _compute()
        _cache["mtime"] = mtime
    return _cache["payload"]
```

## Checklist

1. Copy the code into btc_rag, fix the CSV path and column names.
2. Confirm CORS: `/api/stats` must be allowed for the website origin (the same
   CORS middleware that already serves `/api/chat` covers it if it allows GET).
3. Verify: `curl https://bei-api.batchllm-workspace.info/api/stats` returns the
   JSON above with today's `as_of` after the next 3 a.m. harvest.
