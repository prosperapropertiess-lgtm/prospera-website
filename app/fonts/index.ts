// Fonts are stored in the repo (latin subsets from Google Fonts) instead of fetched
// at build time. next/font/google kept failing Vercel builds when Google was slow.
import localFont from "next/font/local";

export const outfit = localFont({
  src: "./outfit-300-700.woff2",
  weight: "300 700",
  variable: "--font-cormorant",
  display: "swap",
});

export const inter = localFont({
  src: "./inter-400-600.woff2",
  weight: "400 600",
  variable: "--font-dm-sans",
  display: "swap",
});

export const poppins = localFont({
  src: [
    { path: "./poppins-300.woff2", weight: "300" },
    { path: "./poppins-400.woff2", weight: "400" },
    { path: "./poppins-500.woff2", weight: "500" },
    { path: "./poppins-600.woff2", weight: "600" },
    { path: "./poppins-700.woff2", weight: "700" },
    { path: "./poppins-800.woff2", weight: "800" },
  ],
  variable: "--font-poppins",
  display: "swap",
});
