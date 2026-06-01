import type { Metadata } from "next";
import { Noto_Sans_JP, Playfair_Display } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "大阪金融マッチング | MoneyFind",
  description: "大阪府内の金融会社を探せるマッチングサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ja"
        className={`${notoSansJP.variable} ${playfairDisplay.variable} h-full antialiased`}
      >
        <body className="h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
