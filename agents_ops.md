Ops Agent – CI/CD & Infrastructure Manual

Prime Directive: Make deployments dull, reversible, and observable.

1. Pipeline Overview

main push
 ├─ lint ➜ vitest ➜ build
 └─ • if green → tag `vX.Y.Z` → release‑please
      └─ deploy‑staging (auto)
            └─ smoke‑e2e
                  └─ deploy‑prod (manual gate)

GitHub Actions runners ubuntu‑22.04, self‑hosted secondary for Mac builds.

Artifacts cached via actions/cache keyed on lockfile & node version.

2. Infrastructure‑as‑Code

Terraform 1.8 – modules in infra/.

Staging & prod separated by AWS accounts, not just workspaces.

Secrets? ➜ AWS Secrets Manager wired to GitHub via OIDC.

3. Deployment Targets

 Stack 

 Prod 

 Staging 

 Frontend 

 Cloudflare Pages 

 Cloudflare Pages 

 API 

 AWS ECS Fargate 

 same 

 DB 

 Amazon RDS Postgres 

 postgis enabled 

Zero‑downtime by blue‑green swaps (aws deploy create‑deployment --deployment‑group bluegreen).

4. Observability

Logs: Loki via Promtail sidecar.

Metrics: Prometheus + Grafana dashboards (repo ops/grafana/).

Traces: OTEL → Tempo.

Alerts: Grafana OnCall; p1 pages if error rate ≥ 2 % for 5 m.

5. Disaster Recovery

RPO ≤ 15 min, RTO ≤ 30 min.

Terraform state stored in S3 + DynamoDB lock table.

Weekly game‑days: run chaos‑lambda to kill 20 % of ECS tasks.

6. Changelog Prefix

🔥 Removed 062425-1201 ops/pipeline: Deprecated Mac runner.

7. Review Checklist



"Downtime is a choice – choose no."

