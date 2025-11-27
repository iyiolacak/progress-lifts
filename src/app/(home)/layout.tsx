"use client";
import Footer from "./Footer";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTop } = useEntryFormPosition();
  return (
    <div className="min-h-screen flex flex-col">
      {/* ---------- Header ---------- */}
      <Header />

      {/* ---------- Main ---------- */}
      <main
        className={cn(
          "flex-1 h-screen p-6 overflow-y-auto",
          !isTop && "pb-28"
        )}
      >
        {children}
      </main>

      {/* ---------- Footer ---------- */}
      <Footer />
    </div>
  );
}
