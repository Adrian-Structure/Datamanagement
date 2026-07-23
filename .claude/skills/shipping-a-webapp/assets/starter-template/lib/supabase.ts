"use client";
// Supabase-Anbindung mit MOCK-Modus:
// Ohne echte Konfiguration (NEXT_PUBLIC_SUPABASE_URL leer) läuft die App im Mock —
// komplett klickbar, Daten nur im Browser (localStorage). Mit Konfiguration: echtes Supabase.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY_ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const MOCK = !URL_ || !KEY_;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (MOCK) return null;
  if (!client) client = createClient(URL_, KEY_);
  return client;
}

// ---------- Mock-Schicht (localStorage) ----------
const LS_USER = "shop-mock-user";
const LS_PURCH = "shop-mock-purchases";
const LS_REV = "shop-mock-reviews";

export type Review = { user_email: string; product_slug: string; stars: number; body: string; created_at: string };

export async function getUser(): Promise<{ email: string } | null> {
  if (MOCK) {
    const e = typeof window !== "undefined" ? window.localStorage.getItem(LS_USER) : null;
    return e ? { email: e } : null;
  }
  const { data } = await supabase()!.auth.getUser();
  return data.user?.email ? { email: data.user.email } : null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  if (MOCK) {
    window.localStorage.setItem(LS_USER, email.toLowerCase());
    return null;
  }
  const { error } = await supabase()!.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

export async function signUp(email: string, password: string): Promise<string | null> {
  if (MOCK) {
    window.localStorage.setItem(LS_USER, email.toLowerCase());
    return null;
  }
  const { error } = await supabase()!.auth.signUp({ email, password });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  if (MOCK) { window.localStorage.removeItem(LS_USER); return; }
  await supabase()!.auth.signOut();
}

export async function myPurchases(): Promise<string[]> {
  if (MOCK) {
    const u = await getUser(); if (!u) return [];
    return JSON.parse(window.localStorage.getItem(LS_PURCH) ?? "[]");
  }
  const { data } = await supabase()!.from("purchases").select("product_slug");
  return (data ?? []).map((r: { product_slug: string }) => r.product_slug);
}

// Mock-Hilfe: „Testkauf" für die Demo (im echten Betrieb schreibt NUR der Webhook)
export async function mockBuy(slug: string): Promise<void> {
  if (!MOCK) return;
  const cur: string[] = JSON.parse(window.localStorage.getItem(LS_PURCH) ?? "[]");
  if (!cur.includes(slug)) window.localStorage.setItem(LS_PURCH, JSON.stringify([...cur, slug]));
}

export async function getReviews(slug: string): Promise<Review[]> {
  if (MOCK) {
    const all: Review[] = JSON.parse(window.localStorage.getItem(LS_REV) ?? "[]");
    return all.filter((r) => r.product_slug === slug);
  }
  const { data } = await supabase()!.from("reviews").select("user_email,product_slug,stars,body,created_at").eq("product_slug", slug).order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

export async function addReview(slug: string, stars: number, body: string): Promise<string | null> {
  const u = await getUser();
  if (!u) return "not-signed-in";
  const bought = (await myPurchases()).includes(slug);
  if (!bought) return "not-a-buyer";
  if (MOCK) {
    const all: Review[] = JSON.parse(window.localStorage.getItem(LS_REV) ?? "[]");
    all.unshift({ user_email: u.email, product_slug: slug, stars, body, created_at: new Date().toISOString() });
    window.localStorage.setItem(LS_REV, JSON.stringify(all));
    return null;
  }
  const { data: userData } = await supabase()!.auth.getUser();
  const { error } = await supabase()!.from("reviews").insert({
    user_id: userData.user!.id, user_email: u.email, product_slug: slug, stars, body,
  });
  return error ? error.message : null;
}

// ---------- DSGVO: Betroffenenrechte (Art. 15 Auskunft, Art. 17 Löschung) ----------
export type MyData = { email: string; purchases: string[]; reviews: Review[] };

// Auskunft: zeigt genau das, was zu diesem Konto gespeichert ist (E-Mail, Käufe, eigene Bewertungen).
export async function myData(): Promise<MyData | null> {
  const u = await getUser();
  if (!u) return null;
  const purchases = await myPurchases();
  let reviews: Review[];
  if (MOCK) {
    const all: Review[] = JSON.parse(window.localStorage.getItem(LS_REV) ?? "[]");
    reviews = all.filter((r) => r.user_email === u.email);
  } else {
    const { data } = await supabase()!
      .from("reviews")
      .select("user_email,product_slug,stars,body,created_at")
      .eq("user_email", u.email)
      .order("created_at", { ascending: false });
    reviews = (data as Review[]) ?? [];
  }
  return { email: u.email, purchases, reviews };
}

// Löschung: Mock löscht alles im Browser. Echt-Modus löscht die eigenen Bewertungen (RLS "reviews_delete_own"
// erlaubt das über auth.uid() = user_id) und meldet ab. Der Auth-User selbst kann vom Client aus NICHT gelöscht
// werden (kein Service-Role-Schlüssel im Browser) — das muss der Betreiber übernehmen, daher "real" mit
// Hinweis auf Bestätigung per E-Mail statt einer stillen Vortäuschung vollständiger Löschung.
export async function deleteMyData(): Promise<"not-signed-in" | "mock" | "real"> {
  const u = await getUser();
  if (!u) return "not-signed-in";
  if (MOCK) {
    window.localStorage.removeItem(LS_USER);
    window.localStorage.removeItem(LS_PURCH);
    const all: Review[] = JSON.parse(window.localStorage.getItem(LS_REV) ?? "[]");
    window.localStorage.setItem(LS_REV, JSON.stringify(all.filter((r) => r.user_email !== u.email)));
    return "mock";
  }
  const { data: userData } = await supabase()!.auth.getUser();
  if (userData.user) {
    await supabase()!.from("reviews").delete().eq("user_id", userData.user.id);
  }
  await supabase()!.auth.signOut();
  return "real";
}
