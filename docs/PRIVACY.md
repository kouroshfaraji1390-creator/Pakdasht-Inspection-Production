# Privacy / GPS Data Notes

The application handles employee identity, inspection records and location data. Production deployment must apply data minimization and a written retention policy.

## Data categories

- Account data: name, personnel code, mobile, username, role and organization.
- Operational data: shops, missions, inspections, warnings and audit events.
- Location data: mission start/end coordinates and track points collected while an inspector has an active mission.

## Principles

1. Collect location only for an active mission.
2. Do not expose one organization's records to another organization.
3. Keep location retention no longer than the approved operational/legal period.
4. Restrict database access to authorized service accounts.
5. Do not log passwords, bearer/session tokens or reset secrets.
6. Publish an employee tracking notice and obtain any required organizational/legal approval before deployment.

The codebase does not invent a legal retention period. The organization must approve the actual period and implement scheduled deletion/archival before Production.
