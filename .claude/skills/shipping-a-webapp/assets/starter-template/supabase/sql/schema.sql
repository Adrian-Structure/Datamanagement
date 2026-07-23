-- Web.Sell.App Schema — Supabase (Frankfurt / eu-central-1)
-- Ausführen im Supabase SQL-Editor nach Projekt-Anlage (Robertos Handgriff ①).

-- Produkte (gespiegelt aus data/products.json; Preise pflegt Roberto)
create table if not exists products (
  slug text primary key,
  title_de text not null,
  title_en text not null,
  price_eur numeric,
  checkout_url text default '',          -- Lemon-Squeezy-Link je Produkt (Handgriff ②)
  active boolean default true
);

-- Käufe (schreibt NUR die Edge Function via Service-Role; Käufer lesen ihre eigenen)
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  product_slug text references products(slug),
  ls_order_id text unique,               -- Lemon-Squeezy-Bestellnummer (Idempotenz)
  purchased_at timestamptz default now()
);

-- Bewertungen (nur verifizierte Käufer schreiben; alle lesen)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text not null,
  product_slug text references products(slug),
  stars int check (stars between 1 and 5),
  body text check (char_length(body) <= 2000),
  created_at timestamptz default now(),
  unique (user_id, product_slug)
);

-- Row-Level-Security
alter table products enable row level security;
alter table purchases enable row level security;
alter table reviews enable row level security;

-- Produkte: jeder darf lesen
create policy "products_read_all" on products for select using (true);

-- Käufe: eingeloggte Nutzer sehen NUR die eigenen (per E-Mail des Auth-Kontos)
create policy "purchases_read_own" on purchases for select
  using (auth.jwt() ->> 'email' = user_email);
-- Kein Insert/Update für Clients: schreibt ausschließlich die Edge Function (Service-Role umgeht RLS)

-- Bewertungen: alle lesen; schreiben nur, wer das Produkt gekauft hat; ändern/löschen nur eigene
create policy "reviews_read_all" on reviews for select using (true);
create policy "reviews_insert_buyers" on reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from purchases p
      where p.product_slug = reviews.product_slug
        and p.user_email = auth.jwt() ->> 'email'
    )
  );
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on reviews for delete using (auth.uid() = user_id);
