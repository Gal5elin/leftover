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
- **build**: gradnjo obeh aplikacij in shranjevanje artefaktov `frontend-build`
  (`frontend/build/`) ter `backend-build` (`backend/dist/`);
- **test**: enotske teste frontenda in backenda ter poročili HTML/LCOV v artefaktu
  `coverage`. Padec testa ali prenizka pokritost preverjanih modulov povzroči padec joba.

Odvisnosti se namestijo s `pnpm install --frozen-lockfile`; pnpm store se predpomni
z `actions/setup-node`. Artefakti so na voljo pri posameznem zagonu v zavihku Actions.

Lokalno preverjanje:

```bash
pnpm lint
pnpm test:cov
pnpm build
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
3. Preveri zaščito s pull requestom, v katerem namerno pokvariš test ali dodaš
   neuporabljeno spremenljivko v frontend. Po neuspešnem zagonu napako odpravi
   v istem PR-ju in preveri, da so vsi trije jobi uspešni.

### Namestitev

Javna namestitev je po dogovoru za zdaj odložena, zato javni URL in job `deploy`
še nista nastavljena. Lokalna aplikacija je na http://localhost:5173.

Frontend uporablja Node adapter; paket `frontend-build` se zažene z
`node build/index.js`, backend pa z `node dist/src/main.js` ob nameščenih
produkcijskih odvisnostih. Pred gradnjo nastavi repozitorijsko spremenljivko
`API_URL` na javni URL backenda; privzeta vrednost je `http://localhost:3000`.

Za dokončanje namestitve bo treba izbrati gostovanje in PostgreSQL, ustvariti
okolje `production` in njegove GitHub Secrets, dodati job `deploy` z
`needs: [lint, build, test]` in pogojem za push na `main`, prenesti artefakte
z `actions/download-artifact` ter jih namestiti brez ponovne gradnje.
Nato se tukaj doda dejanski javni URL aplikacije.

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
