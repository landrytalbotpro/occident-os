-- =============================================================================
-- OCCIDENT OS — Vencimientos FICTICIOS para una base ya sembrada con seed.sql
-- Solo AÑADE: nunca borra ni modifica. Se puede ejecutar varias veces (si un
-- vencimiento ya existe para ese prospect y ramo, se deja como está).
-- Busca los prospects de demo por su nombre ficticio; si no están, no hace nada.
-- Meses relativos a hoy: 3 caen en los próximos 90 días.
-- =============================================================================

do $$
declare
  uid uuid;
  n_users int;
  today date := current_date;
begin
  select count(*) into n_users from auth.users;
  if n_users <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en Auth y hay %', n_users;
  end if;
  select id into uid from auth.users limit 1;

  insert into public.renewals (owner_id, prospect_id, product, month, note, handled_year)
  select uid, p.id, d.product, d.month, d.note, d.handled_year
  from (values
    ('Lucía Ejemplo Pérez',  'Hogar',             extract(month from today + 20)::int,  'Le sube mucho cada año',    null::int),
    ('Javier Demo López',    'Coche',             extract(month from today + 45)::int,  null,                        null),
    ('Diego Prueba Martín',  'Vehículos empresa', extract(month from today + 70)::int,  'Dos furgonetas del taller', null),
    ('Ana Ficticia Ruiz',    'RC',                extract(month from today + 135)::int, null,                        null),
    ('Marcos Prueba Díaz',   'Vida',              extract(month from today + 150)::int, 'Vinculada a la hipoteca',   null),
    ('Elena Muestra García', 'Local/Comercio',    extract(month from today + 200)::int, null,                        null),
    ('Carmen Ejemplo Vega',  'Coche',             extract(month from today + 40)::int,  null,                        extract(year from today + 40)::int)
  ) as d (full_name, product, month, note, handled_year)
  join public.prospects p on p.owner_id = uid and p.full_name = d.full_name
  on conflict (prospect_id, product) do nothing;
end;
$$;
