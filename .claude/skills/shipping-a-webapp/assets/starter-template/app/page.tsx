"use client";
import { useRef } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";

export default function Home() {
  const { lang, t } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopVoice = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };
  const playVoice = (src?: string) => {
    if (!src) return;
    stopVoice();
    const a = new Audio(asset(src));
    audioRef.current = a;
    a.volume = 0.9;
    a.play().catch(() => {}); // Browser-Autoplay-Schutz: erst nach erster Nutzer-Interaktion hoerbar
  };
  return (
    <>
      <section className="hero">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
      </section>
      <section className="gallery">
        {PRODUCTS.map((p) => (
          <Link key={p.slug} href={`/skill/${p.slug}`} className="card" onMouseEnter={() => playVoice(p.voice[lang])} onMouseLeave={stopVoice}>
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(p.image)} alt={p.title[lang]} className="thumb" />
            ) : (
              <div className="thumb-fallback" style={{ background: p.color }}>
                ★
              </div>
            )}
            <div className="body">
              <span className="step" style={{ color: p.color }}>
                {p.step ? `${t.step} ${p.step}/12` : ""}
                {p.extra ? <span className="badge new">{t.extraBadge}</span> : null}
              </span>
              <span className="title">{p.title[lang]}</span>
              <span className="desc">{p.desc[lang].slice(0, 140)}…</span>
              <div className="foot">
                <span className={p.price ? "price" : "price tbd"}>
                  {p.price ? `${p.price} €` : t.priceTbd}
                </span>
                <span className="cta ghost">{p.price ? t.buy : t.inquire}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
