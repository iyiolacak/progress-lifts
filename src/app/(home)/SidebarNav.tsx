"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Beaker, Bug, Dock, Search, Settings2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProdAtLocalhostLogo from "@/components/Logo";

const navItems = [
  {
    title: "Now",
    href: "/",
    icon: Activity,
  },
  {
    title: "Design Lab",
    href: "/design-demo",
    icon: Beaker,
  },
  {
    title: "Debug Console",
    href: "/debug",
    icon: Bug,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings2,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { isTop, setPos } = useEntryFormPosition();
  const { toggleSidebar } = useSidebar();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.title.toLowerCase().includes(q));
  }, [query]);

  // Keyboard shortcuts for search modal
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      const isP = event.key.toLowerCase() === "p";
      if ((isK || isP) && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
    }
  }, [searchOpen]);

  const toggleEntryDock = () => setPos(isTop ? "bottom" : "top");

  return (
    <>
      <Sidebar
        collapsible="icon"
        className={cn(
          "z-12 border-border/80 overflow-y-hidden",
          isTop && "md:pt-[var(--navbar-height)]",
          isTop &&
            "md:[&_[data-slot=sidebar-container]]:top-[var(--navbar-height)] md:[&_[data-slot=sidebar-container]]:h-[calc(100svh-var(--navbar-height))]"
        )}
        style={{
          // Align sidebar tokens with the header/background palette
          "--sidebar": "var(--background)",
          "--sidebar-foreground": "var(--foreground)",
          "--sidebar-border": "var(--border)",
          "--sidebar-ring": "var(--ring)",
          "--sidebar-accent": "var(--muted)",
          "--sidebar-accent-foreground": "var(--foreground)",
          "--sidebar-primary": "var(--primary)",
          "--sidebar-primary-foreground": "var(--primary-foreground)",
        }}
      >
        <SidebarContent>
          <SidebarGroup className="pb-3">
            <SidebarGroupLabel className="flex items-center justify-between">
              Search
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSearchOpen(true)}
                  className="justify-between h-11 rounded-lg bg-muted/70 pl-3 pr-4"
                >
        <Search className="h-4 w-4" />
        Search tasks...
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
                      </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <Separator className="opacity-50"/>
          <SidebarGroup>
            {/* <SidebarGroupLabel>Navigation</SidebarGroupLabel> */}
            <SidebarMenu className="gap-2 ml-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <div key={item.title}>
                    <div className="bg-product-card rounded-lg size-14"></div>
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleEntryDock}>
                <Dock />
                <span>Dock entry bar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="md:hidden">
              <SidebarMenuButton onClick={toggleSidebar}>
                <span className="text-sm">Collapse</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-3xl border-border/80 bg-background/90 p-0 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-border/70 px-4 pb-4 pt-4 sm:px-6">
            <DialogTitle className="text-base font-semibold">
              Search
            </DialogTitle>
            <DialogDescription className="text-xs">
              Jump to a page or find a task — Cmd/Ctrl + K or Cmd/Ctrl + P
            </DialogDescription>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Type to search…"
                className="w-full rounded-lg bg-muted/60 pl-9 pr-4 py-2 text-sm outline-hidden ring-1 ring-border focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-1 px-2 py-2 sm:px-4">
              {filteredNav.length > 0 ? (
                filteredNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                          : "hover:bg-muted/70"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Jump to {item.title}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-lg px-3 py-3 text-sm text-muted-foreground">
                  No matches
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
