"use client"; // because we touch window / AudioContext

import React from "react";
import { Howl } from "howler";

// ------------------------------------------------------------------
//  ⚙️  CONFIGURATION
// ------------------------------------------------------------------

/** A tiny registry describing every SFX in your app.
 *  (Move to JSON if you want non‑TS devs to edit it.)
 */
export const SFX_MAP = {
  hover: { src: "/sfx/casual_pop.mp3", volume: 0.4 },
  click: { src: "/sfx/button_click.mp3", volume: 0.55 },
  click_2: { src: "/sfx/click_2.mp3", volume: 0.55 },
  popup: { src: "/sfx/pop_up.mp3", volume: 0.4 },
  switch: { src: "/sfx/switch.mp3", volume: 1 },
  switch_2: { src: "/sfx/switch_1.mp3", volume: 0.55 },
    punchy_tap: { src: "/sfx/punchy_tap.mp3", volume: 0.55 },
    game_start: { src: "/sfx/game_start.mp3", volume: 0.55 },

} as const;

type SfxKey = keyof typeof SFX_MAP;

// ------------------------------------------------------------------
//  CONTEXT
// ------------------------------------------------------------------

type SfxContextShape = {
  /** Play by key, e.g. play("hover") */
  play: (key: SfxKey) => void;
  /** Global mute / un‑mute */
  soundEnabled: boolean;
  toggleSound: () => void;
};

const SfxContext = React.createContext<SfxContextShape | null>(null);

// ------------------------------------------------------------------
//  PROVIDER (mount once at root)
// ------------------------------------------------------------------

export function SfxProvider({ children }: { children: React.ReactNode }) {
  /* 1.  Persist user preference in localStorage ------------------- */
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem("soundEnabled");
    return raw == null ? true : raw === "true";
  });

  const toggleSound = React.useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem("soundEnabled", String(next));
      return next;
    });
  }, []);

  /* 2.  Pre‑decode every SFX exactly once ------------------------- */
  const howlsRef = React.useRef<Record<SfxKey, Howl> | null>(null);
  if (!howlsRef.current) {
    howlsRef.current = Object.entries(SFX_MAP).reduce((acc, [key, cfg]) => {
      acc[key as SfxKey] = new Howl({
        src: [cfg.src], // accept .ogg fallback via `/sfx/*.ogg` if present
        volume: cfg.volume,
        preload: true,
        html5: false, // keep in WebAudio for ultra‑low latency
      });
      return acc;
    }, {} as Record<SfxKey, Howl>);
  }

  /* 3.  Imperative play helper ------------------------------------ */
  const play = React.useCallback(
    (key: SfxKey) => {
      const howl = howlsRef.current![key];
      if (!howl) return;
      if (soundEnabled) {
        /* interrupt == true (stop previous) for UI snappiness */
        howl.stop();
        howl.play();
      }
    },
    [soundEnabled]
  );

  /* 4.  Compose context value just once --------------------------- */
  const value = React.useMemo(
    () => ({ play, soundEnabled, toggleSound }),
    [play, soundEnabled, toggleSound]
  );

  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}

// ------------------------------------------------------------------
//  🪝  HOOK (use anywhere)  ----------------------------------------
// ------------------------------------------------------------------

/** Example: const { play } = useSfx();  play("hover") */
export function useSfx() {
  const ctx = React.useContext(SfxContext);
  if (!ctx) throw new Error("useSfx must be inside <SfxProvider>");
  return ctx;
}

/** One‑liner sugar for common sounds */
export function useHoverClickSounds(): {
  onMouseEnter: () => void;
  onClick: () => void;
  switch: () => void;
  punchyTap: () => void;
} {
  const { play } = useSfx();
  return {
    onMouseEnter: () => play("hover"),
    onClick: () => play("click_2"),
    switch: () => play("switch_2"),
    punchyTap: () => play("punchy_tap"),
  };
}
