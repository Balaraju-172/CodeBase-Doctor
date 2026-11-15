# Backend

Minimal Express server for AI Codebase Doctor. The current backend provides only a health check; it does not connect to a database, GitHub, or an AI service.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

The server listens on port `3001` by default. Set the `PORT` environment variable to use another port.

## Health check

```http
GET http://localhost:3001/health
```

Successful response:

```json
{
  "status": "ok"
}
```

For a non-watch run, use `npm start`.
