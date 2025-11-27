import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { APP_FULL_TITLE } from "@/lib/appInfo";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-family-inter",
});

export const metadata: Metadata = {
  title: APP_FULL_TITLE,
  description: "A local-first, frictionless, gamified productivity tool",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      style={{ ["--font-family-inter" as string]: inter.style.fontFamily }}
    >
      <body className={`antialiased font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
