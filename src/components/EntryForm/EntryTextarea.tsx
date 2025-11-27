"use client";

import * as React from "react";
import { Textarea as ShadTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CommandTextareaHandle {
  focus: () => void;
  clear: () => void;
  submit: () => void;
  element: HTMLTextAreaElement | null;
}

export interface CommandTextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue" | "onChange" | "onSubmit"
  > {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: (
    value: string,
    e: React.KeyboardEvent<HTMLTextAreaElement> | { source: "imperative" }
  ) => void;
  submitOnEnter?: boolean;

  /** Auto-resize height (default: true) */
  autoResize?: boolean;
  /** Clamp min/max rows when auto-resizing */
  minRows?: number; // default 1
  maxRows?: number; // default 8
  /** Optional external DOM ref to the <textarea> */
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

/** Compose two refs (object or callback) safely */
function composeRefs<T>(a?: React.Ref<T>, b?: React.Ref<T>): React.RefCallback<T> {
  return (value: T) => {
    [a, b].forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    });
  };
}

export const EntryTextarea = React.forwardRef<CommandTextareaHandle, CommandTextareaProps>(
  (props, forwardedRef) => {
    const {
      value,
      onValueChange,
      onSubmit,
      submitOnEnter = true,
      autoResize = true,
      minRows = 1,
      maxRows = 8,
      className,
      placeholder,
      readOnly,
      onKeyDown,
      textareaRef,
      ...rest
    } = props;

    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const setTextareaRef = composeRefs(innerRef, textareaRef);
    const [isComposing, setIsComposing] = React.useState(false);

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!(el instanceof HTMLTextAreaElement)) return;
      if (!autoResize) return;

      const cs = window.getComputedStyle(el);
      const line = parseFloat(cs.lineHeight || "0") || 20;
      const paddingTop = parseFloat(cs.paddingTop || "0");
      const paddingBottom = parseFloat(cs.paddingBottom || "0");
      const borderTop = parseFloat(cs.borderTopWidth || "0");
      const borderBottom = parseFloat(cs.borderBottomWidth || "0");

      // Reset to auto to measure true scrollHeight
      el.style.height = "auto";
      const scrollH = el.scrollHeight;

      // Clamp to min/max rows
      const minH = minRows * line + paddingTop + paddingBottom + borderTop + borderBottom;
      const maxH = maxRows * line + paddingTop + paddingBottom + borderTop + borderBottom;
      const next = Math.min(maxH, Math.max(minH, scrollH));

      el.style.height = `${next}px`;
    }, [autoResize, minRows, maxRows]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(e.target.value);
        // Resize on user input for immediate feedback
        // (value-driven effect will also run)
        requestAnimationFrame(resize);
      },
      [onValueChange, resize]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (readOnly) return;
        if (!submitOnEnter) return;
        if (isComposing) return;

        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.(value, e);
        }
      },
      [onKeyDown, readOnly, submitOnEnter, isComposing, onSubmit, value]
    );

    // Resize when value changes programmatically (paste, clear, transcribe, etc.)
    React.useLayoutEffect(() => {
      resize();
    }, [value, resize]);

    // Resize on first mount and on window resize
    React.useEffect(() => {
      resize();
      const onResize = () => requestAnimationFrame(resize);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [resize]);

    React.useImperativeHandle(
      forwardedRef,
      (): CommandTextareaHandle => ({
        focus: () => innerRef.current?.focus(),
        clear: () => onValueChange(""),
        submit: () => onSubmit?.(value, { source: "imperative" }),
        element: innerRef.current,
      }),
      [onSubmit, onValueChange, value]
    );

    return (
      <ShadTextarea
        ref={setTextareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        readOnly={readOnly}
        aria-disabled={readOnly}
        placeholder={placeholder}
        className={cn(
          "relative z-10 w-full resize-none overflow-hidden rounded-lg border border-transparent bg-input-dark text-base leading-6 text-gray-100",
          "overflow-y-auto px-3 py-2.5 md:py-3 md:text-lg md:leading-7",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-product focus-visible:ring-offset-0",
          "min-h-[2.75rem] md:min-h-[3.25rem] transition-all duration-200 ease-out",
          className
        )}
        rows={minRows}
        {...rest}
      />
    );
  }
);
EntryTextarea.displayName = "EntryTextarea";
