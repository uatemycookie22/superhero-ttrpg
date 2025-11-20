# Deploying

## Overview

The application is deployed to **AWS Lightsail** using **Docker containers**. GitHub Actions automatically builds and deploys on every push to `main`.

**Deployment Flow:**
1. Push to `main` branch
2. GitHub Actions builds Docker image
3. Image pushed to AWS ECR (Elastic Container Registry)
4. Lightsail instance pulls new image
5. Container restarts with new code
6. Migrations run automatically on startup

---

## Infrastructure

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Route 53 (DNS)     │
              │ callingallheroes.net │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Lightsail Instance  │
              │   18.215.116.116     │
              │  ┌────────────────┐  │
              │  │  Caddy Proxy   │  │
              │  │  (HTTPS/SSL)   │  │
              │  └────────┬───────┘  │
              │           │          │
              │  ┌────────▼───────┐  │
              │  │ Docker Container│ │
              │  │   Port 3000    │  │
              │  └────────────────┘  │
              │           │          │
              │  ┌────────▼───────┐  │
              │  │ Block Storage  │  │
              │  │  /data/sqlite  │  │
              │  │  (Database)    │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

### DNS (Route 53)

**Domain**: `callingallheroes.net`

**Records:**
- **A Record**: `callingallheroes.net` → `18.215.116.116`
- **CNAME**: `www.callingallheroes.net` → `callingallheroes.net`

**Configuration:**
- Managed in AWS Route 53
- Points to Lightsail instance static IP
- TTL: 300 seconds (5 minutes)

### Lightsail Instance

**Instance Details:**
- **Type**: Virtual Private Server (VPS)
- **IP**: `18.215.116.116` (static)
- **OS**: Ubuntu 22.04 LTS
- **Region**: `us-east-1` (N. Virginia)
- **Plan**: 2 GB RAM, 1 vCPU, 60 GB SSD

**Installed Software:**
- Docker Engine
- Docker Compose
- AWS CLI (for ECR authentication)
- Caddy (reverse proxy)

**Networking:**
- Port 80 (HTTP) → Redirects to HTTPS
- Port 443 (HTTPS) → Caddy → Docker container (3000)
- Port 22 (SSH) → GitHub Actions deployment

### Block Storage

**Volume Details:**
- **Size**: 8 GB
- **Mount Point**: `/data/sqlite`
- **Purpose**: Persistent SQLite database storage
- **Attached To**: Lightsail instance

**Database Location:**
```
Host: /data/sqlite/app-data/superhero-ttrpg.db
Container: /app/data/superhero-ttrpg.db (via volume mount)
```

**Benefits:**
- Data persists across container restarts
- Survives instance reboots
- Can be detached and attached to new instances
- Separate from instance root volume (easier backups)

> [!IMPORTANT]
> Block storage must be mounted before starting the Docker container. Unmounting while container is running will cause database errors.

### Container Registry (ECR)

**Repository**: `814155132173.dkr.ecr.us-east-1.amazonaws.com/superhero-ttrpg-ecr-repo`

**Image Tags:**
- `latest` - Most recent deployment
- `<commit-sha>` - Specific commit version (for rollbacks)

**Authentication:**
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 814155132173.dkr.ecr.us-east-1.amazonaws.com
```

### Reverse Proxy (Caddy)

**Configuration** (`/etc/caddy/Caddyfile`):
```
callingallheroes.net {
    reverse_proxy localhost:3000
    encode gzip
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
    }
}
```

**Features:**
- Automatic HTTPS with Let's Encrypt
- HTTP → HTTPS redirect
- Gzip compression
- Security headers

### Future Enhancements

**Planned Infrastructure Changes:**

1. **Amazon S3**
   - Store character images/assets
   - Reduce container storage needs
   - Enable CDN distribution

2. **CloudFront CDN**
   - Cache static assets globally
   - Reduce latency for international users
   - Offload traffic from Lightsail

3. **Managed Database**
   - Amazon RDS (PostgreSQL) or Aurora Serverless
   - Better scalability and backups
   - Multi-AZ redundancy
   - Automated failover

4. **Load Balancer**
   - Application Load Balancer (ALB)
   - Multiple Lightsail instances
   - Auto-scaling based on traffic

5. **Monitoring**
   - CloudWatch metrics and alarms
   - Application performance monitoring
   - Database query analytics

> [!NOTE]
> Current architecture is optimized for low cost and simplicity. Future enhancements will improve scalability and reliability as user base grows.

---

## Production Configuration

### Environment Detection

The app detects production mode via `NODE_ENV`:

```javascript
// Set in Dockerfile
ENV NODE_ENV=production
```

### Next.js Configuration

**File**: `next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  output: 'standalone',              // Minimal production build
  serverExternalPackages: ['better-sqlite3'], // Exclude from bundle
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
};
```

**Key Settings:**
- `output: 'standalone'` - Creates minimal production build (~50MB vs ~500MB)
- `serverExternalPackages` - Excludes native modules from bundling
- `cacheComponents` - Enables React component caching

### Environment Variables

**Production** (`.env.production` on server):
```env
DATABASE_PATH=/app/data/superhero-ttrpg.db
NEXT_PUBLIC_WS_URL=https://callingallheroes.net
NODE_ENV=production
```

**Development** (`.env.local`):
```env
DATABASE_PATH=./data/superhero-ttrpg.db
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

