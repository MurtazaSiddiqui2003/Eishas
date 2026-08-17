import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Eisha's",
  description:
    "Eisha's — Apparel, Beauty, and Jewelry. Three worlds, one house.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts for the main landing shell. Each store loads its own
            fonts inside its own layout so pages don't pay for fonts
            they don't use. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
