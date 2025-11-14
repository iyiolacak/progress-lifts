"use client";

import React, { FormEvent, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowUpRight, KeyPlus, Link } from "iconoir-react/regular";
import { useTranslations } from "next-intl";
import { useAppSettings } from "@/localdb/store/appPreferences";
import { APP_NAME } from "@/lib/appInfo";

interface ApiKeyFormProps {
  onSuccess: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSuccess }) => {
  const { apiKey, setApiKey } = useAppSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>(apiKey ?? "");
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("Drawer");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError(t("ApiKeyPrompt.errorEmpty"));
      return;
    }
    setApiKey(inputValue.trim());
    toast.success(t("ApiKeyPrompt.successToast", { appName: APP_NAME }));
    onSuccess();
  };

  return (
    <div className="max-w-2xl items-center justify-center space-y-8">
      <div className="items-center justify-center flex flex-col text-center mb-6">
        <div className="hidden md:block mb-6 p-2 rounded-sm dark:bg-input-dark">
          <KeyPlus strokeWidth={2} width={30} height={30} className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold tracking-loose text-gray-900 dark:text-gray-50 mb-3">
          {t("ApiKeyPrompt.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {t("ApiKeyPrompt.description", { appName: APP_NAME })}
          <br />
          <a
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-product dark:text-product hover:underline items-center flex justify-center"
          >
            {t("ApiKeyPrompt.openaiPlatformLink")}<ArrowUpRight strokeWidth={2} className="inline-block size-4" />
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full justify-center space-y-6 md:mt-12">
        <div className="relative w-full max-w-xl">
          <Input
            id="apiKey"
            ref={inputRef}
            label={t("ApiKeyPrompt.inputLabel")}
            type="password"
            placeholder={t("ApiKeyPrompt.inputPlaceholder")}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            error={error ?? undefined}
            autoComplete="off"
            className="w-full text-lg pr-32"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim()}
            tabIndex={0}
            className={`
              absolute top-1/2 right-1 z-50 -translate-y-1/2
              !h-[calc(100%-8px)] px-5 text-base rounded-md
              
              bg-product text-primary-foreground
              border
              border-input
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            `}
            style={{
              minHeight: "32px",
              fontWeight: 500,
            }}
          >
            {t("ApiKeyPrompt.saveButton")}
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default ApiKeyForm;
