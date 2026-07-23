"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

export default function Chrome({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLang();
  const path = usePathname();
  return (
    <>
      <header className="wrap">
        <nav className="nav">
          <span className="brand">{t.brand}</span>
          <Link href="/" className={`navlink${path === "/" ? " active" : ""}`}>
            {t.navStore}
          </Link>
          <Link href="/konto" className={`navlink${path === "/konto" ? " active" : ""}`}>
            {t.navAccount}
          </Link>
          <span className="spacer" />
          <div className="langswitch" role="group" aria-label="Sprache / Language">
            <button className={lang === "de" ? "on" : ""} onClick={() => setLang("de")}>
              DE
            </button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
        </nav>
      </header>
      <main className="wrap">{children}</main>
      <footer className="wrap">
        <div className="footer">
          <span>© 2026 BRAND-NAME</span>
          <span className="spacer" />
          <nav className="legallinks" aria-label="Rechtliches / Legal">
            <Link href="/impressum" className={path === "/impressum" ? "active" : ""}>
              {t.footerImpressum}
            </Link>
            <Link href="/datenschutz" className={path === "/datenschutz" ? "active" : ""}>
              {t.footerDatenschutz}
            </Link>
            <Link href="/agb" className={path === "/agb" ? "active" : ""}>
              {t.footerAgb}
            </Link>
            <Link href="/widerruf" className={path === "/widerruf" ? "active" : ""}>
              {t.footerWiderruf}
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
