# webapp-standard — Individualisierungs-Checkliste (nach dem GitHub-Push)
Reihenfolge: Template unverändert bauen+pushen (Standard schnell online), DANN anpassen:
1. `lib/i18n.tsx` — BRAND-NAME, BRAND-CLAIM, alle Hero-/FAQ-Texte aus dem Plan-Interview
2. `data/products.json` — echte Produkte des Anwenders (Bilder nach `public/images/`, Stimmen nach `public/voices/`)
3. `app/globals.css` — Design-Tokens an die Marken-Vorlagen des Anwenders (Bilder!) anpassen; Bild-Regel: NIE beschneiden
4. `next.config.ts` — basePath je nach Hosting ("" bei eigener Domain-Wurzel, "/unterpfad" bei Projekt-Pages)
5. mailto in `app/skill/[slug]/view.tsx` — echte Kontaktadresse
6. Sell-Schicht scharf schalten: GO-LISTE-SELL-APP.md (Supabase + Bezahl-Anbieter, Hand des Anwenders)
