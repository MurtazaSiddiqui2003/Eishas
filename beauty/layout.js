import { Manrope } from "next/font/google";
import "./theme.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--beauty-font",
});

export const metadata = {
  title: "Eisha's Beauty",
  description: "Skincare and beauty rituals from Eisha's Beauty.",
};

export default function BeautyLayout({ children }) {
  return <div className={`beauty-theme ${manrope.variable}`}>{children}</div>;
}
