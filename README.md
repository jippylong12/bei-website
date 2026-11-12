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
  person (headshot, name, title, organisation), with search and an area filter
  (`People.jsx`, which the Portal's Speakers tab uses too).
- **`/faculty/portal`** (`Portal.jsx`), for faculty only. A person enters the
  one password BEI shares with all faculty, then has two tabs: **Course
  Materials** (browse the folders and download files) and **Speakers**
  (`/faculty/portal?tab=speakers`, the conference speakers). The page carries
  `noindex` and is disallowed in `public/robots.txt`.

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
listing, the files and the speaker list all arrive from the backend at run
time, and the Portal's only for a signed-in person. The tests use made-up
people, passwords and files.

"Faculty" is in the header menu. `Header.module.css` uses a 1.5rem gap and
hands over to the hamburger below 1000px, set when the menu had nine links
(it has eight since the two conference links became one). In local dev (`npm run dev`)
the pages' API calls go through the Vite proxy like the chat's; see
`vite.config.js`.
