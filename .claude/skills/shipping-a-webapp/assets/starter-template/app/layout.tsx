import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Chrome from "./chrome";

export const metadata: Metadata = {
  title: "BRAND-NAME — Shop",
  description:
    "Claude-Skills für die FPGA-Fabrik: 13 fertige Arbeitspakete vom Python-Gedanken bis zum gemessenen Board.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <LangProvider>
          <Chrome>{children}</Chrome>
        </LangProvider>
      </body>
    </html>
  );
}
