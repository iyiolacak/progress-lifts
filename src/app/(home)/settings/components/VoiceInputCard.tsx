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

export function VoiceInputCard() {
  const t = useTranslations("SettingsPage");
  const saveVoice = useAppSettings((s) => s.saveVoice);
  const setSaveVoice = useAppSettings((s) => s.setSaveVoice);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("voiceInput.title")}</CardTitle>
        <CardDescription
          className="text-base"
          dangerouslySetInnerHTML={{
            __html: t.raw("voiceInput.description"),
          }}
        />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Label className="text-base">{t("voiceInput.keepAudio")}</Label>
        <Switch
          checked={saveVoice}
          onCheckedChange={setSaveVoice}
          aria-label="Toggle audio retention"
        />
      </CardContent>
    </Card>
  );
}
