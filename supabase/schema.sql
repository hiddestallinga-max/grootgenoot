-- GrootGenoot — databaseschema (v1)
-- Voer dit uit in Supabase: SQL Editor > New query > plakken > Run.

-- Eén tabel voor beide soorten aanmeldingen, met een 'rol' om ze te scheiden.
create table if not exists public.aanmeldingen (
  id            uuid primary key default gen_random_uuid(),
  rol           text not null check (rol in ('hulpvrager', 'grootgenoot')),
  voornaam      text not null,
  achternaam    text not null,
  email         text not null,
  telefoon      text,                 -- optioneel, conform het concept
  bericht       text,                 -- optioneel toelichtingsveld
  toestemming   boolean not null default false,  -- AVG-akkoord
  created_at    timestamptz not null default now()
);

-- Row Level Security aanzetten: standaard mag NIEMAND erbij via de publieke key.
alter table public.aanmeldingen enable row level security;

-- Let op: we voegen bewust GEEN publieke select-policy toe.
-- Aanmeldingen invoegen doen we server-side via de service role key
-- (die RLS omzeilt), zodat inzendingen niet door bezoekers te lezen zijn.
-- Het admin-overzicht leest ook server-side. Zo blijven persoonsgegevens afgeschermd.

-- Handige index voor het admin-overzicht (nieuwste eerst, filter op rol).
create index if not exists aanmeldingen_rol_created_idx
  on public.aanmeldingen (rol, created_at desc);
