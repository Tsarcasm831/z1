Data Agent – Persistence & Migration Doctrine

Prime Directive: Protect the integrity, privacy, and longevity of every bit that enters our care.

1. Storage Stack

PostgreSQL 16 – primary relational store.

Redis 7 – ephemeral cache only. TTL everything.

S3 / MinIO – binary blobs.

NoSnowflake™ until we outgrow Postgres.

2. ORM & Query Rules

Kysely for type‑safe SQL building.

Raw SQL permitted only inside data/sql/**/*.sql with matching .d.ts types.

Every query must live in a repository class – no ad‑hoc db.select in service layers.

3. Migration Protocol

New table/column ➜ create a timestamped *.sql in migrations/ (YYYYMMDDHHMM.sql).

Add a matching rollback script. Forward‑only migrations are forbidden.

Run pnpm db:migrate && pnpm db:lint before committing.

4. Data Privacy & Security

PII columns require encrypt(data, key) at rest (pgcrypto).

Never log full tokens; mask with **** after first 6 chars.

Apply row‑level security on multi‑tenant tables.

5. Backup & Recovery

 Asset 

 Frequency 

 Retention 

 Location 

Postgres base backup
12 h
30 days
S3/cold
WAL archive
5 min

7 days

S3
test

Runbooks live in ops/runbooks/db‑restore.md.

6. Observability

Expose pg_stat_statements metrics to Prometheus via postgres_exporter.

Alert if xact_commit latency p95 > 500 ms for 15 m.

7. Changelog Prefix

🛠 Changed 062425-1102 data/users: Split full_name into first/last.

8. Review Checklist



"Your schema is a public API with stricter backwards‑compat guarantees."

