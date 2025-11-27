"use client";

import React, { useEffect, useMemo, useState } from "react";
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

type SettingsTranslator = ReturnType<typeof useTranslations>;

export function ModelProviderCard() {
  const t = useTranslations("SettingsPage");

  const modelProvider = useAppSettings((s) => s.modelProvider);
  const setModelProvider = useAppSettings((s) => s.setModelProvider);
  const apiKey = useAppSettings((s) => s.apiKey);
  const setApiKey = useAppSettings((s) => s.setApiKey);

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
        <ProviderSelect
          t={t}
          modelProvider={modelProvider}
          onChange={setModelProvider}
        />
        <ApiKeySection t={t} apiKey={apiKey} onSave={setApiKey} />
      </CardContent>
    </Card>
  );
}

function ProviderSelect({
  t,
  modelProvider,
  onChange,
}: {
  t: SettingsTranslator;
  modelProvider: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Select value={modelProvider} onValueChange={onChange}>
        <SelectTrigger
          id="modelProvider"
          className="w-full dark:bg-background text-base"
        >
          <SelectValue placeholder={t("modelProvider.selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">{t("modelProvider.openai")}</SelectItem>
          <SelectItem disabled value="google-gemini-2.5-flash">
            {t("modelProvider.gemini")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ApiKeySection({
  t,
  apiKey,
  onSave,
}: {
  t: SettingsTranslator;
  apiKey: string | null;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey" className="text-lg">
        {t("apiKey.title")}
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id="apiKey"
          type="text"
          className="text-base bg-background"
          value={maskKey(apiKey)}
          readOnly
          aria-readonly
          title={t("apiKey.modalDescription")}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="secondary">
              {t("apiKey.editButton")}
            </Button>
          </DialogTrigger>
          <ApiKeyDialogContent
            t={t}
            apiKey={apiKey}
            open={open}
            onClose={() => setOpen(false)}
            onSave={onSave}
          />
        </Dialog>
      </div>
    </div>
  );
}

function ApiKeyDialogContent({
  t,
  apiKey,
  open,
  onClose,
  onSave,
}: {
  t: SettingsTranslator;
  apiKey: string | null;
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [ackReplace, setAckReplace] = useState(false);
  const [forceSmallChange, setForceSmallChange] = useState(false);

  useEffect(() => {
    if (open) {
      setNewKey("");
      setConfirmKey("");
      setAckReplace(false);
      setForceSmallChange(false);
    }
  }, [open]);

  const bothEntered = newKey.length > 0 && confirmKey.length > 0;
  const matches = bothEntered && newKey === confirmKey;

  const distanceFromCurrent = useMemo(() => {
    if (!apiKey || !newKey) return Infinity;
    return levenshtein(apiKey, newKey);
  }, [apiKey, newKey]);

  const diff = useMemo(() => {
    if (!apiKey || !newKey) return null;
    return firstDiff(apiKey, newKey);
  }, [apiKey, newKey]);

  const SMALL_CHANGE_THRESHOLD = 2;
  const suspiciousSmallEdit =
    isFinite(distanceFromCurrent) &&
    distanceFromCurrent <= SMALL_CHANGE_THRESHOLD;

  const canSave =
    matches && ackReplace && (!suspiciousSmallEdit || forceSmallChange);

  const handleSave = () => {
    if (!canSave) return;
    onSave(newKey);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{t("apiKey.modalTitle")}</DialogTitle>
        <DialogDescription className="text-base">
          {t("apiKey.modalDescription")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="newKey" className="text-base">
          {t("apiKey.newKeyLabel")}
        </Label>
        <Input
          id="newKey"
          type="password"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={t("apiKey.newKeyPlaceholder")}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmKey" className="text-base">
          {t("apiKey.confirmKeyLabel")}
        </Label>
        <Input
          id="confirmKey"
          type="password"
          value={confirmKey}
          onChange={(e) => setConfirmKey(e.target.value)}
          placeholder={t("apiKey.confirmKeyPlaceholder")}
          autoComplete="off"
        />
        {bothEntered && !matches && (
          <p className="text-sm text-destructive mt-1">
            {t("apiKey.mismatchError")}
          </p>
        )}
      </div>

      {apiKey && newKey && suspiciousSmallEdit && (
        <SmallChangeWarning
          t={t}
          distanceFromCurrent={distanceFromCurrent}
          diff={diff}
          forceSmallChange={forceSmallChange}
          onForceChange={setForceSmallChange}
        />
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="ackReplace"
          checked={ackReplace}
          onCheckedChange={setAckReplace}
          aria-label={t("apiKey.ariaAcknowledgeReplace")}
        />
        <Label htmlFor="ackReplace" className="text-sm">
          {t("apiKey.acknowledgeReplace")}
        </Label>
      </div>

      <DialogFooter className="mt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("apiKey.cancelButton")}
        </Button>
        <Button type="button" onClick={handleSave} disabled={!canSave}>
          {t("apiKey.saveButton")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function SmallChangeWarning({
  t,
  distanceFromCurrent,
  diff,
  forceSmallChange,
  onForceChange,
}: {
  t: SettingsTranslator;
  distanceFromCurrent: number;
  diff: ReturnType<typeof firstDiff>;
  forceSmallChange: boolean;
  onForceChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-md border border-amber-600/40 bg-amber-500/10 p-3">
      <p className="text-sm font-medium text-amber-600">
        {t("apiKey.smallChangeWarning", { count: distanceFromCurrent })}
      </p>
      {diff && (
        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
          <p>{t("apiKey.firstDifference", { index: diff.index })}</p>
          <p className="font-mono">
            {t("apiKey.oldKeyPreview", { value: diff.left })}
          </p>
          <p className="font-mono">
            {t("apiKey.newKeyPreview", { value: diff.right })}
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <Switch
          id="forceSmall"
          checked={forceSmallChange}
          onCheckedChange={onForceChange}
          aria-label={t("apiKey.ariaOverrideSmallChange")}
        />
        <Label htmlFor="forceSmall" className="text-sm">
          {t("apiKey.forceSaveLabel")}
        </Label>
      </div>
    </div>
  );
}
