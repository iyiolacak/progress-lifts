"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Lock } from "iconoir-react/regular";
import { useTranslations } from "next-intl";
import { useAppSettings } from "@/localdb/store/appPreferences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { firstDiff, levenshtein, maskKey } from "@/lib/utils";

export function ModelProviderCard() {
  const t = useTranslations("SettingsPage");

  // Settings slice
  const modelProvider = useAppSettings((s) => s.modelProvider);
  const setModelProvider = useAppSettings((s) => s.setModelProvider);
  const apiKey = useAppSettings((s) => s.apiKey);
  const setApiKey = useAppSettings((s) => s.setApiKey);

  // Modal state for editing the key
  const [open, setOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [ackReplace, setAckReplace] = useState(false);
  const [forceSmallChange, setForceSmallChange] = useState(false);

  // Derived checks
  const bothEntered = newKey.length > 0 && confirmKey.length > 0;
  const matches = bothEntered && newKey === confirmKey;

  const distanceFromCurrent = useMemo(() => {
    if (!apiKey || !newKey) return Infinity;
    return levenshtein(apiKey, newKey);
  }, [apiKey, newKey]);

  // Treat 1–2 edits as suspicious (likely a misclick/mistype)
  const SMALL_CHANGE_THRESHOLD = 2;
  const suspiciousSmallEdit =
    isFinite(distanceFromCurrent) &&
    distanceFromCurrent <= SMALL_CHANGE_THRESHOLD;

  const diff = useMemo(() => {
    if (!apiKey || !newKey) return null;
    return firstDiff(apiKey, newKey);
  }, [apiKey, newKey]);

  const canSave =
    matches && ackReplace && (!suspiciousSmallEdit || forceSmallChange);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // reset staging state on open
      setNewKey("");
      setConfirmKey("");
      setAckReplace(false);
      setForceSmallChange(false);
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    setApiKey(newKey);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lock /> {t("modelProvider.title")}
        </CardTitle>
        <CardDescription className="text-base">
          {t("modelProvider.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider */}
        <div className="space-y-2">
          <Select value={modelProvider} onValueChange={setModelProvider}>
            <SelectTrigger
              id="modelProvider"
              className="w-full dark:bg-background text-base"
            >
              <SelectValue
                placeholder={t("modelProvider.selectPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">
                {t("modelProvider.openai")}
              </SelectItem>
              <SelectItem disabled value="google-gemini-2.5-flash">
                {t("modelProvider.gemini")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Key - read-only with explicit Edit flow */}
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-lg">
            {t("apiKey.description")}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="apiKey"
              type="text"
              className="text-base bg-background"
              value={maskKey(apiKey)}
              readOnly
              aria-readonly
              title="Click Edit to replace the key"
            />
            <Dialog open={open} onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Replace API key</DialogTitle>
                  <DialogDescription className="text-base">
                    For safety, paste the full key twice. Small edits that
                    look accidental will be blocked unless you explicitly
                    override.
                  </DialogDescription>
                </DialogHeader>

                {/* New key */}
                <div className="space-y-2">
                  <Label htmlFor="newKey" className="text-base">
                    New API key
                  </Label>
                  <Input
                    id="newKey"
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Paste your new key…"
                    autoComplete="off"
                  />
                </div>

                {/* Confirm key */}
                <div className="space-y-2">
                  <Label htmlFor="confirmKey" className="text-base">
                    Re-enter new API key
                  </Label>
                  <Input
                    id="confirmKey"
                    type="password"
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    placeholder="Paste the same key again…"
                    autoComplete="off"
                  />
                  {bothEntered && !matches && (
                    <p className="text-sm text-destructive mt-1">
                      Keys do not match. Please paste the exact same value.
                    </p>
                  )}
                </div>

                {/* Small-change guard */}
                {apiKey && newKey && suspiciousSmallEdit && (
                  <div className="rounded-md border border-amber-600/40 bg-amber-500/10 p-3">
                    <p className="text-sm font-medium text-amber-600">
                      This looks like a very small change (
                      {distanceFromCurrent} edit
                      {distanceFromCurrent === 1 ? "" : "s"}).
                    </p>
                    {diff && (
                      <p className="text-sm text-muted-foreground mt-1">
                        First difference near index{" "}
                        <span className="font-mono">{diff.index}</span>:
                        <br />
                        <span className="font-mono">
                          old: “…{diff.left}…”
                        </span>
                        <br />
                        <span className="font-mono">
                          new: “…{diff.right}…”
                        </span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        id="forceSmall"
                        checked={forceSmallChange}
                        onCheckedChange={setForceSmallChange}
                        aria-label="Override small change guard"
                      />
                      <Label htmlFor="forceSmall" className="text-sm">
                        I’m sure—save this small change
                      </Label>
                    </div>
                  </div>
                )}

                {/* Acknowledgement */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="ackReplace"
                    checked={ackReplace}
                    onCheckedChange={setAckReplace}
                    aria-label="Acknowledge replacement"
                  />
                  <Label htmlFor="ackReplace" className="text-sm">
                    I understand this will replace the existing key.
                  </Label>
                </div>

                <DialogFooter className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                  >
                    Save key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}