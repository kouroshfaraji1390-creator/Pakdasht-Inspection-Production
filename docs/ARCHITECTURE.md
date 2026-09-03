# Architecture

```text
Inspector PWA
  ├─ Auth Session
  ├─ GPS Provider
  ├─ Map Provider
  ├─ IndexedDB/Sync Adapter
  └─ API Client
          ↓ HTTPS
Backend API
  ├─ Authentication
  ├─ Organization Authorization
  ├─ Mission Service
  ├─ Shop Service
  ├─ Inspection/Warning Service
  ├─ Tracking Service
  ├─ Report Service
  ├─ Audit Log
  └─ SSE Realtime
          ↓
Database Adapter
  ├─ Local SQLite (included)
  └─ PostgreSQL schema/adapter target
```

Frontend modules are intentionally separated by feature flow in the current no-dependency build. When production dependencies are introduced, split the UI into React/Vite feature modules without changing the API contracts.
