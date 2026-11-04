-- =============================================================================
-- OCCIDENT OS — Esquema inicial
-- Herramienta interna del agente. Datos mínimos (RGPD): sin DNI/NIE, fecha de
-- nacimiento, datos de salud, IBAN ni dirección completa.
-- La gestión real de pólizas está en la plataforma de la entidad: aquí solo se
-- guarda un resumen de cada póliza cerrada para medir objetivos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: 1:1 con auth.users
-- -----------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Crea el perfil automáticamente al crear un usuario en Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Perfil para los usuarios que ya existen (tu usuario creado a mano)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- lead_sources: de dónde viene cada contacto (Referido, TikTok, Puerta fría…)
-- -----------------------------------------------------------------------------

create table public.lead_sources (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 60),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name),
  unique (owner_id, id)
);

-- -----------------------------------------------------------------------------
-- products: catálogo común (solo lectura para la app; se edita por migración)
-- line: a qué objetivo cuenta (ssgg = seguros generales, vida)
-- -----------------------------------------------------------------------------

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in (
                'auto', 'hogar', 'salud', 'responsabilidad_civil', 'comercio',
                'mascotas', 'vida_riesgo', 'vida_ahorro', 'decesos', 'accidentes', 'otros')),
  line        text not null check (line in ('ssgg', 'vida')),
  name        text not null unique check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 500),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- prospects: el pipeline vive aquí
-- -----------------------------------------------------------------------------

create table public.prospects (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  full_name       text not null check (char_length(full_name) between 1 and 120),
  company_name    text check (char_length(company_name) <= 120),
  segment         text not null default 'particular'
                    check (segment in ('particular', 'autonomo', 'pyme')),
  phone           text check (char_length(phone) <= 30),
  email           text check (char_length(email) <= 254),
  municipality    text check (char_length(municipality) <= 80),
  postal_code     text check (postal_code ~ '^[0-9]{5}$'),
  stage           text not null default 'nuevo'
                    check (stage in ('nuevo', 'contactado', 'cita', 'propuesta', 'ganado', 'perdido')),
  lost_reason     text check (char_length(lost_reason) <= 200),
  lead_source_id  uuid,
  next_action_at  timestamptz,
  -- Notas comerciales breves. NO escribir datos de salud ni documentos de identidad.
  notes           text check (char_length(notes) <= 2000),
  -- Base legal y consentimiento (RGPD)
  legal_basis     text not null default 'consentimiento'
                    check (legal_basis in ('consentimiento', 'interes_legitimo', 'medidas_precontractuales')),
  consent_at      timestamptz,
  consent_source  text check (char_length(consent_source) <= 120),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (owner_id, id),
  foreign key (owner_id, lead_source_id)
    references public.lead_sources (owner_id, id) on delete set null (lead_source_id)
);

-- -----------------------------------------------------------------------------
-- clients: se crea al convertir un prospect (primera póliza)
-- -----------------------------------------------------------------------------

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  prospect_id   uuid,
  full_name     text not null check (char_length(full_name) between 1 and 120),
  company_name  text check (char_length(company_name) <= 120),
  segment       text not null default 'particular'
                  check (segment in ('particular', 'autonomo', 'pyme')),
  phone         text check (char_length(phone) <= 30),
  email         text check (char_length(email) <= 254),
  municipality  text check (char_length(municipality) <= 80),
  postal_code   text check (postal_code ~ '^[0-9]{5}$'),
  notes         text check (char_length(notes) <= 2000),
  legal_basis   text not null default 'medidas_precontractuales'
                  check (legal_basis in ('consentimiento', 'interes_legitimo', 'medidas_precontractuales')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, id),
  unique (prospect_id),
  foreign key (owner_id, prospect_id)
    references public.prospects (owner_id, id) on delete set null (prospect_id)
);

-- -----------------------------------------------------------------------------
-- policies: SOLO un resumen de cada póliza cerrada (para objetivos)
-- -----------------------------------------------------------------------------

