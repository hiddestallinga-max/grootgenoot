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

-- Voorkom dubbele aanmeldingen: één aanmelding per e-mailadres per rol.
-- Let op: als er al dubbele rijen in de tabel staan, faalt het aanmaken van
-- deze index — verwijder dan eerst de duplicaten.
create unique index if not exists aanmeldingen_email_rol_uniek
  on public.aanmeldingen (lower(email), rol);

-- Berichten via het contactformulier.
create table if not exists public.berichten (
  id         uuid primary key default gen_random_uuid(),
  naam       text not null,
  email      text not null,
  bericht    text not null,
  created_at timestamptz not null default now()
);
alter table public.berichten enable row level security;

-- ===== Betalen via Stripe (koppelingen, uren, facturen) =====

-- Stripe-koppelvelden op aanmeldingen
alter table public.aanmeldingen add column if not exists stripe_account_id text;          -- grootgenoot: Express-account
alter table public.aanmeldingen add column if not exists stripe_onboarded boolean not null default false;
alter table public.aanmeldingen add column if not exists stripe_customer_id text;         -- hulpvrager: klant
alter table public.aanmeldingen add column if not exists stripe_machtiging boolean not null default false;

-- Werkvorm van de grootgenoot: particulier (regeling dienstverlening aan huis)
-- of zzp met eigen KvK. Bij zzp bewaren we KvK-nummer en (optioneel) BTW-id.
alter table public.aanmeldingen add column if not exists werkvorm text;   -- 'particulier' of 'zzp'
alter table public.aanmeldingen add column if not exists kvk text;
alter table public.aanmeldingen add column if not exists btw_id text;

-- Een koppeling tussen een hulpvrager en een grootgenoot, met tariefafspraak.
create table if not exists public.koppelingen (
  id              uuid primary key default gen_random_uuid(),
  hulpvrager_id   uuid not null references public.aanmeldingen(id) on delete cascade,
  grootgenoot_id  uuid not null references public.aanmeldingen(id) on delete cascade,
  uurtarief_cent  integer not null check (uurtarief_cent between 1000 and 10000),
  service_pct     numeric not null default 18,
  actief          boolean not null default true,
  created_at      timestamptz not null default now()
);
alter table public.koppelingen enable row level security;

-- Gewerkte uren, ingediend door de grootgenoot, goedgekeurd in de regiekamer.
create table if not exists public.uren (
  id            uuid primary key default gen_random_uuid(),
  koppeling_id  uuid not null references public.koppelingen(id) on delete cascade,
  datum         date not null,
  minuten       integer not null check (minuten > 0 and minuten <= 720),
  km            numeric not null default 0 check (km >= 0 and km <= 1000),  -- gereisde kilometers voor reiskostenvergoeding
  omschrijving  text,
  status        text not null default 'ingediend'
                check (status in ('ingediend','goedgekeurd','afgekeurd','gefactureerd')),
  created_at    timestamptz not null default now()
);
alter table public.uren enable row level security;

-- Als de tabel al bestond zonder km-kolom, voeg 'm alsnog toe:
alter table public.uren add column if not exists km numeric not null default 0;

-- Intake van betaalgegevens: gebruikers die liever hebben dat Hidde hun
-- Stripe-instelling regelt, sturen hun gegevens via een formulier op de site.
-- Hidde zet ze daarna handmatig in Stripe (en zet 'verwerkt' op true).
create table if not exists public.stripe_intake (
  id                 uuid primary key default gen_random_uuid(),
  rol                text not null check (rol in ('hulpvrager','grootgenoot')),
  voornaam           text not null,
  achternaam         text not null,
  email              text not null,
  telefoon           text,
  straat             text,        -- straat en huisnummer
  postcode           text,
  woonplaats         text,
  geboortedatum      date,        -- grootgenoot: nodig voor Stripe-identiteit
  kvk                text,        -- grootgenoot: optioneel
  iban               text not null,
  rekeninghouder     text not null,
  machtiging_akkoord boolean not null default false,  -- hulpvrager: SEPA-toestemming
  toelichting        text,
  verwerkt           boolean not null default false,   -- regiekamer: al in Stripe gezet?
  created_at         timestamptz not null default now()
);
alter table public.stripe_intake enable row level security;
create index if not exists stripe_intake_verwerkt_idx
  on public.stripe_intake (verwerkt, created_at desc);

-- Maandfacturen (één incasso per koppeling per run).
create table if not exists public.facturen (
  id                        uuid primary key default gen_random_uuid(),
  koppeling_id              uuid not null references public.koppelingen(id) on delete cascade,
  periode                   text not null,
  totaal_cent               integer not null,
  service_cent              integer not null,
  stripe_payment_intent_id  text,
  status                    text not null default 'aangemaakt'
                            check (status in ('aangemaakt','in_behandeling','betaald','mislukt')),
  created_at                timestamptz not null default now()
);
alter table public.facturen enable row level security;

-- Doorlopend factuurnummer + een momentopname (snapshot) van de factuurregels,
-- zodat we later exact dezelfde PDF opnieuw kunnen maken. En een vlag of er al
-- een creditnota tegenover staat.
alter table public.facturen add column if not exists nummer bigint generated by default as identity;
alter table public.facturen add column if not exists snapshot jsonb;
alter table public.facturen add column if not exists gecrediteerd boolean not null default false;

-- Creditnota's: een correctie op een eerdere factuur (met Stripe-terugbetaling).
create table if not exists public.creditnotas (
  id                uuid primary key default gen_random_uuid(),
  factuur_id        uuid not null references public.facturen(id) on delete cascade,
  nummer            bigint generated by default as identity,
  bedrag_cent       integer not null,
  reden             text,
  stripe_refund_id  text,
  snapshot          jsonb,
  created_at        timestamptz not null default now()
);
alter table public.creditnotas enable row level security;
