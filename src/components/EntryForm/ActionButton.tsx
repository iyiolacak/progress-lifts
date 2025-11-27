// src/components/command-input/ActionButton.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Microphone } from "iconoir-react/solid";
import { ArrowUp, Lock, Trash, Square, Check, X } from "iconoir-react/regular";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useHoverClickSounds } from "@/lib/sfx";
import { useTranslations } from "next-intl";
import { Cross, XIcon } from "lucide-react";

/* ------------------------------------------------------------------------------------------ */
/* Types                                                                                       */
/* ------------------------------------------------------------------------------------------ */

type Mode = "busy" | "stop" | "submit" | "record";

export interface ActionButtonProps {
  isRecording: boolean;
  isBusy: boolean;
  canSubmit: boolean;
  onRecord: () => void;
  onStop: () => void; // stop & save (transcribe)
  onCancel: () => void; // cancel recording
  onSubmit: () => void;
  tooltipMain?: string;
  volume?: number;
  className?: string;
}

/* ------------------------------------------------------------------------------------------ */
/* Memoized Icon Primitives (prevents re-render of SVG trees)                                  */
/* ------------------------------------------------------------------------------------------ */

const MicIcon = React.memo((props: React.ComponentProps<typeof Microphone>) => (
  <Microphone {...props} />
));
MicIcon.displayName = "MicIcon";
const StopIcon = React.memo((props: React.ComponentProps<typeof Square>) => (
  <Square {...props} />
));
StopIcon.displayName = "StopIcon";
const SendIcon = React.memo((props: React.ComponentProps<typeof ArrowUp>) => (
  <ArrowUp {...props} />
));
SendIcon.displayName = "SendIcon";

/* ------------------------------------------------------------------------------------------ */
/* RecordingGlow: decouples rapid volume updates from the rest                                 */
/* ------------------------------------------------------------------------------------------ */

const RecordingGlow = React.memo(function RecordingGlow({
  volume = 0,
  active,
}: {
  volume?: number;
  active: boolean;
}) {
  // Smooth the volume so tiny spikes don’t thrash layout/paint
  const volRaw = useMotionValue(0);
  const vol = useSpring(volRaw, { stiffness: 220, damping: 28, mass: 0.8 });
  const scale = useTransform(vol, (v) => 1 + v * 1.5);

  React.useEffect(() => {
    volRaw.set(Math.max(0, volume));
  }, [volume, volRaw]);

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          className="absolute inset-0 z-0 rounded-lg bg-white/10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1 }}
          style={{ scale }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  );
});

/* ------------------------------------------------------------------------------------------ */
/* IconSwitcher: single mount, layered icons (no remount jitter)                               */
/* ------------------------------------------------------------------------------------------ */

const IconSwitcher = React.memo(
  function IconSwitcher({
    mode,
    strokeWidth = 2.5,
    className,
  }: {
    mode: Mode;
    strokeWidth?: number;
    className?: string;
  }) {
    if (mode === "busy") {
      // Spinner remains as an SVG to keep bundle small and avoid another dep
      return (
        <motion.svg
          aria-hidden
          className={cn("h-5 w-5 animate-spin", className)}
          viewBox="0 0 24 24"
          initial={false}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </motion.svg>
      );
    }

    const showMic = mode === "record";
    const showStop = mode === "stop";
    const showSend = mode === "submit";

    // Three absolutely-positioned layers; we just fade/translate
    return (
      <div className={cn("relative h-5 w-5", className)}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: showMic ? 1 : 0,
            y: showMic ? 0 : 8,
            filter: showMic ? "blur(0px)" : "blur(8px)",
          }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <MicIcon strokeWidth={strokeWidth} className="h-5 w-5" />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: showStop ? 1 : 0,
            y: showStop ? 0 : 8,
            filter: showStop ? "blur(0px)" : "blur(8px)",
          }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <Check strokeWidth={strokeWidth} className="h-5 w-5" />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: showSend ? 1 : 0,
            y: showSend ? 0 : 8,
            filter: showSend ? "blur(0px)" : "blur(8px)",
          }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <SendIcon strokeWidth={strokeWidth} className="h-5 w-5" />
        </motion.div>
      </div>
    );
  },
  (a, b) =>
    a.mode === b.mode &&
    a.strokeWidth === b.strokeWidth &&
    a.className === b.className
);

/* ------------------------------------------------------------------------------------------ */
/* CancelButton: isolated to avoid re-rendering primary chunk                                   */
/* ------------------------------------------------------------------------------------------ */

const CancelButton = React.memo(function CancelButton({
  onCancel,
  label,
}: {
  onCancel: () => void;
  label: string;
}) {
  const sfx = useHoverClickSounds();
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: 30, scale: 0.7 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.7 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              sfx.onClick();
              onCancel();
            }}
            className="text-center flex items-center justify-center scale-90 text-foreground h-full w-12 bg-transparent rounded-lg hover:bg-foreground/20 hover:text-white"
            aria-label={label}
          >
            <XIcon strokeWidth={2} className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
});

