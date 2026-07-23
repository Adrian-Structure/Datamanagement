"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { asset } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import { MOCK, getUser, signIn, signUp, signOut, myPurchases, myData, deleteMyData, type MyData } from "@/lib/supabase";

const VENDOR_MAIL = "kontakt@BRAND-DOMAIN.tld";

export default function Konto() {
  const { lang, t } = useLang();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<MyData | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleteResult, setDeleteResult] = useState<"" | "mock" | "real">("");
  const [deletedEmail, setDeletedEmail] = useState("");

  const refresh = async () => {
    const u = await getUser();
    setUser(u);
    setPurchases(u ? await myPurchases() : []);
  };
  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    setBusy(true); setErr("");
    const e = mode === "in" ? await signIn(email, pw) : await signUp(email, pw);
    setBusy(false);
    if (e) { setErr(e); return; }
    await refresh();
  };

  // Löschung ist abgeschlossen (Mock) bzw. angestoßen (Real, Konto-Löschung folgt per Betreiber-Mail) —
  // eigene Ansicht, unabhängig vom (jetzt abgemeldeten) Login-Status, damit die Bestätigung sichtbar bleibt.
  if (deleteResult) {
    const mailtoDelete = `mailto:${VENDOR_MAIL}?subject=${encodeURIComponent(`Konto löschen: ${deletedEmail}`)}`;
    return (
      <section className="hero">
        <h1>{t.myDataTitle}</h1>
        {deleteResult === "mock" ? <p className="buy-note">{t.deleteDoneMock}</p> : null}
        {deleteResult === "real" ? (
          <>
            <p className="buy-note">{t.deleteDoneReal}</p>
            <p style={{ marginTop: 12 }}>
              <a className="cta" href={mailtoDelete}>{t.confirmDeletionByMail}</a>
            </p>
          </>
        ) : null}
      </section>
    );
  }

  if (!user) {
    return (
      <section className="hero">
        <h1>{t.accountTitle}</h1>
        <p>{t.accountLoginText}</p>
        {MOCK ? <p className="buy-note" style={{ marginTop: 8 }}>{t.mockNote}</p> : null}
        <div className="account" style={{ maxWidth: 420, margin: "28px auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="searchbox-input" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", font: "inherit" }} />
          <input type="password" placeholder={t.password} value={pw} onChange={(e) => setPw(e.target.value)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", font: "inherit" }} />
          {err ? <p className="buy-note" style={{ color: "#ff8da3" }}>{err}</p> : null}
          <p className="buy-note">
            {t.accountPrivacyNote}{" "}
            <Link href="/datenschutz">{t.privacyLinkLabel}</Link>
          </p>
          <button className="cta" disabled={busy || !email || !pw} onClick={submit}>
            {mode === "in" ? t.signIn : t.signUp}
          </button>
          <button className="cta ghost" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? t.toSignUp : t.toSignIn}
          </button>
        </div>
      </section>
    );
  }

  const owned = PRODUCTS.filter((p) => purchases.includes(p.slug));
  return (
    <>
      <section className="hero">
        <h1>{t.accountTitle}</h1>
        <p>{user.email}</p>
        <p style={{ marginTop: 12 }}>
          <button className="cta ghost" onClick={async () => { await signOut(); await refresh(); }}>{t.signOut}</button>
        </p>
      </section>
      <section className="account" style={{ maxWidth: 420, margin: "0 auto 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{t.myDataTitle}</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="cta ghost"
            onClick={async () => { setShown(shown ? null : await myData()); }}
          >
            {shown ? t.myDataHide : t.myDataShow}
          </button>
          {!confirming ? (
            <button className="cta ghost" style={{ color: "#ff8da3" }} onClick={() => setConfirming(true)}>
              {t.deleteAccount}
            </button>
          ) : null}
        </div>
        {shown ? (
          <div className="card" style={{ padding: "12px 16px" }}>
            <p style={{ margin: "2px 0" }}>{shown.email}</p>
            <p style={{ margin: "2px 0" }}>
              {t.myDataPurchases}: {shown.purchases.length ? shown.purchases.join(", ") : t.myDataNone}
            </p>
            <p style={{ margin: "2px 0" }}>
              {t.myDataReviews}: {shown.reviews.length ? shown.reviews.map((r) => `${r.product_slug} (${r.stars}★)`).join(", ") : t.myDataNone}
            </p>
          </div>
        ) : null}
        {confirming ? (
          <div className="card" style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <p className="buy-note" style={{ margin: 0 }}>{t.deleteConfirmQuestion}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="cta"
                onClick={async () => {
                  const mail = user.email;
                  const res = await deleteMyData();
                  setConfirming(false);
                  setShown(null);
                  if (res === "mock" || res === "real") {
                    setDeletedEmail(mail);
                    setDeleteResult(res);
                  }
                  await refresh();
                }}
              >
                {t.deleteConfirmYes}
              </button>
              <button className="cta ghost" onClick={() => setConfirming(false)}>{t.deleteConfirmNo}</button>
            </div>
          </div>
        ) : null}
      </section>
      <section className="gallery" style={{ paddingTop: 8 }}>
        {owned.length === 0 ? (
          <p className="buy-note">{t.noPurchases}</p>
        ) : owned.map((p) => (
          <Link key={p.slug} href={`/skill/${p.slug}`} className="card">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(p.image)} alt={p.title[lang]} className="thumb" />
            ) : (
              <div className="thumb-fallback" style={{ background: p.color }}>★</div>
            )}
            <div className="body">
              <span className="title">{p.title[lang]}</span>
              <span className="badge new">{t.owned}</span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
