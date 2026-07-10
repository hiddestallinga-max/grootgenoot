# GrootGenoot

Website tegen vergrijzing — v1: landingspagina + de kern **Groot Support**
(aanmelden als hulpvrager of grootgenoot, opslag in een database, admin-overzicht).

Stack: Next.js (App Router) + TypeScript, Tailwind CSS v4, Supabase (Postgres),
hosting op Vercel.

## Lokaal draaien

```bash
cd grootgenoot
npm install
npm run dev
```

Open http://localhost:3000

## Omgeving instellen (Supabase)

1. Maak een gratis project op https://supabase.com (kies een **EU-regio**).
2. Ga naar **SQL Editor** en voer de inhoud van `supabase/schema.sql` uit.
3. Ga naar **Project Settings > API** en kopieer de URL en keys.
4. Kopieer `.env.example` naar `.env.local` en vul de waarden in:

```bash
cp .env.example .env.local
```

`.env.local` staat in `.gitignore` en komt nooit in GitHub.

## Naar GitHub

```bash
cd grootgenoot
git init
git add .
git commit -m "GrootGenoot v1 — fundament + landing"
# maak een lege repo aan op github.com, daarna:
git remote add origin git@github.com:JOUW-NAAM/grootgenoot.git
git branch -M main
git push -u origin main
```

## Deployen (Vercel)

1. Log in op https://vercel.com met GitHub en importeer de repo.
2. Zet dezelfde env-variabelen uit `.env.local` in Vercel (Project Settings > Environment Variables).
3. Deploy. Elke `git push` naar `main` deployt daarna automatisch.

## Domein koppelen (grootgenoot.nl bij mijndomein.nl)

In Vercel: **Project Settings > Domains > Add** `grootgenoot.nl`.
Vercel toont de exacte DNS-waarden. Zet die bij **mijndomein.nl**:

- `grootgenoot.nl` (root) → **A-record** naar het IP dat Vercel geeft
  (of ALIAS/ANAME als mijndomein dat ondersteunt).
- `www.grootgenoot.nl` → **CNAME** naar `cname.vercel-dns.com`.

HTTPS regelt Vercel automatisch. Propagatie duurt minuten tot ~1 uur.

## Structuur

```
grootgenoot/
├─ app/
│  ├─ layout.tsx           # basis-layout + metadata
│  ├─ globals.css          # huisstijl (Tailwind v4 thema)
│  ├─ page.tsx             # landingspagina met 4 tegels
│  └─ groot-support/
│     └─ page.tsx          # Groot Support (formulieren volgen)
├─ supabase/schema.sql     # databaseschema
├─ .env.example            # sjabloon voor geheimen
└─ ...
```

## Volgende stappen

- [ ] Aanmeldformulieren (hulpvrager / grootgenoot) + opslag in Supabase
- [ ] Beveiligd admin-overzicht met export
- [ ] Privacyverklaring + AVG-teksten
- [ ] Deploy + domein koppelen
