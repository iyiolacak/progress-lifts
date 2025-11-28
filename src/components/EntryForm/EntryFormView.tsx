// FILE: src/components/CommandForm/EntryFormView.tsx
"use client";

import * as React from "react";
import type { useCommandMachine } from "./useCommandMachine";
import { ActionButton } from "./ActionButton";
import { EntryTextarea } from "./EntryTextarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormCover } from "./FormCover";
import { useTranslations } from "next-intl";
import { useAppSettings } from "@/localdb/store/appPreferences";
import { useShallow } from "zustand/react/shallow";
import { Kbd } from "@/components/ui/kbd";

type CommandMachine = ReturnType<typeof useCommandMachine>;

interface EntryFormViewProps {
  machine: CommandMachine;
}

export function EntryFormView({ machine }: EntryFormViewProps) {
  const t = useTranslations("CommandForm");
  const enableFocusShortcuts = useAppSettings(
    (s) => s.enableEntryFocusShortcuts
  );
  const focusOptions = useAppSettings(
    useShallow((s) => ({
      slash: s.focusShortcutSlash,
      enter: s.focusShortcutEnter,
      typeToFocus: s.focusShortcutTypeToFocus,
      cmdJ: s.focusShortcutCmdJ,
      autoOnLoad: s.focusAutoOnLoad,
    }))
  );
  const {
    text,
    onChange,
    errorMessage,
    isRecording,
    isBusy,
    canSubmit,
    hasError,
    startRecording,
    stopRecording,
    cancelRecording,
    submit,
    retry,
    dismissError,
    overlayActive,
  } = machine;

  const isDisabled = isBusy || isRecording;
  const placeholder = isRecording ? t("listening") : t("placeholder");
  const firstHint =
    (enableFocusShortcuts && focusOptions.slash && "/") ||
    (enableFocusShortcuts && focusOptions.enter && "Enter") ||
    (enableFocusShortcuts && focusOptions.cmdJ && "Cmd/Ctrl+J") ||
    null;
  const handleSubmit = React.useCallback(() => { if (canSubmit) submit(); }, [canSubmit, submit]);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const actionRef = React.useRef<HTMLButtonElement | null>(null);
  const hintRef = React.useRef<HTMLDivElement | null>(null);

  const focusInput = React.useCallback(() => {
    textareaRef.current?.focus({ preventScroll: false });
  }, []);

  // Initial focus when enabled and nothing else is focused
  React.useEffect(() => {
    if (!enableFocusShortcuts || isDisabled || !focusOptions.autoOnLoad) return;
    const active = document.activeElement as HTMLElement | null;
    const inText =
      active?.closest("input, textarea, [contenteditable=true]") !== null;
    if (!inText) {
      focusInput();
    }
  }, [enableFocusShortcuts, isDisabled, focusInput, focusOptions.autoOnLoad]);

  // Global shortcuts to focus the entry box
  React.useEffect(() => {
    if (!enableFocusShortcuts) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inTextInput =
        target?.closest("input, textarea, [contenteditable=true]");
      const key = e.key.toLowerCase();
      const metaOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + J (power user)
      if (focusOptions.cmdJ && metaOrCtrl && key === "j") {
        e.preventDefault();
        focusInput();
        return;
      }

      // Slash or Enter when not in text inputs
      if (!inTextInput && !metaOrCtrl && !e.altKey) {
        if (focusOptions.slash && key === "/") {
          e.preventDefault();
          focusInput();
          return;
        }
        if (focusOptions.enter && key === "enter") {
          e.preventDefault();
          focusInput();
          return;
        }
      }

      // Type-to-focus: printable characters without modifiers
      if (
        !inTextInput &&
        !metaOrCtrl &&
        !e.altKey &&
        focusOptions.typeToFocus &&
        e.key.length === 1 &&
        e.key !== "/"
      ) {
        e.preventDefault();
        focusInput();
        // Let the character flow into the textarea on next tick
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const el = textareaRef.current;
            const value = text ?? "";
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            const char = e.key;
            const next =
              value.slice(0, start) + char + value.slice(end, value.length);
            onChange(next);
            const caret = start + char.length;
            requestAnimationFrame(() => {
              el.setSelectionRange(caret, caret);
            });
          }
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableFocusShortcuts, focusInput, onChange, text, focusOptions]);

  // Trap focus between textarea and primary action
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;

    const focusables = [textareaRef.current, actionRef.current].filter(Boolean) as HTMLElement[];
    if (!focusables.length) return;

    const active = document.activeElement as HTMLElement | null;
    const idx = focusables.findIndex((el) => el === active);

    if (idx === -1) {
      focusables[0].focus();
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      if (idx === 0) {
        focusables[focusables.length - 1].focus();
        e.preventDefault();
      }
    } else if (idx === focusables.length - 1) {
      focusables[0].focus();
      e.preventDefault();
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="relative w-full md:max-w-3xl overflow-hidden rounded-xl shadow-sm px-2 py-2 md:px-3"
        onKeyDown={handleKeyDown}
        onFocusCapture={(e) => {
          // Whenever focus enters this region, pull it to the textarea first
          const target = e.target as HTMLElement | null;
          if (target && target !== textareaRef.current && target !== actionRef.current) {
            focusInput();
          }
        }}
        tabIndex={-1}
      >
        <EntryTextarea
          value={text}
          onValueChange={onChange}
          onSubmit={() => handleSubmit()}
          maxRows={6}
          readOnly={isDisabled}
          placeholder={placeholder}
          aria-label={t("inputLabel")}
          aria-busy={isBusy}
          textareaRef={textareaRef}
          aria-keyshortcuts={
            enableFocusShortcuts
              ? [
                  focusOptions.slash ? "Slash" : null,
                  focusOptions.enter ? "Enter" : null,
                  focusOptions.cmdJ ? "Control+J" : null,
                  focusOptions.cmdJ ? "Meta+J" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              : undefined
          }
          className={cn(
            "relative z-10 w-full border border-[#7f7979] pr-24 md:pr-28",
            isRecording &&
              "pr-32 md:pr-36  text-transparent placeholder:text-gray-500 cursor-default caret-transparent"
          )}
        />
        {/* Mic overlay confined to the input area */}
        <FormCover
          active={overlayActive}
          label={t("listening")}
          className="bg-primary z-20 rounded-lg"
        />
        <div className="pointer-events-auto absolute right-3 top-1/2 z-30 -translate-y-1/2 flex items-center gap-1">
          {enableFocusShortcuts && firstHint && (
            <Kbd
              className="pointer-events-none h-5 min-w-5 px-1 text-[11px] leading-none uppercase"
            >
              {firstHint}
            </Kbd>
          )}
          <ActionButton
            isRecording={isRecording}
            isBusy={isBusy}
            canSubmit={canSubmit}
            onRecord={startRecording}
            onStop={stopRecording}
            onSubmit={handleSubmit}
            onCancel={cancelRecording}
            volume={machine.volume}
            className="pointer-events-auto"
            actionRef={actionRef}
          />
        </div>
      </div>

      {hasError && (
        <div className="mt-3 pl-1 text-sm text-red-600 space-y-2">
          <p><span className="font-semibold">Error:</span> {errorMessage}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={retry} className="font-semibold">Retry</Button>
            <Button size="sm" variant="ghost" onClick={dismissError} className="font-semibold">Dismiss</Button>
          </div>
        </div>
      )}
    </div>
  );
}
