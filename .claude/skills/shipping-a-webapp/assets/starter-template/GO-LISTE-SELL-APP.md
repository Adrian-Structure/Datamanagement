# GO-Liste — Web.SELL.App scharf schalten (2 Handgriffe von Roberto)

Alles ist gebaut und im Mock-Modus klickbar bewiesen (Login → Testkauf → Bewertung → Meine Käufe).
Scharf wird es mit deinen zwei Konten. Gesamtaufwand: ~30–45 Min.

## Handgriff ① — Supabase (gratis, ~15 Min.)
- [ ] supabase.com → Konto anlegen → Neues Projekt, **Region Frankfurt (eu-central-1)**
- [ ] SQL-Editor öffnen → Inhalt von `supabase/sql/schema.sql` einfügen → Run (legt products/purchases/reviews + RLS an)
- [ ] Project Settings → API: **URL** und **anon key** kopieren → in `.env.local` eintragen:
      `NEXT_PUBLIC_SUPABASE_URL=…` und `NEXT_PUBLIC_SUPABASE_ANON_KEY=…` (Datei liegt als `.env.local.example` bereit)
- [ ] Danach `npm run build` — die App wechselt automatisch vom Mock- in den Echt-Modus (Demo-Hinweis verschwindet)

## Handgriff ② — Lemon Squeezy (~20 Min., Details in Skill-Store/PAYMENT.md)
- [ ] Konto anlegen (Testmodus reicht zum Beweis-Lauf!)
- [ ] 1–3 Zugpferd-Produkte anlegen, Skill-Zip als Datei hochladen, Preis setzen
- [ ] Je Produkt den Checkout-Link kopieren → in `data/products.json` ins Feld `checkoutUrl`
      (+ beim Link als Custom-Data `slug` = Produkt-Slug setzen, damit der Webhook zuordnen kann)
- [ ] Webhook: Settings → Webhooks → URL `https://<projekt>.supabase.co/functions/v1/ls-webhook`, Event `order_created`, Secret ausdenken
- [ ] Terminal (einmalig): `supabase functions deploy ls-webhook --no-verify-jwt` und `supabase secrets set LS_WEBHOOK_SECRET=<dein Secret>`

## Beweis-Lauf (= zweiter Abnahme-Stempel Web.SELL.App)
- [ ] Testmodus-Kauf: Kauf-Klick → LS-Checkout → Zahlung (Test) → Bestell-Mail mit Download
- [ ] „Meine Käufe" zeigt den Kauf automatisch (Webhook → purchases → Konto-Seite)
- [ ] Eine Bewertung schreiben (geht erst NACH dem Kauf — die Käufer-Sperre live erleben)
→ Danach: `abnahme_sellapp` stempeln, QA-Lauf 4, Agensi.

## Was du NICHT tun musst
Kein Server, keine eigene USt-Abrechnung (LS ist Merchant of Record), kein Passwort-Handling durch Anna (Schlüssel trägst nur du ein).