/* ------------------------------------------------------------------------------------------ */
/* PrimaryButton: width/layout animation + icon + glow                                         */
/* ------------------------------------------------------------------------------------------ */

const PrimaryButton = React.memo(
  function PrimaryButton({
    mode,
    canSubmit,
    isRecording,
    tooltip,
    onPrimary,
    onHover,
    volume = 0,
  }: {
    mode: Mode;
    canSubmit: boolean;
    isRecording: boolean;
    tooltip: string;
    onPrimary: () => void;
    onHover: () => void;
    volume?: number;
  }) {
    const t = useTranslations("CommandForm");

    return (
      <motion.div
        layout="position"
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              onClick={onPrimary}
              onMouseEnter={onHover}
              disabled={mode === "busy"}
              aria-label={tooltip}
              className={cn(
                "group relative flex h-10 items-center justify-center rounded-lg p-0 text-xl shadow-lg",
                "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-95",
                isRecording
                  ? "bg-foreground scale-90 text-background hover:bg-white"
                  : "bg-product text-background hover:bg-product/90 active:bg-background active:text-product"
              )}
              // Width grows only when not recording and canSubmit
              animate={{ width: !isRecording && canSubmit ? "5rem" : "3.5rem" }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              initial={false}
            >
              <RecordingGlow active={isRecording} volume={volume} />

              <div className="relative z-10 flex h-6 w-6 items-center justify-center overflow-visible">
                <IconSwitcher mode={mode} />
              </div>
            </motion.button>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            align="center"
            className="max-w-[260px] px-4 py-3 bg-[#f7fff7] text-sm font-medium"
          >
            <p className="flex mb-1.5 items-center gap-x-0.5 text-md font-medium">
              <Lock strokeWidth={2} /> {tooltip}
            </p>
            <p className="text-xs text-muted-foreground">
              *
              {t("tooltipPrivacyLine1", {
                default: "Processed by your chosen model.",
              })}
              <br />
              {t("tooltipPrivacyLine2", {
                default: "All else stays in-browser.",
              })}
            </p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    );
  },
  (a, b) =>
    a.mode === b.mode &&
    a.canSubmit === b.canSubmit &&
    a.isRecording === b.isRecording &&
    a.tooltip === b.tooltip &&
    a.onPrimary === b.onPrimary &&
    a.onHover === b.onHover &&
    a.volume === b.volume // keep strict equality; caller can throttle if needed
);

/* ------------------------------------------------------------------------------------------ */
/* Main Component                                                                              */
/* ------------------------------------------------------------------------------------------ */

export const ActionButton: React.FC<ActionButtonProps> = ({
  isRecording,
  isBusy,
  canSubmit,
  onRecord,
  onStop,
  onCancel,
  onSubmit,
  tooltipMain,
  volume = 0,
  className,
}) => {
  const sfx = useHoverClickSounds();
  const t = useTranslations("CommandForm");

  // Compute mode deterministically (stable identity)
  const mode: Mode = React.useMemo(
    () =>
      isBusy ? "busy" : isRecording ? "stop" : canSubmit ? "submit" : "record",
    [isBusy, isRecording, canSubmit]
  );

  const tooltip = React.useMemo(() => {
    if (tooltipMain) return tooltipMain;
    if (mode === "busy")
      return (t as (key: string) => string)?.("tooltipBusy") ?? "Working…";
    if (mode === "stop") return t("tooltipRecording");
    if (mode === "submit") return t("tooltipSend");
    return t("tooltipRecord");
  }, [tooltipMain, mode, t]);

  const handlePrimaryAction = React.useCallback(() => {
    if (mode === "busy") return;
    sfx.onClick();
    if (mode === "record") onRecord();
    else if (mode === "stop") onStop();
    else if (mode === "submit") onSubmit();
  }, [mode, onRecord, onStop, onSubmit, sfx]);

  const cancelLabel: string = t("cancelRecording", {
    default: "Cancel recording",
  }) as string;

  return (
    <div
      className={cn(
        "flex h-10 items-center justify-end gap-x-2",
        className
      )}
    >
      <div>
        <div className={cn("flex flex-row gap-x-1 py-0.5 px-2", isRecording ? "opacity-100 bg-background/70 transition-all rounded-lg border shadow-xs" : "")}>
          {/* Cancel (only while recording) */}
          <AnimatePresence initial={false}>
            {isRecording && (
              <CancelButton onCancel={onCancel} label={cancelLabel} />
            )}
          </AnimatePresence>

          {/* Primary button (width + icon transitions) */}
          <PrimaryButton
            mode={mode}
            canSubmit={canSubmit}
            isRecording={isRecording}
            tooltip={tooltip}
            onPrimary={handlePrimaryAction}
            onHover={sfx.onMouseEnter}
            volume={volume}
          />
        </div>
      </div>
    </div>
  );
};
