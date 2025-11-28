"use client";

import React from "react";
import { Command } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/localdb/store/appPreferences";
import { Separator } from "@/components/ui/separator";

type Shortcut = {
  title: string;
  description?: string;
  keys?: string[][];
  macKeys?: string[][];
  winKeys?: string[][];
  dimmed?: boolean;
};

const isTextInput = (element: EventTarget | null) => {
  const target = element as HTMLElement | null;
  return Boolean(
    target?.closest("input, textarea, [contenteditable=true], select")
  );
};

const useIsMac = () => {
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    const platform = typeof navigator !== "undefined" ? navigator.platform : "";
    const macLike = /mac|iphone|ipad|ipod/i.test(platform);
    setIsMac(macLike);
  }, []);

  return isMac;
};

type KeyboardShortcutsProps = {
  showHintCard?: boolean;
  className?: string;
};

export function KeyboardShortcuts({
  showHintCard,
  className,
}: KeyboardShortcutsProps) {
  const [open, setOpen] = React.useState(false);
  const isMac = useIsMac();
  const focusSettings = useAppSettings(
    useShallow((s) => ({
      enabled: s.enableEntryFocusShortcuts,
      slash: s.focusShortcutSlash,
      enter: s.focusShortcutEnter,
      typeToFocus: s.focusShortcutTypeToFocus,
      cmdJ: s.focusShortcutCmdJ,
    }))
  );

  const focusCombos = React.useMemo(() => {
    if (!focusSettings.enabled) return [];
    const combos: string[][] = [];
    if (focusSettings.slash) combos.push(["/"]);
    if (focusSettings.enter) combos.push(["Enter"]);
    if (focusSettings.cmdJ) combos.push(isMac ? ["⌘", "J"] : ["Ctrl", "J"]);
    if (focusSettings.typeToFocus) combos.push(["Any key"]);
    return combos;
  }, [
    focusSettings.cmdJ,
    focusSettings.enabled,
    focusSettings.enter,
    focusSettings.slash,
    focusSettings.typeToFocus,
    isMac,
  ]);

  const shortcuts = React.useMemo<Shortcut[]>(() => {
    const list: Shortcut[] = [
      {
        title: "Search everywhere",
        description: "Open the navigation search dialog.",
        macKeys: [
          ["⌘", "K"],
          ["⌘", "P"],
        ],
        winKeys: [
          ["Ctrl", "K"],
          ["Ctrl", "P"],
        ],
      },
      {
        title: "Toggle sidebar",
        description: "Show or hide the sidebar.",
        macKeys: [["⌘", "B"]],
        winKeys: [["Ctrl", "B"]],
      },
    ];

    list.push({
      title: "Focus entry bar",
      description: focusSettings.enabled
        ? "Jump into the command bar without touching the mouse."
        : "Turn on fast focus shortcuts in Settings to use these.",
      keys: focusCombos.length ? focusCombos : [["—"]],
      dimmed: !focusSettings.enabled,
    });

    return list;
  }, [focusCombos, focusSettings.enabled]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isQuestionMark =
        event.key === "?" || (event.key === "/" && event.shiftKey);
      if (!isQuestionMark) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTextInput(event.target)) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {showHintCard && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group w-full rounded-xl px-4 py-4 text-left shadow-sm transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            className
          )}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground/10 text-foreground/80 shadow-inner ring-1 ring-border/60">
                <Command className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-base tracking-normal font-semibold text-foreground">
                Keyboard shortcuts
              </div>
              <p className="text-sm text-muted-foreground">
                Learn the keyboard commands by pressing{" "}
                <Kbd className="h-5 min-w-5 px-1 text-[11px] leading-none">
                  ?
                </Kbd>
                .
              </p>
            </div>
          </div>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-background text-foreground shadow-xl shadow-black/25">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground/80 ring-1 ring-border/60">
                <Command className="h-5 w-5" strokeWidth={1.4} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-semibold">
                  Keyboard shortcuts
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Press{" "}
                  <Kbd className="h-5 min-w-5 px-1 text-[11px]">?</Kbd> anytime
                  to reopen this list.
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-muted/80 px-2 py-1">
                {isMac ? "Showing Mac shortcuts" : "Showing Windows/Linux shortcuts"}
              </span>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {shortcuts.map((shortcut, idx) => (
              <React.Fragment key={shortcut.title}>
                {idx > 0 && <Separator className="bg-border/70" />}
                <ShortcutRow isMac={isMac} {...shortcut} />
              </React.Fragment>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ShortcutRow({
  title,
  description,
  keys,
  macKeys,
  winKeys,
  dimmed,
  isMac,
}: Shortcut & { isMac: boolean }) {
  const combos =
    keys ?? (isMac ? macKeys ?? winKeys ?? [] : winKeys ?? macKeys ?? []);
  const displayCombos = combos
    .map((combo) => combo.filter(Boolean))
    .filter((combo) => combo.length > 0);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-1 py-2",
        dimmed && "opacity-60"
      )}
    >
      <div className="space-y-1">
        <div className="text-[15px] font-semibold leading-tight">{title}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center whitespace-nowrap justify-end gap-2 pr-1">
        {displayCombos.map((combo) => (
          <Kbd
            key={combo.join("+")}
            className="h-6 px-2 text-[11px] leading-none uppercase"
          >
            {combo.join(" + ")}
          </Kbd>
        ))}
      </div>
    </div>
  );
}
