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
import { useTranslations } from "next-intl";
import { useAppSettings } from "@/localdb/store/appPreferences";

export function DiagnosticsCard() {
  const t = useTranslations("SettingsPage");
  const shareDiagnostics = useAppSettings((s) => s.shareDiagnostics);
  const setShareDiagnostics = useAppSettings((s) => s.setShareDiagnostics);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("diagnostics.title")}</CardTitle>
        <CardDescription className="text-base">
          {t("diagnostics.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Label className="text-base">
          {t("diagnostics.enableCrashReports")}
        </Label>
        <Switch
          checked={shareDiagnostics}
          onCheckedChange={setShareDiagnostics}
          aria-label={t("diagnostics.toggleAria")}
        />
      </CardContent>
    </Card>
  );
}
