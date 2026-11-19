# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Tests

```bash
npm test        # Vitest + Testing Library, in jsdom; no network
```

Run it, with `npm run lint` and `npm run build`, before pushing to `main`: a push
to `main` deploys the site, and the deploy workflow does not run the tests.

## BitResearch prototype (`/prototype`)

A demo page for the BitResearch grant application (`src/pages/Prototype/`):
questions over a corpus of 100 Bitcoin research papers, answered with
citations by an open-weight model on our own GPU. It shows the chat (Quick and
Deep modes, numbered citation chips that open the sources, follow-up
questions, thumbs feedback), example questions, how it works, the benchmark,
the corpus figures and a browser of the 100 papers (linked, never hosted).
Like `/BitResearch`, it is reachable by direct link only: it is not in the
header menu, it sets `noindex`, and `public/robots.txt` disallows it.

It has its own API, never the production one. The base is
`VITE_PROTOTYPE_API_URL` (default `https://prototype-api.batchllm-workspace.info`);
an empty value, or one naming the production API, falls back to that default
(`src/config/prototypeApi.js`). The API serves `GET /api/health`
(`model_label`), `/api/stats`, `/api/papers`, `/api/benchmark` (the panel is
left out on a 404), and `POST /api/chat` (SSE) and `/api/feedback`, in the
same shapes as the `/BitResearch` chat.

The chat is `/BitResearch`'s own components, given options (the API base, the
conversation store, chips that open the sources panel, no PDF chip). Their
defaults are what `/BitResearch` has always done, so a change there shows on
both pages. The example questions are in `src/pages/Prototype/examples.js`.

To preview against a local API with no CORS set-up, use the dev (or preview)
proxy, which forwards `/prototype-api/*` to `VITE_DEV_PROTOTYPE_API_TARGET`
(default `http://localhost:8620`):

```bash
VITE_PROTOTYPE_API_URL=/prototype-api npm run dev          # then open /prototype
VITE_PROTOTYPE_API_URL=/prototype-api npm run build && npm run preview
```

## Conference page (`/conference`)

One page for every conference year (`src/pages/Conference/Conference.jsx`).
It shows 2027 unless the address asks for another year
(`/conference?year=2026`); the year switch at the top of the page changes it.
Each year's content is its own file (`Conference2027.jsx`,
`Conference2026.jsx`). To add a year, add its file and a line to `YEARS` in
`Conference.jsx`, and change `DEFAULT_YEAR` when it becomes the coming one.
The old addresses `/conference-2026` and `/conference-2027` still work: they
lead to this page.

## Faculty pages (`/faculty`, `/faculty/portal`)

`src/pages/Faculty/` holds two pages:

- **`/faculty`** (`Faculty.jsx`), public: Faculty Affiliates. A row for each
  person (headshot, name, title, organisation, and their bio, written in the
  third person in one professional voice, never the first; a long one shows
  four lines and "Read more"), with search and an area filter (`People.jsx`,
  which the Portal's Speakers tab uses too). The bios come from the backend's
  roster (`docs/FACULTY.md` in `btc_rag`).
- **`/faculty/portal`** (`Portal.jsx`), for faculty only. A person enters the
  one password BEI shares with all faculty, then has two tabs: **Course
  Materials** (browse the folders and download files) and **Speakers**
  (`/faculty/portal?tab=speakers`, the conference speakers). The page carries
  `noindex` and is disallowed in `public/robots.txt`.

The Speakers tab shows the speakers as a **List** or on a **Map**
(`/faculty/portal?tab=speakers&view=map`; the switch is at the end of the
count line). The map (`SpeakerMap.jsx`, with the grouping in
`speakerPlaces.js`) is a map of the United States, drawn like an atlas plate
in the brand's navy and gold, with a gold pin for each place, sized by its
number of speakers (a plain dot is one), and the names of the bigger places
beside their pins. Beside it, as tall as the map, a panel lists every place
with a bar for its share; choosing a place, by its pin or in the panel, lists
its speakers there, and pointing at a place in either lights it in the other.
The search and area filter apply to both views and keep what was typed when
the view changes. Places so close that their pins would cover each other share
a pin (more of them on a phone). A place outside the United States, and speakers
whose place is not known, are in the panel and in the note under the map.
Where each place is arrives with the speakers: the backend adds each one's
`lat` and `lon` from its `places.csv` (see `docs/FACULTY.md` in `btc_rag`), so
a new speaker from a new place needs a line there, or they are listed under
"Place not known". The map's code, d3-geo and the state outlines (`us-atlas`)
load only when the map is opened.

Both are built from the site's own parts (the gold and outlined buttons, and
the bordered panel of rows the 2026 agenda uses), so they look like the rest
of the site. If those parts are restyled,
restyle these pages with them. Their top is a one-line title row, not the tall
`Hero` band other pages open with: the owner asked for it to take less space.

Both are served by the backend (the same API the BitResearch chat uses;
`faculty.py` and `docs/FACULTY.md` in the `btc_rag` project). That is where
people and speakers are added, photos replaced, materials changed and the
password set.

**None of the data is in this repository, and none may be added.** This
repository is public. The directory, the headshots, the logos, the folder
listing, the files and the speaker list (with where each speaker is) all
arrive from the backend at run time, and the Portal's only for a signed-in person. The tests use made-up
people, passwords and files.

"Faculty" is in the header menu. `Header.module.css` uses a 1.5rem gap and
hands over to the hamburger below 1000px, set when the menu had nine links
(it has eight since the two conference links became one). In local dev (`npm run dev`)
the pages' API calls go through the Vite proxy like the chat's; see
`vite.config.js`.
