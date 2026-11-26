-- =============================================================================
-- OCCIDENT OS — Vencimientos (recordatorios de renovación)
-- Mes de vencimiento de los contratos que el contacto tiene en OTRAS compañías
-- (dato de la ficha de visita de la entidad). Solo lo necesario para saber a
-- quién llamar y cuándo. RGPD: sin compañía, sin precio, sin documentos.
-- Si el prospect pasó a cliente, el cliente se encuentra por clients.prospect_id.
-- =============================================================================

create table public.renewals (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  prospect_id   uuid not null,
  product       text not null check (product in (
                  'Coche', 'Hogar', 'Vida', 'Decesos', 'Salud', 'Ahorro/PP',
                  'Local/Comercio', 'RC', 'Vehículos empresa', 'Accidentes/IT', 'Otros')),
  month         smallint not null check (month between 1 and 12),
  -- Nota breve. NO escribir compañía, precio, datos de salud ni documentos.
  note          text check (char_length(note) <= 140),
  -- Año del último vencimiento ya tratado (llamado). null = nunca.
  handled_year  integer check (handled_year between 2000 and 2100),
  created_at    timestamptz not null default now(),
  unique (prospect_id, product),
  foreign key (owner_id, prospect_id)
    references public.prospects (owner_id, id) on delete cascade
);

create index renewals_owner_month_idx on public.renewals (owner_id, month);

-- RLS: igual que el resto de tablas con owner_id
alter table public.renewals enable row level security;

create policy "renewals_select_own" on public.renewals
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "renewals_insert_own" on public.renewals
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "renewals_update_own" on public.renewals
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "renewals_delete_own" on public.renewals
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.renewals from anon, authenticated;
grant select, insert, update, delete on public.renewals to authenticated;
