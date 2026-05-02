create table if not exists apps (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id text primary key,
  app_id text not null references apps(id) on delete cascade,
  desired_instances integer not null default 1,
  ingress_type text,
  ingress_domain text,
  scaling_min integer,
  scaling_max integer,
  scaling_target_rps_per_instance integer,
  scaling_cooldown_seconds integer,
  created_at timestamptz not null default now()
);

create table if not exists deployments (
  id text primary key,
  app_id text not null references apps(id) on delete cascade,
  image text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists instances (
  id text primary key,
  service_id text not null references services(id) on delete cascade,
  deployment_id text not null references deployments(id) on delete cascade,
  container_id text not null,
  port integer not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists logs (
  id text primary key,
  instance_id text not null references instances(id) on delete cascade,
  timestamp timestamptz not null default now(),
  message text not null
);

create table if not exists events (
  id text primary key,
  app_id text not null references apps(id) on delete cascade,
  type text not null,
  timestamp timestamptz not null default now(),
  details jsonb
);

create table if not exists metrics (
  id text primary key,
  instance_id text not null references instances(id) on delete cascade,
  timestamp timestamptz not null default now(),
  cpu_usage numeric,
  memory_usage numeric,
  request_count integer
);

create table if not exists secrets (
  id text primary key,
  app_id text not null references apps(id) on delete cascade,
  name text not null,
  value text not null,
  created_at timestamptz not null default now(),
  unique (app_id, name)
);


