import { Manrope } from "next/font/google";
import "./theme.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--beauty-font",
});

export const metadata = {
  title: "Eisha's Beauty — Skincare & Beauty Products in Pakistan",
  description:
    "Shop skincare, makeup, and beauty rituals from Eisha's Beauty — quality beauty products online in Pakistan, delivered nationwide.",
};

export default function BeautyLayout({ children }) {
  return <div className={`beauty-theme ${manrope.variable}`}>{children}</div>;
}
