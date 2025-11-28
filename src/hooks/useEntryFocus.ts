// I/O
// Should take an:
// entryTextareaRef
// actionRef: from textarea, a single tab lead to action(send/microphone) button
// isDisabled
// focusInput(): Defines how to focus the input.

import { useEffect } from "react";

type PreferencesFocus = {
    slash: boolean;
    enter: boolean;
    typeToFocus: boolean;
    cmdJ: boolean;
    autoOnload: boolean;
}

type UseEntryFocusProps = {
    entryTextareaRef: React.RefObject<HTMLTextAreaElement>;
    actionRef: React.RefObject<HTMLButtonElement>;
    isDisabled: boolean;
    overlayActive?: boolean;
    enableFocusShortcuts: boolean;
    focusOptions: PreferencesFocus;
}
const useEntryFocus = ({ entryTextareaRef, actionRef, isDisabled, enableFocusShortcuts, focusOptions }: UseEntryFocusProps) => {
    // Auto-focus on load
    useEffect(() => {
        if (!enableFocusShortcuts || isDisabled || focusOptions.autoOnload) return;
        const active = document.activeElement as HTMLElement | null;
        const inTextInput =
        active?.closest("input, textarea, [contenteditable=true]");

        const key = e.key.toLowerCase();
        const metaOrCtrl = e.metaKey || e.ctrlKey;
    })
}