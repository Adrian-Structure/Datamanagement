"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "de" | "en";

const STRINGS = {
  de: {
    brand: "BRAND-NAME — Shop",
    navStore: "Shop",
    navAccount: "Meine Käufe",
    heroTitle: "BRAND-CLAIM — replaced during individualization",
    heroText:
      "Die FPGA-Fabrik in 13 Skills: vom ersten Python-Gedanken bis zum gemessenen Board. Jeder Skill ist ein fertiges Arbeitspaket für Ihren Claude — anhören, ansehen, einsetzen.",
    step: "Schritt",
    extraBadge: "Zusatz-Skill",
    priceTbd: "Preis folgt",
    buy: "Jetzt kaufen",
    inquire: "Lizenz anfragen",
    inquireNote: "Kauf per E-Mail-Anfrage — Antwort werktags.",
    listen: "Hörprobe",
    back: "← Zurück zum Shop",
    related: "Verwandte Skills",
    accountTitle: "Meine Käufe",
    accountText:
      "Konto und Kaufliste werden mit dem Bezahl-Anbieter freigeschaltet (Phase 3). Bis dahin laufen Käufe per E-Mail-Anfrage.",
    accountLoginText:
      "Melden Sie sich an, um Ihre Käufe und Downloads zu sehen. Nach jedem Kauf erscheint Ihr Skill automatisch hier.",
    mockNote: "Demo-Modus: läuft noch ohne echtes Konto-System — alles klickbar, Daten bleiben nur in diesem Browser.",
    password: "Passwort",
    signIn: "Anmelden",
    signUp: "Konto erstellen",
    toSignUp: "Neu hier? Konto erstellen",
    toSignIn: "Schon ein Konto? Anmelden",
    signOut: "Abmelden",
    noPurchases: "Noch keine Käufe — nach dem ersten Kauf erscheint Ihr Skill hier automatisch.",
    owned: "Gekauft",
    reviews: "Bewertungen",
    writeReview: "Bewertung schreiben (nur für Käufer)",
    reviewPlaceholder: "Wie hat der Skill Ihnen geholfen?",
    submitReview: "Absenden",
    noReviews: "Noch keine Bewertungen.",
    notBuyer: "Nur Käufer können bewerten.",
    mockBuy: "Demo-Testkauf",
    footerLegal: "Impressum · Datenschutz · AGB · Widerruf folgen vor dem Live-Gang.",
    footerImpressum: "Impressum",
    footerDatenschutz: "Datenschutz",
    footerAgb: "AGB",
    footerWiderruf: "Widerruf",
    notFound: "Diesen Skill haben wir nicht gefunden.",
    toStore: "Zum Shop",
    accountPrivacyNote:
      "Für Konto und Kaufliste speichern wir Ihre E-Mail-Adresse sowie — beim Anbieter — ein Passwort als Hash. Zweck: Anmeldung und Zuordnung Ihrer Käufe. Speicherort: Supabase, EU/Frankfurt; im Demo-Modus bleiben die Daten nur in diesem Browser.",
    privacyLinkLabel: "Datenschutzerklärung",
    myDataTitle: "Meine Daten",
    myDataShow: "Daten anzeigen",
    myDataHide: "Daten ausblenden",
    myDataPurchases: "Käufe",
    myDataReviews: "Bewertungen",
    myDataNone: "keine",
    deleteAccount: "Konto & Daten löschen",
    deleteConfirmQuestion: "Wirklich alle Ihre Daten löschen? Das kann nicht rückgängig gemacht werden.",
    deleteConfirmYes: "Ja, löschen",
    deleteConfirmNo: "Abbrechen",
    deleteDoneMock: "Erledigt: alle in diesem Browser gespeicherten Daten wurden gelöscht.",
    deleteDoneReal:
      "Ihre Bewertungen wurden gelöscht und Sie wurden abgemeldet. Aus technischen Gründen kann nur der Betreiber Ihr Konto vollständig löschen — bitte bestätigen Sie die Löschung per E-Mail.",
    confirmDeletionByMail: "Löschung per E-Mail bestätigen",
    reviewPrivacyNote:
      "Ihre Bewertung wird veröffentlicht; die E-Mail-Adresse wird dabei teil-anonymisiert angezeigt (z. B. ro…@domain.de).",
  },
  en: {
    brand: "BRAND-NAME — Shop",
    navStore: "Shop",
    navAccount: "My purchases",
    heroTitle: "Claude skills that do the work",
    heroText:
      "The FPGA factory in 13 skills: from the first Python thought to the measured board. Each skill is a ready-to-use work package for your Claude — listen, look, deploy.",
    step: "Step",
    extraBadge: "Extra skill",
    priceTbd: "Price to follow",
    buy: "Buy now",
    inquire: "Request a license",
    inquireNote: "Purchase via e-mail request — reply on business days.",
    listen: "Voice sample",
    back: "← Back to shop",
    related: "Related skills",
    accountTitle: "My purchases",
    accountText:
      "Account and purchase list unlock together with the payment provider (phase 3). Until then, purchases run via e-mail request.",
    accountLoginText:
      "Sign in to see your purchases and downloads. After every purchase your skill appears here automatically.",
    mockNote: "Demo mode: running without a real account system yet — fully clickable, data stays in this browser only.",
    password: "Password",
    signIn: "Sign in",
    signUp: "Create account",
    toSignUp: "New here? Create an account",
    toSignIn: "Already have an account? Sign in",
    signOut: "Sign out",
    noPurchases: "No purchases yet — after your first purchase your skill shows up here automatically.",
    owned: "Purchased",
    reviews: "Reviews",
    writeReview: "Write a review (buyers only)",
    reviewPlaceholder: "How did this skill help you?",
    submitReview: "Submit",
    noReviews: "No reviews yet.",
    notBuyer: "Only buyers can review.",
    mockBuy: "Demo test purchase",
    footerLegal: "Imprint · privacy · terms · withdrawal pages follow before going live.",
    footerImpressum: "Imprint",
    footerDatenschutz: "Privacy",
    footerAgb: "Terms",
    footerWiderruf: "Withdrawal",
    notFound: "We could not find this skill.",
    toStore: "To the shop",
    accountPrivacyNote:
      "For your account and purchase list we store your e-mail address and — at the provider — a password as a hash. Purpose: signing in and matching your purchases. Storage location: Supabase, EU/Frankfurt; in demo mode the data stays in this browser only.",
    privacyLinkLabel: "privacy policy",
    myDataTitle: "My data",
    myDataShow: "Show my data",
    myDataHide: "Hide my data",
    myDataPurchases: "Purchases",
    myDataReviews: "Reviews",
    myDataNone: "none",
    deleteAccount: "Delete account & data",
    deleteConfirmQuestion: "Really delete all your data? This cannot be undone.",
    deleteConfirmYes: "Yes, delete",
    deleteConfirmNo: "Cancel",
    deleteDoneMock: "Done: all data stored in this browser has been deleted.",
    deleteDoneReal:
      "Your reviews have been deleted and you have been signed out. For technical reasons only the operator can fully delete your account — please confirm the deletion via e-mail.",
    confirmDeletionByMail: "Confirm deletion via e-mail",
    reviewPrivacyNote:
      "Your review will be published; the e-mail address shown will be partly anonymized (e.g. ro…@domain.de).",
  },
} as const;

type Strings = { [K in keyof (typeof STRINGS)["de"]]: string };
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Strings };
const LangCtx = createContext<Ctx>({ lang: "de", setLang: () => {}, t: STRINGS.de });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");
  useEffect(() => {
    const saved = window.localStorage.getItem("shop-lang");
    if (saved === "en" || saved === "de") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("shop-lang", l);
  };
  return <LangCtx.Provider value={{ lang, setLang, t: STRINGS[lang] }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
