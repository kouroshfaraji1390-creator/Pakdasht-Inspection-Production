# Backend

Node.js HTTP API for Pakdasht Inspection.

## Local

```bash
npm install
npm test
npm start
```

## Production

Run behind an HTTPS reverse proxy. Configure `NODE_ENV=production`, an exact `APP_ORIGIN`, `DEMO_MODE=false`, and `ALLOW_REGISTRATION=false`. Use PostgreSQL for multi-instance/production deployments.

The API accepts authenticated requests through the HttpOnly `session_token` cookie or a Bearer token for API clients. The browser app uses the cookie and does not persist the session token in localStorage.

SSE remains available at `/api/sse`; the browser client consumes it through `fetch()` streaming so an Authorization header can be used without putting credentials in the URL.
