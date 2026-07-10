-- GrootGenoot — databaseschema (v1, persoonlijke koppeling)
-- Voer dit uit in Supabase: SQL Editor > New query > plakken > Run.
-- Veilig om opnieuw te draaien: alles is "if not exists" / idempotent.

create table if not exists public.aanmeldingen (
  id             uuid primary key default gen_random_uuid(),
  rol            text not null check (rol in ('hulpvrager', 'grootgenoot')),

  -- contact
  voornaam       text not null,
  achternaam     text not null,
  email          text not null,
  telefoon       text,                       -- optioneel
  postcode       text,                       -- voor matchen op afstand

  -- wat iemand zoekt (hulpvrager) of biedt (grootgenoot)
  categorieen    text[] not null default '{}',

  -- alleen hulpvrager
  urgentie       text check (urgentie in ('laag', 'gemiddeld', 'hoog')),

  -- alleen grootgenoot
  beschikbaarheid text,

  toelichting    text,
  toestemming    boolean not null default false,   -- AVG-akkoord

  -- regiekamer: waar staat deze aanmelding in het proces?
  status         text not null default 'nieuw'
                 check (status in ('nieuw','gebeld','intake','match_voorgesteld','gekoppeld','loopt')),
  notitie        text,                        -- interne notitie voor de coordinator

  created_at     timestamptz not null default now()
);

-- Als de tabel al bestond (oude v1), voeg de nieuwe kolommen alsnog toe:
alter table public.aanmeldingen add column if not exists postcode text;
alter table public.aanmeldingen add column if not exists categorieen text[] not null default '{}';
alter table public.aanmeldingen add column if not exists urgentie text;
alter table public.aanmeldingen add column if not exists beschikbaarheid text;
alter table public.aanmeldingen add column if not exists toelichting text;
alter table public.aanmeldingen add column if not exists status text not null default 'nieuw';
alter table public.aanmeldingen add column if not exists notitie text;

-- Row Level Security aan: niemand komt erbij via de publieke anon-key.
-- Invoegen en lezen doen we uitsluitend server-side met de service role key
-- (die RLS omzeilt). Zo blijven persoonsgegevens afgeschermd van bezoekers.
alter table public.aanmeldingen enable row level security;

create index if not exists aanmeldingen_rol_created_idx
  on public.aanmeldingen (rol, created_at desc);
create index if not exists aanmeldingen_status_idx
  on public.aanmeldingen (status);
