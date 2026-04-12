import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata = {
  title: "Star Academic School",
  description: "Star Academic School – Natiapara, Delduar, Tangail",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
