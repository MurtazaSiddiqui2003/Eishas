import { Bodoni_Moda, Jost } from "next/font/google";
import "./theme.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--jewelry-display",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--jewelry-body",
});

export const metadata = {
  title: "Eisha's Jewelry",
  description: "Earrings, sets, and bangles from Eisha's Jewelry.",
};

export default function JewelryLayout({ children }) {
  return (
    <div className={`jewelry-theme ${display.variable} ${body.variable}`}>
      {children}
    </div>
  );
}
