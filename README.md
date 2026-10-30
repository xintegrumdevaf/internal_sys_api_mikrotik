# ISP MikroTik & OLT Management Service

Microservice providing automated provisioning, diagnostics, and telemetry for ISP network infrastructure, supporting **MikroTik RouterOS** (via RouterOS API & SSH) and **OLTs (Huawei, V-Sol, C-Data, Kingtype)** (via Telnet/CLI). Consumed by the **ISP Core API** (`internal_sys_comunication_backend`) and **n8n** automation workflows.

---

## 1. Architectural Overview & Security Vault

- **Runtime & Framework**: Node.js 22 + TypeScript + Express.
- **ORM & Database**: Prisma ORM with PostgreSQL.
- **Cryptographic Security Vault (`VaultService`)**:
  - Sensitive infrastructure credentials (router and OLT passwords) are encrypted at rest using **AES-256-GCM**.
  - Symmetric 256-bit encryption keys are derived from the `NETWORK_VAULT_KEY` environment variable.
  - Automatic cipher authentication tag validation prevents tampering.
- **Protocol Adapters**:
  - `RouterOS API`: Querying DHCP leases, PPP active sessions, and queues.
  - `V-Sol OLT Adapter`: ONT provisioning, status queries, optical signal telemetry (Rx/Tx dBm), and automated reboot workflows.

---

## 2. CI/CD & Deployment Guide (Test & Production)

Deployments are automated through **GitHub Actions** and **Coolify**.

### Pipeline Workflow (`.github/workflows/deploy.yml`)

```mermaid
flowchart TD
    A[Push / Merge to Branch] --> B{Branch?}
    B -->|test| C[CI Validation: Prisma Generate + Build]
    B -->|main| C
    C --> D{Success?}
    D -->|Yes & test| E[Trigger COOLIFY_WEBHOOK_URL_TEST]
    D -->|Yes & main| F[Trigger COOLIFY_WEBHOOK_URL_MAIN]
    E --> G[Coolify Staging Pull & Docker Build]
    F --> H[Coolify Production Pull & Docker Build]
    G --> I[Auto-Migrate Prisma + Start Express on Port 3001]
    H --> J[Auto-Migrate Prisma + Start Express on Port 3001]
```

### Steps to Deploy

#### Deploying to Test (Staging)
1. Merge your changes into `develop` or submit a Pull Request to `test`.
2. Push or merge into `test`:
   ```bash
   git checkout test
   git pull origin test
   git merge feature/your-feature-branch
   git push origin test
   ```
3. GitHub Actions executes:
   - `pnpm install --frozen-lockfile`
   - `pnpm prisma generate`
   - `pnpm run build`
   - Dispatches webhook to Coolify with `Authorization: Bearer $COOLIFY_API_TOKEN`.
4. Coolify starts the container executing `CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm run start"]`.

#### Deploying to Production (Prod)
1. Verify behavior in the staging environment.
2. Create a Pull Request from `test` into `main`.
3. Merge and push to `main`:
   ```bash
   git checkout main
   git pull origin main
   git merge test
   git push origin main
   ```
4. GitHub Actions verifies the build and triggers the production deployment webhook.

---

## 3. Database Migrations & Environment Variables

### Mandatory Environment Variables
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/isp_platform?schema=public

# CRITICAL: 64-character hex key (or 32-byte secret) used for AES-256-GCM encryption
NETWORK_VAULT_KEY=your_secret_32_byte_hex_key_here
```

> [!WARNING]
> If `NETWORK_VAULT_KEY` changes or is missing, previously stored router/OLT credentials cannot be decrypted, causing network diagnostic actions to fail. Back up this key securely.

### Running Migrations Manually
```bash
# In local development
pnpm prisma migrate dev

# In staging/production environments
pnpm prisma migrate deploy
```

---

## 4. Production Operations & Fixes Log (2026-10-28)

### 1. Hardcoded Credentials Elimination & Network Vault Migration
- **El Daño (Damage)**: Router and OLT credentials were hardcoded in plain text inside `src/config/sectors.ts`. Modifying an OLT password or adding a new sector required modifying source code and redeploying the service.
- **El Porqué (Root Cause)**: The service was originally prototyped with static configuration files rather than dynamic database persistence.
- **La Solución (Fix)**:
  - Created Prisma models `NetworkRouter` and `NetworkOlt` with migration `20261028195753_network_topology_vault`.
  - Built `VaultService` implementing AES-256-GCM encryption and decryption.
  - Exposed REST CRUD endpoints at `/api/network/routers` and `/api/network/olts` with credential masking on read operations.

### 2. OLT Diagnostic Telemetry & CLI History Preservation
- **El Daño (Damage)**: When an ONT query or optical diagnostic failed, the controller returned a generic 500 status code, discarding terminal outputs and step history.
- **El Porqué (Root Cause)**: Telnet command execution failures were swallowed into simple error strings.
- **La Solución (Fix)**:
  - Preserved `_history` execution milestones, `failedStep` markers, and raw CLI command responses within diagnostic output payloads.

---

## 5. Development & Testing Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run development server with watch mode
pnpm run dev

# Compile TypeScript
pnpm run build

# Deploy migrations
pnpm prisma migrate deploy
```
