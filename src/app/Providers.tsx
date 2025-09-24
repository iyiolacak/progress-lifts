'use client';

import { TooltipProvider } from "@/components/ui/tooltip";
import { SfxProvider } from "@/lib/sfx";
import ApiKeyPrompt from "@/components/ApiKeyDrawer/ApiKeyPrompt";
import { NextIntlClientProvider } from 'next-intl';
import { useAppSettings } from '../localdb/store/appPreferences';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const { locale } = useAppSettings();
  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const loadedMessages = (await import(`../../messages/${locale}.json`)).default;
        setMessages(loadedMessages);
      } catch (error) {
        console.error("Failed to load messages for locale", locale, error);
        // Fallback to English if loading fails
        const fallbackMessages = (await import(`../../messages/en.json`)).default;
        setMessages(fallbackMessages);
      }
    };
    loadMessages();
  }, [locale, router]);

  if (!messages) {
    return null; // Or a loading spinner
  }

  return (
    <SfxProvider>
      <TooltipProvider>
        {messages && (
          // Ensure messages are loaded before rendering the provider
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <ApiKeyPrompt />
        </NextIntlClientProvider>
        )}
      </TooltipProvider>
    </SfxProvider>
  );
}