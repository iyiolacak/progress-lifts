"use client";
import type { CSSProperties } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

const NAVBAR_HEIGHT = "5.5rem";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTop } = useEntryFormPosition();
  return (
    <SidebarProvider>
      <div
        className="flex flex-col w-full h-full"
        style={{ "--navbar-height": NAVBAR_HEIGHT } as CSSProperties}
      >
        <Header />
        <div>
          <SidebarNav />
          <SidebarInset>
            <div className="min-h-screen w-full flex flex-col">
              {/* ---------- Header ---------- */}

              {/* ---------- Main ---------- */}
              <section
                className={cn("flex-1 p-6 overflow-y-auto", !isTop && "pb-28")}
              >
                {children}
                <Footer />
              </section>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
