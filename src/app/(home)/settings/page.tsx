"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import {
  ModelProviderCard,
  VoiceInputCard,
  DiagnosticsCard,
} from "./components";
import { APP_NAME } from "@/lib/appInfo";

export default function PrivacySettings() {
  const t = useTranslations("SettingsPage");

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-10">
      <div>
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-wrap">
          {t.rich("description", {
            appName: APP_NAME,
            strong: (chunks) => <strong>{chunks}</strong>,
            em: (chunks) => <em>{chunks}</em>,
            br: () => <br />,
          })}
        </p>
      </div>

      <ModelProviderCard />
      <VoiceInputCard />
      <DiagnosticsCard />
      <Separator />
      
      <p className="text-center text-base">{t("footer")}</p>
    </div>
  );
}
