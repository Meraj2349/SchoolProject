import { Hind_Siliguri, Noto_Serif, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

// Self-hosted by next/font at build time. Hind Siliguri covers Bangla and
// Latin body text; the serif pair gives headings a classic, formal look.
const bodyFont = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const headingFont = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-heading", display: "swap" });
const headingFontBn = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["500", "700"],
  variable: "--font-heading-bn",
  display: "swap",
});

export const metadata = {
  title: "Star Shikkha Poribar",
  description: "Star Shikkha Poribar – Natiapara, Delduar, Tangail",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${bodyFont.variable} ${headingFont.variable} ${headingFontBn.variable}`}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
