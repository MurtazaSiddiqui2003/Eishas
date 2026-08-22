import "./globals.css";
import Providers from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eisha's — Eastern Wear, Beauty & Jewelry in Pakistan",
    template: "%s | Eisha's",
  },
  description:
    "Eisha's is a Pakistani clothing brand for eastern wear, beauty, and jewelry — sarees, lehngas, suits, skincare, and fine jewelry, all in one house. Shop online with delivery across Pakistan.",
  keywords: [
    "clothing brand in Pakistan",
    "eastern wear Pakistan",
    "online clothing store Pakistan",
    "sarees Pakistan",
    "lehnga online Pakistan",
    "beauty products Pakistan",
    "jewelry online Pakistan",
  ],
  openGraph: {
    siteName: "Eisha's",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
  },
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
