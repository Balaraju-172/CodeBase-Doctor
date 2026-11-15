# AI Codebase Doctor

A frontend-only developer dashboard built with React, Vite, Tailwind CSS, React Router, and Lucide icons. The app uses sample data; it does not connect to GitHub, a backend, or an AI service.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

From the repository root, enter the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build for production

Create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Main pages

- `/dashboard` — Dashboard and sample repositories
- `/connect` — Frontend-only GitHub URL format validation
- `/repositories/meridian-api` — Sample repository explorer
- `/chat` — Chat UI with canned sample responses
- `/bugs` — Sample bug reports and detail drawer

The dashboard is also available at `/`; unknown routes redirect there.

## Demo limitations

Repository data, code, activity, chat responses, and bug reports are static examples. Connecting a repository, running analysis, and AI features are not implemented.