create table public.policies (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  client_id       uuid not null,
  product_id      uuid not null references public.products (id) on delete restrict,
  annual_premium  numeric(10, 2) not null check (annual_premium >= 0),
  effective_date  date not null,
  status          text not null default 'emitida' check (status in ('emitida', 'anulada')),
  -- Referencia en la plataforma de la entidad (opcional)
  external_ref    text check (char_length(external_ref) <= 60),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (owner_id, client_id)
    references public.clients (owner_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- interactions: llamadas, WhatsApp, visitas… ligadas a UN prospect O UN cliente
-- -----------------------------------------------------------------------------

create table public.interactions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  prospect_id  uuid,
  client_id    uuid,
  kind         text not null check (kind in ('llamada', 'whatsapp', 'email', 'visita', 'reunion', 'otro')),
  occurred_at  timestamptz not null default now(),
  -- Resumen breve. NO escribir datos de salud ni documentos de identidad.
  summary      text check (char_length(summary) <= 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (num_nonnulls(prospect_id, client_id) = 1),
  foreign key (owner_id, prospect_id) references public.prospects (owner_id, id) on delete cascade,
  foreign key (owner_id, client_id)   references public.clients (owner_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- appointments: citas con hora (opcionalmente ligadas a un contacto)
-- -----------------------------------------------------------------------------

create table public.appointments (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  prospect_id  uuid,
  client_id    uuid,
  title        text not null check (char_length(title) between 1 and 120),
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location     text check (char_length(location) <= 160),
  status       text not null default 'programada'
                 check (status in ('programada', 'realizada', 'cancelada', 'no_presentado')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (num_nonnulls(prospect_id, client_id) <= 1),
  check (ends_at is null or ends_at > starts_at),
  foreign key (owner_id, prospect_id) references public.prospects (owner_id, id) on delete cascade,
  foreign key (owner_id, client_id)   references public.clients (owner_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- tasks: seguimientos y recordatorios
-- -----------------------------------------------------------------------------

create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  prospect_id  uuid,
  client_id    uuid,
  title        text not null check (char_length(title) between 1 and 160),
  due_at       timestamptz,
  done_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (num_nonnulls(prospect_id, client_id) <= 1),
  foreign key (owner_id, prospect_id) references public.prospects (owner_id, id) on delete cascade,
  foreign key (owner_id, client_id)   references public.clients (owner_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- targets: objetivos por periodo y métrica
-- min_premium: prima mínima para que una póliza cuente (p. ej. > 50 €)
-- -----------------------------------------------------------------------------

create table public.targets (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  period_start  date not null,
  period_end    date not null,
  metric        text not null check (metric in ('total', 'ssgg', 'hogar', 'vida', 'vida_riesgo')),
  target_value  integer not null check (target_value > 0),
  min_premium   numeric(10, 2) not null default 50 check (min_premium >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (period_end > period_start),
  unique (owner_id, period_start, metric)
);

-- -----------------------------------------------------------------------------
-- monthly_results: VISTA calculada desde policies (nunca se desincroniza)
-- Cuenta solo pólizas emitidas. "qualifying_*" = prima anual > 50 €.
-- security_invoker: aplica la RLS de quien consulta.
-- -----------------------------------------------------------------------------

create view public.monthly_results
with (security_invoker = true)
as
select
  p.owner_id,
  date_trunc('month', p.effective_date)::date                                         as month,
  count(*)                                                                             as policies_total,
  count(*) filter (where p.annual_premium > 50)                                        as qualifying_total,
  count(*) filter (where p.annual_premium > 50 and pr.line = 'ssgg')                   as qualifying_ssgg,
  count(*) filter (where p.annual_premium > 50 and pr.category = 'hogar')              as qualifying_hogar,
  count(*) filter (where p.annual_premium > 50 and pr.line = 'vida')                   as qualifying_vida,
  count(*) filter (where p.annual_premium > 50 and pr.category = 'vida_riesgo')        as qualifying_vida_riesgo,
  coalesce(sum(p.annual_premium), 0)::numeric(12, 2)                                   as premium_total
from public.policies p
join public.products pr on pr.id = p.product_id
where p.status = 'emitida'
group by p.owner_id, date_trunc('month', p.effective_date);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

create index lead_sources_owner_idx      on public.lead_sources (owner_id);
create index prospects_owner_stage_idx   on public.prospects (owner_id, stage);
create index prospects_owner_next_idx    on public.prospects (owner_id, next_action_at) where next_action_at is not null;
create index prospects_lead_source_idx   on public.prospects (owner_id, lead_source_id);
create index clients_owner_idx           on public.clients (owner_id);
create index clients_prospect_idx        on public.clients (owner_id, prospect_id);
create index policies_owner_date_idx     on public.policies (owner_id, effective_date);
create index policies_client_idx         on public.policies (owner_id, client_id);
create index policies_product_idx        on public.policies (product_id);
create index interactions_prospect_idx   on public.interactions (owner_id, prospect_id, occurred_at desc);
create index interactions_client_idx     on public.interactions (owner_id, client_id, occurred_at desc);
create index appointments_owner_start_idx on public.appointments (owner_id, starts_at);
create index appointments_prospect_idx   on public.appointments (owner_id, prospect_id);
create index appointments_client_idx     on public.appointments (owner_id, client_id);
create index tasks_owner_open_due_idx    on public.tasks (owner_id, due_at) where done_at is null;
create index tasks_prospect_idx          on public.tasks (owner_id, prospect_id);
create index tasks_client_idx            on public.tasks (owner_id, client_id);
create index targets_owner_period_idx    on public.targets (owner_id, period_start);

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------

create trigger set_updated_at before update on public.profiles     for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.lead_sources for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products     for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.prospects    for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.clients      for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.policies     for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.interactions for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.appointments for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.tasks        for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.targets      for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Cada usuario solo ve y modifica SUS filas. anon no tiene acceso a nada.
-- -----------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.lead_sources enable row level security;
alter table public.products     enable row level security;
alter table public.prospects    enable row level security;
alter table public.clients      enable row level security;
alter table public.policies     enable row level security;
alter table public.interactions enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks        enable row level security;
alter table public.targets      enable row level security;

-- profiles: solo el propio perfil (lo crea el trigger; no se borra desde la app)
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- products: lectura para usuarios autenticados; escritura solo por migración
create policy "products_select_authenticated" on public.products
  for select to authenticated using (true);

-- Tablas con owner_id: 4 políticas cada una
do $$
declare
  t text;
begin
  foreach t in array array[
    'lead_sources', 'prospects', 'clients', 'policies',
    'interactions', 'appointments', 'tasks', 'targets'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (owner_id = (select auth.uid()))',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (owner_id = (select auth.uid()))',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (owner_id = (select auth.uid()))',
      t || '_delete_own', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permisos (el proyecto NO expone tablas nuevas automáticamente)
-- -----------------------------------------------------------------------------

-- On part de zéro (au cas où des privilèges par défaut existent) puis on donne le strict nécessaire
revoke all on all tables in schema public from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.products to authenticated;
grant select, insert, update, delete on
  public.lead_sources, public.prospects, public.clients, public.policies,
  public.interactions, public.appointments, public.tasks, public.targets
  to authenticated;
grant select on public.monthly_results to authenticated;

-- -----------------------------------------------------------------------------
-- Catálogo FICTICIO de ejemplo (sustituir por productos aprobados por la entidad)
-- -----------------------------------------------------------------------------

insert into public.products (category, line, name, description) values
  ('hogar',                 'ssgg', 'Hogar (ejemplo)',                 'Producto ficticio de ejemplo.'),
  ('auto',                  'ssgg', 'Auto (ejemplo)',                  'Producto ficticio de ejemplo.'),
  ('salud',                 'ssgg', 'Salud (ejemplo)',                 'Producto ficticio de ejemplo.'),
  ('responsabilidad_civil', 'ssgg', 'RC autónomos (ejemplo)',          'Producto ficticio de ejemplo.'),
  ('comercio',              'ssgg', 'Comercio (ejemplo)',              'Producto ficticio de ejemplo.'),
  ('mascotas',              'ssgg', 'Mascotas (ejemplo)',              'Producto ficticio de ejemplo.'),
  ('vida_riesgo',           'vida', 'Vida riesgo (ejemplo)',           'Producto ficticio de ejemplo.'),
  ('vida_ahorro',           'vida', 'Vida ahorro (ejemplo)',           'Producto ficticio de ejemplo.'),
  ('decesos',               'ssgg', 'Decesos (ejemplo)',               'Producto ficticio de ejemplo.'),
  ('accidentes',            'ssgg', 'Accidentes (ejemplo)',            'Producto ficticio de ejemplo.');
