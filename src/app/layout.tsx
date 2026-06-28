import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthRecoveryRedirect } from "@/components/auth-recovery-redirect";
import { CookieConsentManager } from "@/components/cookie-consent-manager";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevRoulotte",
  description:
    "Il networking, senza appuntamenti. Piano Free e Premium.",
};

const themeScript = `
try {
  var mode = localStorage.getItem("devroulotte_theme") === "sun" ? "sun" : "moon";
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === "sun" ? "light" : "dark";
} catch (_) {
  document.documentElement.dataset.theme = "moon";
  document.documentElement.style.colorScheme = "dark";
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      data-theme="moon"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
        <AuthRecoveryRedirect />
        <GoogleAnalytics />
        <CookieConsentManager />
      </body>
    </html>
  );
}
