# Progress Lifts

If you've ever dropped a to‑do app because it became a chore, Progress Lifts is the antidote.
Gamified, conventional automatized TODO handling like texting(chat-interface), satisfying and private. 

---

## Why Progress Lifts?

Progress Lifts is the productivity tool for people who hate productivity tools.
![output](https://github.com/user-attachments/assets/f8f0b1d0-abbb-4ca6-b0ec-ba37e9b69e2d)

No clutter. No planning overhead. Just **type what you did or will do next** and press **Enter** — the app handles the rest. Every entry is logged, XP is awarded, and you get a sharp, actionable next step from an LLM **you control**.

**The magic:**

* **Game‑like momentum**: visible XP, progress animations, streaks. Instant dopamine loop is needed; Standard apps give you a silent checkbox. Progress Lifts gives you immediate visual feedback, XP gain, and streak animations. It gamifies the act of tracking.
* **Privacy by design**: all history, stats, and settings stay on your device.
* **Only one connection**: to the LLM you choose (BYOK OpenAI).
* **Zero busywork**: no grooming lists or shuffling boards.
**Keyboard-Centric Velocity**: App gets ultra fast when you get used to it. 

Capture → Nudge → Do → Reward → Reflect → Repeat

The result: compounding progress without project management ceremony.


---

## Key Features

### Traditional AI App (Centralized)
```
Your Data 
   ↓
App’s Server --- stores + logs ──► Privacy Risk
   ↓
3rd-Party API (OpenAI)
   ↓
App’s Server --- stores again ──► Vendor Lock-in
   ↓
  You
```

### Progress Lifts
```
Your Data
   ↓
Your Device ── stored only here ──► You own it
   ↓
LLM Service (default: OpenAI(BYOK or hosted), or any provider you choose)
   ↓
Your Device ── results kept local ──► No telemetry
```

This is not a To-Do list. It is a "Did-Do" and "Will-Do" Stream. 

* **Ambient Input**: `/` to focus, type, hit Enter — done.
* **Instant Logging**: “Fix login bug” or “Plan Q3 deck” — captured immediately.
* **Next‑Step Suggestions**: LLM proposes the smallest next action to keep you moving.
* **Micro‑feedback & XP**: Celebrate completions with animations and stat boosts.
* **Session Summary (S)**: Quick recap of what you accomplished.
* **Evolution (E)**: See skill growth over time.
* **Journal (J)**: Browse your timeline.
* **Pre‑Quest Lobby (L)**: Focus mode before big tasks.
* **Voice Input (Whisper only)**: Press V, speak, and have it transcribed.
* **Local‑first storage**: IndexedDB (RxDB + Dexie) and Zustand for preferences.
* **No accounts. No telemetry. Ever.**

---

## Quick Start (Next.js)

```bash
git clone https://github.com/iyiolacak/local-loop.git
cd local-loop
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and paste your **OpenAI API key** into **Settings → LLM**. The app won’t run without it.

---

## How It Works

1. **Type or speak** your task.
2. **LLM interprets** it and suggests the next step.
3. **Reward engine** logs it, gives XP, animates progress.
4. **Local DB** keeps everything on your device.

---

## Privacy & Security

* Your history and stats never leave your device.
* Only the active entry and minimal context are sent to your LLM endpoint.
* Key is stored locally. You own it.

---

## Roadmap

* Self-hosted privacy proxy for those who want to scrub PII before it hits the LLM.
* Encrypted peer‑to‑peer sync
* XP rule customization kits
* Terminal client
* Plugin system for overlays, XP logic, LLM hooks
* Mobile PWA

---

**GPLv3 © 2025 [iyiolacak](https://github.com/iyiolacak)**
