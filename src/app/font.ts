import { JetBrains_Mono, Lato } from "next/font/google";

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const lato = Lato({
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: "--font-lato",
});
