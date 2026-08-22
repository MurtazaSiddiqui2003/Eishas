import { Fraunces, Work_Sans } from "next/font/google";
import "./theme.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--apparel-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--apparel-body",
});

export const metadata = {
  title: "Eisha's Collection — Eastern Wear & Clothing Brand in Pakistan",
  description:
    "Shop suits, sarees, and lehngas from Eisha's Collection — a Pakistani eastern wear clothing brand for unstitched and stitched apparel, delivered across Pakistan.",
};

export default function ApparelLayout({ children }) {
  return (
    <div className={`apparel-theme ${display.variable} ${body.variable}`}>
      {children}
    </div>
  );
}