> [!IMPORTANT]
> `NEXT_PUBLIC_*` variables are embedded at build time. Changing them requires rebuilding the Docker image.

---

## Dockerfile

### Multi-Stage Build

The Dockerfile uses 3 stages to minimize final image size:

#### Stage 1: Dependencies (`deps`)

```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
```

**Purpose:**
- Install Node.js dependencies
- Include build tools for native modules (`better-sqlite3`)

#### Stage 2: Builder (`builder`)

```dockerfile
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

**Purpose:**
- Build Next.js application
- Generate standalone output
- Compile TypeScript

#### Stage 3: Runner (`runner`)

```dockerfile
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./src/db/migrations

USER nextjs
EXPOSE 3000
ENV DATABASE_PATH="/app/data/superhero-ttrpg.db"
CMD ["node", "server.js"]
```

**Purpose:**
- Create minimal production image
- Run as non-root user (`nextjs`)
- Copy only necessary files
- Include migration files for runtime execution

> [!NOTE]
> Final image size: ~200MB (vs ~1GB without multi-stage build)

### Key Features

**Native Module Compilation:**
```dockerfile
RUN apk add --no-cache libc6-compat python3 make g++
```
Required for `better-sqlite3` to compile on Alpine Linux.

**Migration Files:**
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./src/db/migrations
```
Migrations must be included in the image to run on container startup.

**Data Directory:**
```dockerfile
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
```
Pre-create directory with correct permissions for SQLite database.

---

## Docker Compose

### Production Configuration

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  app:
    image: 814155132173.dkr.ecr.us-east-1.amazonaws.com/superhero-ttrpg-ecr-repo:latest
    env_file:
      - .env.production
    volumes:
      - /data/sqlite/app-data:/app/data
    restart: always
    network_mode: host
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Configuration Details:**

| Setting | Value | Purpose |
|---------|-------|---------|
| `image` | ECR repository URL | Pull from AWS ECR |
| `env_file` | `.env.production` | Load production environment variables |
| `volumes` | `/data/sqlite/app-data:/app/data` | Persist database on host |
| `restart` | `always` | Auto-restart on failure |
| `network_mode` | `host` | Use host networking (port 3000) |
| `logging` | JSON with rotation | Limit log file size |

> [!WARNING]
> The volume mount path must exist on the host before starting the container.

---

## Database on Deployment

### Container Startup Sequence

1. **Container starts** → `node server.js` executes
2. **Instrumentation hook runs** → `src/instrumentation.ts`
3. **Database initialized** → `src/db/client.ts` creates connection
4. **Migrations execute** → Drizzle applies pending migrations
5. **Cleanup runs** → Deletes characters not accessed in 30+ days
6. **App serves requests** → Next.js server ready

**Logs:**
```
[Database] Initializing SQLite database at: /app/data/superhero-ttrpg.db
[Instrumentation] Running migrations...
[Instrumentation] Migrations complete
[Instrumentation] Cleaning up stale characters...
[Instrumentation] Deleted 0 stale character(s)
✓ Ready in 250ms
```

### Database Persistence

**Volume Mount:**
```
Host: /data/sqlite/app-data/superhero-ttrpg.db
Container: /app/data/superhero-ttrpg.db
```

**Behavior:**
- Database file persists across container restarts
- New deployments reuse existing database
- Migrations only apply changes (idempotent)
- No data loss on deployment

> [!IMPORTANT]
> If the database file doesn't exist, it's created automatically with all migrations applied.

### Migration Safety

**Idempotent Migrations:**
- Drizzle tracks applied migrations in `__drizzle_migrations` table
- Already-applied migrations are skipped
- Safe to restart container multiple times

**Rollback:**
- SQLite doesn't support `ALTER TABLE DROP COLUMN`
- Destructive migrations cannot be rolled back
- Always test migrations in development first

---

## GitHub Actions Workflow

### Trigger

**File**: `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches: ["main"]
  workflow_dispatch: # Manual trigger
```

Deploys automatically on every push to `main` branch.

