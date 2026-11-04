-- =============================================================================
-- OCCIDENT OS — Datos FICTICIOS de ejemplo
-- Nombres, teléfonos y emails inventados (dominio example.com reservado).
-- Se asignan al ÚNICO usuario de Auth. Se puede volver a ejecutar: borra antes
-- los datos de ejemplo de ese usuario.
-- =============================================================================

do $$
declare
  uid uuid;
  n_users int;
  src_ref uuid; src_tiktok uuid; src_puerta uuid; src_web uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid; p7 uuid; p8 uuid; p9 uuid;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid;
  prod_hogar uuid; prod_auto uuid; prod_vida_r uuid; prod_vida_a uuid; prod_rc uuid; prod_decesos uuid;
  today date := current_date;
begin
  select count(*) into n_users from auth.users;
  if n_users <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en Auth y hay %', n_users;
  end if;
  select id into uid from auth.users limit 1;

  -- Limpieza de ejemplos anteriores (cascada)
  delete from public.prospects    where owner_id = uid;
  delete from public.clients      where owner_id = uid;
  delete from public.tasks        where owner_id = uid;
  delete from public.appointments where owner_id = uid;
  delete from public.targets      where owner_id = uid;
  delete from public.lead_sources where owner_id = uid;

  -- Fuentes de captación
  insert into public.lead_sources (owner_id, name) values (uid, 'Referido')     returning id into src_ref;
  insert into public.lead_sources (owner_id, name) values (uid, 'TikTok')       returning id into src_tiktok;
  insert into public.lead_sources (owner_id, name) values (uid, 'Puerta fría')  returning id into src_puerta;
  insert into public.lead_sources (owner_id, name) values (uid, 'Web')          returning id into src_web;

  select id into prod_hogar   from public.products where name = 'Hogar (ejemplo)';
  select id into prod_auto    from public.products where name = 'Auto (ejemplo)';
  select id into prod_vida_r  from public.products where name = 'Vida riesgo (ejemplo)';
  select id into prod_vida_a  from public.products where name = 'Vida ahorro (ejemplo)';
  select id into prod_rc      from public.products where name = 'RC autónomos (ejemplo)';
  select id into prod_decesos from public.products where name = 'Decesos (ejemplo)';

  -- Objetivos de la fase inicial (6 meses desde el 1 de noviembre de 2026)
  insert into public.targets (owner_id, period_start, period_end, metric, target_value) values
    (uid, '2026-11-01', '2027-04-30', 'total',       42),
    (uid, '2026-11-01', '2027-04-30', 'ssgg',        12),
    (uid, '2026-11-01', '2027-04-30', 'hogar',        6),
    (uid, '2026-11-01', '2027-04-30', 'vida',        12),
    (uid, '2026-11-01', '2027-04-30', 'vida_riesgo',  6);

  -- Prospects en distintas etapas
  insert into public.prospects (owner_id, full_name, segment, phone, email, municipality, postal_code, stage, lead_source_id, next_action_at, notes, consent_at, consent_source)
  values (uid, 'Lucía Ejemplo Pérez', 'particular', '600 000 001', 'lucia@example.com', 'Gijón', '33201', 'nuevo', src_tiktok, now() + interval '1 day', 'Pidió info de hogar por DM.', now() - interval '2 days', 'DM TikTok')
  returning id into p1;
  insert into public.prospects (owner_id, full_name, segment, phone, municipality, postal_code, stage, lead_source_id, next_action_at, notes, consent_at, consent_source)
  values (uid, 'Marcos Prueba Díaz', 'particular', '600 000 002', 'Oviedo', '33001', 'contactado', src_ref, now() + interval '2 days', 'Referido por un cliente. Interesado en vida.', now() - interval '5 days', 'Llamada')
  returning id into p2;
  insert into public.prospects (owner_id, full_name, company_name, segment, phone, municipality, postal_code, stage, lead_source_id, next_action_at, consent_at, consent_source)
  values (uid, 'Ana Ficticia Ruiz', 'Panadería La Ficticia', 'autonomo', '600 000 003', 'Avilés', '33400', 'cita', src_puerta, now() + interval '3 hours', now() - interval '7 days', 'Visita')
  returning id into p3;
  insert into public.prospects (owner_id, full_name, segment, phone, municipality, postal_code, stage, lead_source_id, next_action_at, consent_at, consent_source)
  values (uid, 'Javier Demo López', 'particular', '600 000 004', 'Gijón', '33204', 'propuesta', src_web, now() + interval '1 day', now() - interval '10 days', 'Formulario web')
  returning id into p4;
  insert into public.prospects (owner_id, full_name, company_name, segment, phone, municipality, postal_code, stage, lead_source_id, consent_at, consent_source)
  values (uid, 'Elena Muestra García', 'Muestra Reformas SL', 'pyme', '600 000 005', 'Siero', '33510', 'propuesta', src_ref, now() - interval '12 days', 'Reunión')
  returning id into p5;
  insert into public.prospects (owner_id, full_name, segment, municipality, stage, lead_source_id, lost_reason, consent_at, consent_source)
  values (uid, 'Pablo Inventado Sanz', 'particular', 'Gijón', 'perdido', src_tiktok, 'Se quedó con su compañía actual', now() - interval '20 days', 'DM TikTok')
  returning id into p6;
  insert into public.prospects (owner_id, full_name, segment, phone, municipality, postal_code, stage, lead_source_id, consent_at, consent_source)
  values (uid, 'Carmen Ejemplo Vega', 'particular', '600 000 007', 'Gijón', '33203', 'ganado', src_ref, now() - interval '25 days', 'Llamada')
  returning id into p7;
  insert into public.prospects (owner_id, full_name, company_name, segment, phone, municipality, postal_code, stage, lead_source_id, consent_at, consent_source)
  values (uid, 'Diego Prueba Martín', 'Taller Prueba', 'autonomo', '600 000 008', 'Langreo', '33930', 'ganado', src_puerta, now() - interval '22 days', 'Visita')
  returning id into p8;
  insert into public.prospects (owner_id, full_name, segment, phone, municipality, postal_code, stage, lead_source_id, consent_at, consent_source)
  values (uid, 'Sofía Demo Álvarez', 'particular', '600 000 009', 'Oviedo', '33006', 'ganado', src_web, now() - interval '18 days', 'Formulario web')
  returning id into p9;

  -- Clientes (convertidos de prospects ganados) + uno antiguo sin prospect
  insert into public.clients (owner_id, prospect_id, full_name, segment, phone, municipality, postal_code)
  values (uid, p7, 'Carmen Ejemplo Vega', 'particular', '600 000 007', 'Gijón', '33203') returning id into c1;
  insert into public.clients (owner_id, prospect_id, full_name, company_name, segment, phone, municipality, postal_code)
  values (uid, p8, 'Diego Prueba Martín', 'Taller Prueba', 'autonomo', '600 000 008', 'Langreo', '33930') returning id into c2;
  insert into public.clients (owner_id, prospect_id, full_name, segment, phone, municipality, postal_code)
  values (uid, p9, 'Sofía Demo Álvarez', 'particular', '600 000 009', 'Oviedo', '33006') returning id into c3;
  insert into public.clients (owner_id, full_name, segment, phone, municipality, postal_code)
  values (uid, 'Roberto Ficticio Gil', 'particular', '600 000 010', 'Gijón', '33208') returning id into c4;

  -- Resumen de pólizas cerradas (primas ficticias)
  insert into public.policies (owner_id, client_id, product_id, annual_premium, effective_date) values
    (uid, c1, prod_hogar,   245.00, '2026-11-02'),
    (uid, c1, prod_vida_r,  180.00, '2026-11-02'),
    (uid, c2, prod_rc,      320.00, '2026-11-03'),
    (uid, c2, prod_auto,    410.00, '2026-11-03'),
    (uid, c3, prod_vida_r,  150.00, '2026-11-04'),
    (uid, c3, prod_hogar,   210.00, '2026-11-04'),
    (uid, c4, prod_decesos,  42.00, '2026-11-04'),  -- prima < 50 €: no cuenta para objetivos
    (uid, c4, prod_vida_a,  600.00, '2026-11-04');

  -- Interacciones
  insert into public.interactions (owner_id, prospect_id, kind, occurred_at, summary) values
    (uid, p1, 'whatsapp', now() - interval '2 days', 'Primer contacto. Quiere comparar su seguro de hogar.'),
    (uid, p2, 'llamada',  now() - interval '4 days', 'Llamada de presentación. Queda en pensar opciones de vida.'),
    (uid, p3, 'visita',   now() - interval '6 days', 'Visita al local. Pide propuesta para comercio.'),
    (uid, p4, 'email',    now() - interval '1 day',  'Enviada propuesta de auto.'),
    (uid, p5, 'reunion',  now() - interval '3 days', 'Reunión con la gerente. Revisar RC y flota.');
  insert into public.interactions (owner_id, client_id, kind, occurred_at, summary) values
    (uid, c1, 'llamada', now() - interval '1 day', 'Seguimiento postventa. Todo bien.');

  -- Citas (hoy y esta semana)
  insert into public.appointments (owner_id, prospect_id, title, starts_at, ends_at, location) values
    (uid, p3, 'Visita Panadería La Ficticia', date_trunc('day', now()) + interval '17 hours', date_trunc('day', now()) + interval '18 hours', 'Avilés'),
    (uid, p5, 'Reunión Muestra Reformas',      date_trunc('day', now()) + interval '2 days 10 hours', date_trunc('day', now()) + interval '2 days 11 hours', 'Siero');
  insert into public.appointments (owner_id, client_id, title, starts_at, location) values
    (uid, c4, 'Revisión anual Roberto',        date_trunc('day', now()) + interval '3 days 12 hours', 'Gijón');

  -- Tareas
  insert into public.tasks (owner_id, prospect_id, title, due_at) values
    (uid, p1, 'Llamar a Lucía para comparar hogar', now() + interval '1 day'),
    (uid, p2, 'Enviar simulación de vida a Marcos', now() + interval '2 days'),
    (uid, p4, 'Seguimiento propuesta auto Javier',  now() + interval '1 day');
  insert into public.tasks (owner_id, title, due_at) values
    (uid, 'Preparar 3 vídeos de TikTok',            now() + interval '4 days');
  insert into public.tasks (owner_id, client_id, title, due_at, done_at) values
    (uid, c1, 'Mandar bienvenida a Carmen',          now() - interval '2 days', now() - interval '2 days');
end;
$$;
