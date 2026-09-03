# Production Checklist

## Completed in this build

- [x] Environment-based configuration
- [x] Demo seed disabled by default in production
- [x] Registration disabled by default in production
- [x] HttpOnly/SameSite session cookie; Secure in production
- [x] CORS allow-list
- [x] API/Auth rate limiting baseline
- [x] Request body size limit and JSON error handling
- [x] Security response headers
- [x] Service Worker static-only caching strategy
- [x] PWA manifest with 192/512 icons
- [x] Offline track queue retains mission ID across reload
- [x] Realtime client no longer puts auth token in EventSource URL
- [x] GPS coordinate/timestamp validation baseline
- [x] SQLite backup script
- [x] PostgreSQL schema + opt-in migration script
- [x] Documentation updated

## Still requires external infrastructure / approval

- [ ] Managed PostgreSQL provisioned and migration verified
- [ ] PostgreSQL automated backups + restore drill
- [ ] HTTPS reverse proxy/load balancer
- [ ] Production domain configured
- [ ] Secret manager configured
- [ ] Email/SMS password-reset provider configured
- [ ] Managed/WAF rate limiting for multi-instance deployment
- [ ] Production realtime scaling decision (SSE broker/provider if multiple instances)
- [ ] Map provider policy/capacity approved
- [ ] Real `.xlsx` dependency/service enabled if required
- [ ] Privacy policy and employee tracking notice approved
- [ ] GPS data retention period approved
- [ ] Audit log retention period approved
- [ ] Error tracking and monitoring enabled
- [ ] Organization isolation tests expanded
- [ ] Security review / penetration testing
- [ ] Android/iOS background tracking decision
- [ ] Device/browser compatibility matrix tested

## Known browser limitations

- Background GPS can be suspended/restricted by Android/iOS and browser lifecycle.
- New map tiles require network access.
- PWA installation and some background behaviors require HTTPS (localhost is allowed for local development).
- Offline server-authoritative writes are not automatically safe for every entity until an explicit queue/sync contract is implemented.
