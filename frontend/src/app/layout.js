import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata = {
  title: "Star Shikkha Poribar",
  description: "Star Shikkha Poribar – Natiapara, Delduar, Tangail",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
