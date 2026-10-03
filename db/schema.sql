-- Esquema de Joalca Games. Requiere PostgreSQL 13+ (gen_random_uuid nativo).
-- Ejecutar una vez contra la base de datos de DATABASE_URL.

create table if not exists jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null unique,
  email text,
  consentimiento_at timestamptz not null,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create table if not exists partidas (
  id uuid primary key default gen_random_uuid(),
  jugador_id uuid not null references jugadores (id),
  juego text not null check (juego in ('sopa', 'ahorcado')),
  -- Fijado por el servidor: ya descuenta la cuenta regresiva.
  inicio_at timestamptz not null,
  fin_at timestamptz,
  duracion_ms integer,
  -- null = abandonada (cuenta como perdida).
  resultado text check (resultado in ('gana', 'pierde')),
  errores integer not null default 0,
  creado_at timestamptz not null default now()
);

create index if not exists partidas_ranking on partidas (juego, resultado, duracion_ms);
create index if not exists partidas_jugador on partidas (jugador_id);

-- Participantes del sorteo: una fila por persona que jugó al menos una partida.
create or replace view participantes_sorteo as
select j.id, j.nombre, j.telefono, j.email, min(p.creado_at) as primera_partida_at
from jugadores j
join partidas p on p.jugador_id = j.id
group by j.id;
