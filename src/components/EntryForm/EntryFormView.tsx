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

type CommandMachine = ReturnType<typeof useCommandMachine>;

interface EntryFormViewProps {
  machine: CommandMachine;
}

export function EntryFormView({ machine }: EntryFormViewProps) {
  const t = useTranslations("CommandForm");
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
    overlayActive,          // <-- new
  } = machine;

  const isDisabled = isBusy || isRecording;
  const placeholder = isRecording ? t("listening") : t("placeholder");
  const handleSubmit = React.useCallback(() => { if (canSubmit) submit(); }, [canSubmit, submit]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative w-full md:max-w-3xl overflow-hidden rounded-xl border-2 border-border/80 bg-background shadow-sm px-2 py-2 md:px-3">
        <EntryTextarea
          value={text}
          onValueChange={onChange}
          onSubmit={() => handleSubmit()}
          maxRows={6}
          readOnly={isDisabled}
          placeholder={placeholder}
          aria-label={t("inputLabel")}
          aria-busy={isBusy}
          className={cn(
            "relative z-10 w-full pr-24 md:pr-28",
            isRecording && "pr-36 md:pr-40 text-transparent placeholder:text-gray-500 cursor-default caret-transparent"
          )}
        />
        <ActionButton
          isRecording={isRecording}
          isBusy={isBusy}
          canSubmit={canSubmit}
          onRecord={startRecording}
          onStop={stopRecording}
          onSubmit={handleSubmit}
          onCancel={cancelRecording}
          volume={machine.volume}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2"
        />

        {/* The brand cover; no buttons visible while active */}
        <FormCover
          active={overlayActive}
          label={t("listening")}
          className="bg-primary"   // or: "bg-gradient-to-br from-primary to-primary/90"
        />
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
