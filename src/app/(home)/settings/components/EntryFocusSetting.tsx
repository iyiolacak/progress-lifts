"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/localdb/store/appPreferences";

const EntryFocusSetting = () => {
  const enabled = useAppSettings((s) => s.enableEntryFocusShortcuts);
  const setEnabled = useAppSettings((s) => s.setEnableEntryFocusShortcuts);
  const slash = useAppSettings((s) => s.focusShortcutSlash);
  const setSlash = useAppSettings((s) => s.setFocusShortcutSlash);
  const enter = useAppSettings((s) => s.focusShortcutEnter);
  const setEnter = useAppSettings((s) => s.setFocusShortcutEnter);
  const typeToFocus = useAppSettings((s) => s.focusShortcutTypeToFocus);
  const setTypeToFocus = useAppSettings((s) => s.setFocusShortcutTypeToFocus);
  const cmdJ = useAppSettings((s) => s.focusShortcutCmdJ);
  const setCmdJ = useAppSettings((s) => s.setFocusShortcutCmdJ);
  const autoOnLoad = useAppSettings((s) => s.focusAutoOnLoad);
  const setAutoOnLoad = useAppSettings((s) => s.setFocusAutoOnLoad);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Fast focus shortcuts</CardTitle>
        <CardDescription className="text-base">
          Press "/" (or just start typing) to jump into the command bar instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Label className="text-base">Enable global focus shortcuts</Label>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Toggle global focus shortcuts for the command bar"
        />
      </CardContent>
      <div className="px-6 pb-6 space-y-3 text-sm text-foreground/80">
        <ShortcutRow
          label='Slash "/" to focus'
          checked={slash}
          onCheckedChange={setSlash}
          disabled={!enabled}
        />
        <ShortcutRow
          label="Enter to focus"
          checked={enter}
          onCheckedChange={setEnter}
          disabled={!enabled}
        />
        <ShortcutRow
          label="Type-to-focus (any printable key)"
          checked={typeToFocus}
          onCheckedChange={setTypeToFocus}
          disabled={!enabled}
        />
        <ShortcutRow
          label="Cmd/Ctrl + J to focus"
          checked={cmdJ}
          onCheckedChange={setCmdJ}
          disabled={!enabled}
        />
        <ShortcutRow
          label="Auto-focus on load when idle"
          checked={autoOnLoad}
          onCheckedChange={setAutoOnLoad}
          disabled={!enabled}
        />
      </div>
    </Card>
  );
};

export default EntryFocusSetting;

type ShortcutRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
};

function ShortcutRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
