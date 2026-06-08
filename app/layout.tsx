import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { VoiceCallWidget } from "@/components/VoiceCallWidget";
import { ImmersiveLayout } from "@/components/immersive/ImmersiveLayout";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEALFLOW AI — GTM & Revenue Operations",
  description:
    "Pipeline intelligence, GTM analysis, and autonomous sales agents built for revenue teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${serif.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cal.com" />
        <link rel="dns-prefetch" href="https://cal.com" />
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <link rel="preload" as="script" href="https://app.cal.com/embed/embed.js" />
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="dns-prefetch" href="https://calendly.com" />
      </head>
      <body
        className={`${sans.variable} min-h-screen bg-[#060612] font-sans text-foreground antialiased flex flex-col`}
      >
        {/* Skip to content — WCAG 2.1 AA accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ImmersiveLayout
          header={<Header />}
          footer={<Footer />}
        >
          <div id="main-content">
            {children}
          </div>
        </ImmersiveLayout>
        
        <AIChatAssistant />
      <VoiceCallWidget />
      </body>
    </html>
  );
}