### Build Process

```yaml
- name: Build and push to ECR
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: |
      ${{ steps.login-ecr.outputs.registry }}/superhero-ttrpg-ecr-repo:latest
      ${{ steps.login-ecr.outputs.registry }}/superhero-ttrpg-ecr-repo:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Features:**
- Builds Docker image on GitHub runners
- Pushes to AWS ECR with two tags: `latest` and commit SHA
- Uses GitHub Actions cache for faster builds

### Deployment Process

```yaml
- name: Deploy to Instance
  run: |
    ssh ubuntu@${{ env.INSTANCE_IP }} << 'ENDSSH'
      cd /opt/dnd-app
      
      # Download latest docker-compose.prod.yml
      curl -sSL -o docker-compose.prod.yml \
        https://raw.githubusercontent.com/user/repo/${{ github.sha }}/docker-compose.prod.yml
      
      # Login to ECR
      aws ecr get-login-password --region us-east-1 | \
        docker login --username AWS --password-stdin 814155132173.dkr.ecr.us-east-1.amazonaws.com
      
      # Pull and restart
      docker compose -f docker-compose.prod.yml pull
      docker compose -f docker-compose.prod.yml up -d --force-recreate
      
      # Cleanup
      docker image prune -a -f
    ENDSSH
```

**Steps:**
1. SSH into Lightsail instance
2. Download latest `docker-compose.prod.yml`
3. Login to ECR
4. Pull new image
5. Recreate container (triggers migrations)
6. Remove old images

### Verification

```yaml
- name: Verify Deployment
  run: |
    sleep 10
    curl -f -m 10 "https://callingallheroes.net/api/health"
```

Checks health endpoint to confirm deployment success.

---

## Manual Deployment

### Build Image Locally

```bash
# Build for production
docker build -t superhero-ttrpg .

# Build for specific platform (e.g., ARM64 server)
docker buildx build --platform linux/amd64 -t superhero-ttrpg --load .
```

### Run Locally

```bash
docker run -d \
  --name superhero-ttrpg \
  -p 3000:3000 \
  -v /tmp/ttrpg-data:/app/data \
  superhero-ttrpg
```

### Deploy to Server

```bash
# Save image
docker save superhero-ttrpg | gzip > superhero-ttrpg.tar.gz

# Copy to server
scp superhero-ttrpg.tar.gz user@server:/tmp/

# Load on server
ssh user@server
docker load < /tmp/superhero-ttrpg.tar.gz
docker run -d -p 3000:3000 -v /data:/app/data superhero-ttrpg
```

---

## Rollback

### Rollback to Previous Image

```bash
# SSH into server
ssh ubuntu@18.215.116.116

# List available images
docker images | grep superhero-ttrpg

# Stop current container
docker compose -f docker-compose.prod.yml down

# Update docker-compose.prod.yml to use specific SHA tag
# image: 814155132173.dkr.ecr.us-east-1.amazonaws.com/superhero-ttrpg-ecr-repo:abc123

# Start with old image
docker compose -f docker-compose.prod.yml up -d
```

> [!CAUTION]
> Rolling back code doesn't rollback database migrations. Ensure schema compatibility.

---

## Monitoring

### Container Logs

```bash
# View logs
docker logs superhero-ttrpg

# Follow logs
docker logs -f superhero-ttrpg

# Last 100 lines
docker logs --tail 100 superhero-ttrpg
```

### Container Status

```bash
# Check running containers
docker ps

# Check resource usage
docker stats superhero-ttrpg
```

### Health Check

```bash
# HTTP health endpoint
curl https://callingallheroes.net/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-11-20T02:22:02.983310249Z"
}
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs superhero-ttrpg
```

**Common issues:**
- Migration failure (check SQL syntax)
- Database locked (ensure no other processes)
- Permission denied (check volume mount permissions)

### Database Issues

**Inspect database:**
```bash
# Enter container
docker exec -it superhero-ttrpg sh

# Check database file
ls -la /app/data/

# Query database
sqlite3 /app/data/superhero-ttrpg.db "SELECT * FROM __drizzle_migrations;"
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Out of Disk Space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
df -h
```

---

## Security

### Non-Root User

Container runs as `nextjs` user (UID 1001):
```dockerfile
USER nextjs
```

### Secrets Management

- AWS credentials via OIDC (no long-lived keys)
- SSH key stored in GitHub Secrets
- Environment variables in `.env.production` (not in git)

### Network

- Uses host networking (`network_mode: host`)
- Reverse proxy (Caddy) handles HTTPS
- Port 3000 only accessible via proxy

> [!TIP]
> Never commit `.env.production` to git. Store sensitive values in GitHub Secrets or AWS Secrets Manager.
