import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kulmis Academy — Learn to build with AI",
  description: "Master Vibe Coding, AI Agents, and modern development. Short, practical lessons in English, Somali, and Arabic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('kulmis-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');var l=localStorage.getItem('kulmis_lang');if(l==='ar'){document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');}else if(l==='so'){document.documentElement.setAttribute('lang','so');}}catch(e){}})();` }} />
      </head>
      <body className="antialiased"><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
