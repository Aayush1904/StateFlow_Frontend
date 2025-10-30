## Stateflow — Frontend (Client)

A modern React + Vite + TypeScript client for Stateflow (team knowledge, pages, tasks, collaboration).

### Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v7
- TanStack Query for data fetching/caching
- TipTap editor with comments, collaboration cursors, tables, tasks, images
- Socket.IO for realtime presence, activity and collaboration
- Zustand for light client state

### Requirements

- Node.js 18+ (recommended LTS)
- A running backend API (see `../backend`)

### Environment Variables

Create `client/.env` with at least:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_URL=http://localhost:8000
# Optional (for Google Sign-In buttons that need the client id in the web):
# VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

Used in code:

- `VITE_API_BASE_URL` → Axios base URL (`src/lib/axios-client.ts`, `src/lib/base-url.ts`)
- `VITE_API_URL` → Socket.IO connections (`src/hooks/use-collaboration.ts`, `src/context/notification-provider.tsx`, `src/components/workspace/activity-feed.tsx`)

### Install & Run

```
pnpm i      # or npm i / yarn
pnpm dev    # starts Vite on http://localhost:5173
```

### Build & Preview

```
pnpm build
pnpm preview  # serves the built app for local testing
```

### Lint

```
pnpm lint
```

### Project Structure (high level)

```
src/
  components/            # UI and feature components
  context/               # Providers (auth, notifications, etc.)
  hooks/                 # Custom hooks
  lib/                   # API clients, helpers
  page/                  # Routed pages (auth, invite, workspace pages)
  routes/                # Route definitions
  assets/, public/       # Static assets (public serves `/Logo.png`)
```

Key editors and pages:

- `components/workspace/page/page-editor.tsx` — page editing UI
- `components/workspace/editor/*` — rich text editor and sub-features

### Branding & Logo

- Logo component: `src/components/logo/index.tsx`
- Default image: `public/Logo.png` (already wired). Replace the PNG to change logo.
- App title: `index.html` (`<title>Stateflow | B2B Project Management Platform</title>`)

### Collaboration

The client opens Socket.IO connections to `VITE_API_URL` for:

- Collaborative editing cursors
- Activity feed and notifications

### Troubleshooting

- If the consent screen shows an old app name when signing in with Google, update the OAuth Consent Screen in Google Cloud Console (not in code).
- CORS/socket issues: ensure backend `CLIENT_URL`/.env values point to `http://localhost:5173` during local dev.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
