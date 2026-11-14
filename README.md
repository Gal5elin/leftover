# Leftover

[![CI/CD](https://github.com/Gal5elin/leftover/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/Gal5elin/leftover/actions/workflows/ci-cd.yml)

Leftover je spletna aplikacija za upravljanje živil v gospodinjstvu, načrtovanje obrokov in zmanjševanje količine zavržene hrane. Uporabniki v skupnem gospodinjstvu spremljajo zalogo živil in roke uporabe, prejemajo opozorila o živilih, ki jim kmalu poteče rok, načrtujejo obroke za prihodnje dni in iz manjkajočih sestavin samodejno dobijo nakupovalni seznam. Ko je obrok pripravljen, se porabljene količine samodejno odštejejo od zaloge.

## Tehnologije

| Del             | Tehnologije                                                           |
| --------------- | --------------------------------------------------------------------- |
| Frontend        | Svelte (SvelteKit), TypeScript, Vite                                  |
| Backend         | Node.js, NestJS, TypeScript, Swagger / OpenAPI                        |
| Podatkovna baza | PostgreSQL, TypeORM                                                   |
| Avtentikacija   | JWT, Passport, bcrypt                                                 |
| Razvoj          | Docker, Docker Compose, ESLint (frontend), Oxlint (backend), Prettier |
| Testiranje      | Vitest, pokritost z V8                                                |

## Struktura repozitorija

```
├── frontend/   # spletni vmesnik (SvelteKit)
├── backend/    # REST API (NestJS)
└── docs/       # dokumentacija projekta
```

## Lokalni zagon

Potrebno: Node.js 24, pnpm, Docker.

```bash
pnpm install
pnpm docker:up
```

Swagger dokumentacija API-ja: http://localhost:3000/api/docs

Migracije (v `backend/`):

```bash
pnpm migration:generate libs/db/migrations/<imeMigracije>
pnpm migration:run
pnpm migration:revert
```

## CI/CD

Spremembe razvijamo v ločenih vejah in jih združujemo prek pull requestov v `main`
v repozitoriju **Gal5elin/leftover**.

Workflow [ci-cd.yml](.github/workflows/ci-cd.yml) se sproži ob pull requestu v `main`
in ob pushu na `main`. Vzporedno izvede:

- **lint**: ESLint in Svelte/TypeScript preverjanje frontenda ter Oxlint za backend;
- **build**: gradnjo obeh aplikacij in pripravo samostojnih paketov `frontend-build`
  ter `backend-build` (z zgrajeno kodo, produkcijskimi odvisnostmi in Dockerfile);
- **test**: 46 enotskih testov (22 frontend, 24 backend) ter poročili HTML/LCOV v artefaktu
  `coverage`. Padec testa ali prenizka pokritost preverjanih modulov povzroči padec joba.

Po uspešnih preverjanjih job **deploy** samo ob pushu na `main` prenese artefakte
in jih namesti na Railway v okolje `production`. Aplikacije ne gradi ponovno:
Dockerfile samo razpakira paket v Node.js vsebnik. Pred zagonom backenda se
izvedejo zgrajene TypeORM migracije; neuspešna migracija prepreči zagon aplikacije.
Job preveri javna URL-ja in Git SHA obeh storitev, zato odziv stare različice
ne šteje kot uspešna namestitev.

Odvisnosti se namestijo s `pnpm install --frozen-lockfile`; pnpm store se predpomni
z `actions/setup-node`. Artefakti so na voljo pri posameznem zagonu v zavihku Actions.

Lokalno preverjanje:

```bash
pnpm lint
pnpm test:cov
pnpm build
pnpm package:deploy
```

Pokritost se meri za izbrane module poslovne logike (roki uporabe, zaloga,
nakupovalni seznam) in validacije obrazcev, ne za celotno aplikacijo.
Minimalne meje teh modulov so 90 % vrstic, stavkov in funkcij ter 85 % vej.

### Nastavitve forka

1. V [Actions](https://github.com/Gal5elin/leftover/actions) omogoči GitHub Actions,
   če še niso omogočene.
2. Po prvem zagonu workflowa v Settings → Branches zaščiti `main`: vklopi
   **Require a pull request before merging** in **Require status checks to pass
   before merging**, izberi `lint`, `build`, `test` ter zahtevaj posodobljeno vejo.
   Onemogoči obhod pravil, tudi za administratorje.

Primer padca in popravka je v [PR #2](https://github.com/Gal5elin/leftover/pull/2):
commit `32d2bcb` vsebuje namerno neuporabljeno spremenljivko.
[Prvi zagon](https://github.com/Gal5elin/leftover/actions/runs/43627114262)
je zato padel pri jobu `lint`; naslednji commit začasno datoteko odstrani.
To potrjuje zaznavanje napake v CI. Blokado združevanja zagotovi šele zgornja
nastavitev zaščite veje.

### Namestitev

Produkcijska naslova (dostopna po prvi uspešni namestitvi):

- [Aplikacija](https://frontend-production-774ef93f.up.railway.app)
- [Backend health](https://backend-production-723376ef.up.railway.app/health)
- [Swagger API](https://backend-production-723376ef.up.railway.app/api/docs)

V enem Railway projektu so storitve `frontend`, `backend` in `Postgres` v okolju
`production`. Za frontend in backend je ustvarjena javna domena s ciljnim portom
`3000`. Storitvi nimata samodejne gradnje iz GitHuba; namesti ju job `deploy`.

Na Railway pri `backend` nastavi:

```env
NODE_ENV=production
PORT=3000
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
JWT_EXPIRES_IN=1d
APP_CORS_ORIGIN=https://frontend-production-774ef93f.up.railway.app
```

Dodaj še naključen `JWT_SECRET`, ustvarjen npr. z
`node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
Ime `Postgres` v referencah se mora ujemati z imenom storitve baze.

Pri `frontend` nastavi:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ORIGIN=https://frontend-production-774ef93f.up.railway.app
```

`API_URL` je statična okoljska spremenljivka frontenda. Workflow jo pred gradnjo
nastavi na `https://backend-production-723376ef.up.railway.app`.
Za lokalni razvoj ostaja privzeta vrednost `http://localhost:3000`.

Na GitHub v **Settings → Environments** ustvari okolje **production**. V njegove
**Environment secrets** dodaj **RAILWAY_TOKEN**: projektni token iz Railway
**Project Settings → Tokens**, omejen na Railway okolje `production`.
Gesla baze in JWT secret ostanejo v Railway Variables; niso del artefaktov.

Nato združi deploy PR v `main`. GitHub Actions mora uspešno zaključiti vse štiri
jobe. V dnevniku `Verify deployed release` preveri potrjeni različici obeh
storitev, nato na javnem URL-ju preveri registracijo, prijavo in dodajanje živila.

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
