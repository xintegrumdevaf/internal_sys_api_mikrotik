# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-10-28

### Added
- **Encrypted Network Topology Vault**: Migrated static credentials to database-persisted entities (`NetworkRouter`, `NetworkOlt`) encrypted with **AES-256-GCM** via \`VaultService\`.
- **Database Migrations via Prisma**: Added migration \`20261028195753_network_topology_vault\` for router and OLT schema persistence.
- **Network Administration REST API**: Endpoints under \`/api/network/routers\` and \`/api/network/olts\` for CRUD operations, connectivity tests, and secure credential handling.
- **Enriched Diagnostic Telemetry**: Retained CLI execution traces, failed step indicators, and optical power metrics (Rx/Tx dBm) in OLT diagnostic payloads.

### Fixed
- **Hardcoded Plaintext Credentials**:
  - *Damage*: Router and OLT IP addresses, ports, usernames, and passwords were exposed in static files (\`sectors.ts\`) within the source code. Modifying network infrastructure required code changes and redeployments.
  - *Root Cause*: Lack of database-driven network topology and cryptographic secret management.
  - *Resolution*: Implemented AES-256-GCM vault with \`NETWORK_VAULT_KEY\` and database models.
- **Silent Diagnostic Failures**:
  - *Damage*: When telnet/SSH failed during ONT activation or status checking, controllers returned generic 500 errors without step context.
  - *Resolution*: Preserved \`_history\` traces and command output in responses.
