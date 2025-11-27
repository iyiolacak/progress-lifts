"use client";
import Footer from "./Footer";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTop } = useEntryFormPosition();
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          {/* ---------- Header ---------- */}
          <Header />

          {/* ---------- Main ---------- */}
          <section
            className={cn("flex-1 p-6 overflow-y-auto", !isTop && "pb-28")}
          >
            {children}
            <Footer />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
