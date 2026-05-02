create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists roles (
  id text primary key,
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id text primary key,
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (resource, action)
);

create table if not exists user_roles (
  user_id text not null references users(id) on delete cascade,
  role_id text not null references roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists role_permissions (
  role_id text not null references roles(id) on delete cascade,
  permission_id text not null references permissions(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index if not exists idx_user_roles_role_id on user_roles(role_id);
create index if not exists idx_role_permissions_permission_id on role_permissions(permission_id);
