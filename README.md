# PWS

Private Web Services is a self-hosted platform for deploying, running, and operating web applications on infrastructure you control.

The project is aimed at a Heroku- or Vercel-style developer experience without requiring a managed cloud control plane. The core idea is simple:

- the manager coordinates deployments and service state
- node agents connect outbound to the manager, which works better on private networks and behind CGNAT
- application traffic is routed locally on the node
- public ingress is user-provided rather than bundled into the platform

## What PWS Is

PWS is intended to be:

- self-hosted
- local-first
- opinionated
- image-based to start
- friendly to private infrastructure

PWS is not intended to be a Kubernetes replacement. The near-term goal is a smaller platform with clearer operational boundaries:

- create an app
- deploy a container image
- start and stop instances
- route traffic to running instances
- scale services manually
- inspect logs

## Architecture

At a high level, the system is split into a few core runtime roles:

- `manager`: the control plane backend for API, orchestration, and scheduling
- `manager-web`: the operator-facing web UI
- `agent`: the node-side daemon that connects to the manager and controls workloads
- `router`: the local routing and load-balancing layer
- `cli`: command-line entrypoint for operators and developers

The expected control path is:

```text
user -> manager API -> scheduler -> agent -> runtime -> container
```

The expected traffic path is:

```text
internet -> user-managed ingress -> node/router -> service instance
```

This separation is deliberate. PWS manages service placement and local routing, while public exposure remains outside the platform boundary.

## Core Domain

The main domain objects are:

- `App`: logical grouping for one or more services
- `Service`: deployable unit with scaling and ingress settings
- `Deployment`: image-based release record
- `Instance`: running container tied to a service and deployment
- `Ingress`: public exposure configuration metadata
- `ScalingPolicy`: desired scale bounds and optional autoscaling hints

## Monorepo Layout

```text
apps/
  manager/
  manager-web/
  agent/
  router/
  cli/

packages/
  domain/
  protocol/
  scheduler/
  runtime-core/
  runtime-docker/
  config/
  logging/
  sdk/

tooling/
  eslint-config/
  typescript-config/
```

## Current Status

The repository is currently scaffolded as a pnpm workspace with shared TypeScript, ESLint, Turbo, and Angular configuration.

`manager-web` is set up as an Angular application. The rest of the repo is structured around the intended service boundaries, with placeholder implementations where the actual runtime behavior will be built out.

## Development

Requirements:

- Node.js 22+
- pnpm 10+

Install dependencies:

```bash
pnpm install
```

Build the workspace:

```bash
pnpm build
```

Run the manager web app in development mode:

```bash
pnpm --filter @pws/manager-web dev
```

## Scope

Planned v1 scope:

- app creation
- container-image deployment
- single-node scheduling
- local routing
- manual scaling
- logs

Deferred work includes:

- autoscaling
- ingress adapters
- health checks
- restart policies
- rolling and zero-downtime deployments
- multi-node scheduling

## License

PWS is licensed under the Apache License 2.0. See [LICENSE](./LICENSE).
