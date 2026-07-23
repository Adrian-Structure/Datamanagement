"use client";
import Link from "next/link";
import { PRODUCTS, bySlug } from "@/lib/products";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { useEffect, useState } from "react";
import { MOCK, getUser, myPurchases, mockBuy, getReviews, addReview, type Review } from "@/lib/supabase";

const VENDOR_MAIL = "kontakt@BRAND-DOMAIN.tld";

export default function SkillView({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const p = bySlug(slug);

  if (!p) {
    return (
      <section className="hero">
        <h1>{t.notFound}</h1>
        <p style={{ marginTop: 16 }}>
          <Link href="/" className="cta">
            {t.toStore}
          </Link>
        </p>
      </section>
    );
  }

  const related = PRODUCTS.filter((r) => r.slug !== p.slug).slice(0, 3);
  const mailto = `mailto:${VENDOR_MAIL}?subject=${encodeURIComponent(`Skill: ${p.slug}`)}`;

  return (
    <>
      <Link href="/" className="crumb">
        {t.back}
      </Link>
      <section className="detail">
        <div className="visual">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(p.image)} alt={p.title[lang]} />
          ) : (
            <div className="thumb-fallback" style={{ background: p.color, aspectRatio: "16/10" }}>
              ★
            </div>
          )}
        </div>
        <div>
          <span className="step" style={{ color: p.color }}>
            {p.step ? `${t.step} ${p.step}/12` : null}
            {p.extra ? <span className="badge new">{t.extraBadge}</span> : null}
          </span>
          <h1>{p.title[lang]}</h1>
          <p className="desc">{p.desc[lang]}</p>
          {p.voice[lang] ? (
            <div className="audio">
              <span className="step">{t.listen}</span>
              <audio controls preload="none" src={asset(p.voice[lang])} />
            </div>
          ) : null}
          <div className="buyrow">
            <span className={p.price ? "price" : "price tbd"}>
              {p.price ? `${p.price} €` : t.priceTbd}
            </span>
            <a className="cta" href={mailto}>
              {p.price ? t.buy : t.inquire}
            </a>
          </div>
          <p className="buy-note">{t.inquireNote}</p>
        </div>
      </section>
      <ReviewBlock slug={p.slug} />
      <section className="related">
        <h2>{t.related}</h2>
        <div className="gallery" style={{ padding: 0 }}>
          {related.map((r) => (
            <Link key={r.slug} href={`/skill/${r.slug}`} className="card">
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(r.image)} alt={r.title[lang]} className="thumb" />
              ) : (
                <div className="thumb-fallback" style={{ background: r.color }}>
                  ★
                </div>
              )}
              <div className="body">
                <span className="title">{r.title[lang]}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Stars({ n }: { n: number }) {
  return <span style={{ color: "var(--accent)" }}>{"★".repeat(n)}<span style={{ color: "var(--muted)" }}>{"★".repeat(5 - n)}</span></span>;
}

function ReviewBlock({ slug }: { slug: string }) {
  const { t } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    setReviews(await getReviews(slug));
    const u = await getUser();
    setSignedIn(!!u);
    setCanWrite(!!u && (await myPurchases()).includes(slug));
  };
  useEffect(() => { refresh(); }, [slug]);

  const submit = async () => {
    const e = await addReview(slug, stars, body.trim());
    if (e) { setMsg(e === "not-a-buyer" ? t.notBuyer : e); return; }
    setBody(""); setMsg(""); await refresh();
  };

  return (
    <section className="related" style={{ paddingBottom: 24 }}>
      <h2>{t.reviews} ({reviews.length})</h2>
      {reviews.length === 0 ? <p className="buy-note">{t.noReviews}</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
          {reviews.map((r, i) => (
            <div key={i} className="card" style={{ padding: "12px 16px" }}>
              <Stars n={r.stars} />
              <p style={{ margin: "6px 0 4px" }}>{r.body}</p>
              <span className="buy-note">{r.user_email.replace(/(.{2}).*(@.*)/, "$1…$2")} · {new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
      {canWrite ? (
        <div style={{ marginTop: 16, maxWidth: 720, display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="step">{t.writeReview}</span>
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}
                style={{ background: "none", border: 0, cursor: "pointer", fontSize: "1.4rem", color: n <= stars ? "var(--accent)" : "var(--muted)" }}>★</button>
            ))}
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.reviewPlaceholder} rows={3} maxLength={2000}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", font: "inherit", resize: "vertical" }} />
          <p className="buy-note" style={{ margin: 0 }}>{t.reviewPrivacyNote}</p>
          {msg ? <p className="buy-note" style={{ color: "#ff8da3" }}>{msg}</p> : null}
          <button className="cta" style={{ alignSelf: "flex-start" }} disabled={!body.trim()} onClick={submit}>{t.submitReview}</button>
        </div>
      ) : signedIn ? (
        <p className="buy-note" style={{ marginTop: 12 }}>
          {t.notBuyer}{" "}
          {MOCK ? <button className="cta ghost" style={{ marginLeft: 8 }} onClick={async () => { await mockBuy(slug); await refresh(); }}>{t.mockBuy}</button> : null}
        </p>
      ) : null}
    </section>
  );
}
