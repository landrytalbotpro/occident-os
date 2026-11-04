# OCCIDENT OS — reglas del proyecto

@AGENTS.md

## Qué es
Herramienta interna de trabajo de un agente comercial de seguros autónomo que trabaja con Occident en Asturias. Uso privado, un solo usuario por ahora. Interfaz en español.

## Reglas permanentes
- NO es una web pública ni un portal oficial de Occident. No dar a entender lo contrario.
- No inventar colores oficiales de Occident ni usar su logo: la marca es provisional y neutra, vía tokens.
- No implementar publicidad, formularios públicos ni integraciones de captación de leads.
- Solo datos ficticios. Nunca datos reales de clientes.
- Minimización de datos (RGPD): no guardar DNI/NIE, fecha de nacimiento, datos de salud, IBAN ni dirección completa.
- La gestión real de pólizas está en la plataforma de Occident. Esta app gestiona prospección, seguimiento, citas, tareas y objetivos, y solo registra un resumen de cada póliza cerrada.

## Arquitectura
- Lógica por dominio en `src/features/<dominio>/` (`queries.ts`, `actions.ts`, `schema.ts` con Zod, `components/`).
- Server Components por defecto; mutaciones con Server Actions validadas con Zod.
- Tokens SOLO en `src/styles/tokens.css`. Los componentes nunca usan colores hex directos: usan las clases mapeadas (`bg-surface-1`, `text-muted`, `bg-brand`...).
- Menú definido en un solo sitio: `src/config/nav.ts`.
- `cacheComponents` está activo: los componentes que usan `usePathname` van dentro de `<Suspense>`.

## Seguridad
- La clave secreta de Supabase nunca va al navegador ni al repo. `.env.local` no se sube.
- Proyecto Supabase en región UE. Registro público desactivado en el panel.

## Forma de trabajar
- Por etapas. No adelantar trabajo de etapas siguientes. Validación del usuario entre etapas.
- Etapa 1 (hecha): proyecto base, tokens, componentes UI, layout responsive, páginas vacías, UI de login sin lógica.
- Etapa 2 (hecha): auth Supabase (email + contraseña, sin registro público). Proxy en `src/proxy.ts` refresca la sesión y redirige; `requireUser()` (`src/lib/auth.ts`) comprueba en el servidor dentro de `<Suspense>`.
- Etapa 3 (hecha): esquema en `supabase/migrations/`, RLS por `owner_id` en todas las tablas, FKs compuestas `(owner_id, id)` para impedir enlazar datos de otro usuario, vista `monthly_results` (security_invoker), seed ficticio en `supabase/seed.sql`.
- Dashboard (hecho): lee `targets`, `monthly_results`, citas de hoy y tareas abiertas (`src/features/dashboard/`). Lecturas con `db()` (`src/lib/db.ts`, siempre en tiempo de petición) dentro de `<Suspense>`. Fechas en zona Europe/Madrid (`src/lib/dates.ts`).
- Fase 2a (hecha): prospects en `src/features/prospects/` — lista con filtro por etapa y búsqueda (`?etapa=&q=`), alta/edición con Zod y base legal RGPD, ficha con cambio de etapa, historial de interacciones y borrado definitivo. Fechas de formularios en hora de Madrid (`madridLocalToISO`). Tras mutaciones sin redirect: `refresh()` de `next/cache`.
- Fase 2b (hecha): `src/features/clients/` — conversión prospect→cliente desde su ficha (copia solo contacto, marca «ganado», prospect_id único impide duplicar), lista y ficha de clientes, alta de póliza (prima en formato español, umbral > 50 € en `MIN_QUALIFYING_PREMIUM`), anular/reactivar póliza.
- Los cambios de esquema SIEMPRE con una nueva migración (nunca editar una ya aplicada).
