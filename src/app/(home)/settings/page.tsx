"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import {
  ModelProviderCard,
  VoiceInputCard,
  DiagnosticsCard,
  EntryFocusSetting,
} from "./components";
import { APP_NAME } from "@/lib/appInfo";
import EntryFormPositionSetting from "./components/EntryFormPositionSetting";

export default function PrivacySettings() {
  const t = useTranslations("SettingsPage");

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-10">
      <div>

      </div>
      <Separator className="" />
      <EntryFormPositionSetting />
      <Separator />
      <EntryFocusSetting />
      <Separator />

      <ModelProviderCard />
      <Separator />

      <VoiceInputCard />
      <DiagnosticsCard />
      <Separator />

      <p className="text-center text-base">{t("footer")}</p>
    </div>
  );
}

const PrivacyAndTransparencyParagraph = () => {
  const t = useTranslations();
  return (
    <div>
          <h1 className="text-4xl font-medium text-foreground">{t("title")}</h1>
        <p
          className="mt-6 text-lg leading-7 tracking-normal text-foreground/60"
          style={{ textWrap: "balance", hyphens: "auto" }}
        >
          {t.rich("description", {
            appName: APP_NAME,
            strong: (chunks) => <strong>{chunks}</strong>,
            em: (chunks) => <em>{chunks}</em>,
            br: () => <br />,
          })}
        </p>
    </div>

  )

}
