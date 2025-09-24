'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSettings } from '@/localdb/store/appPreferences';


const FLAG_MAP: Record<string, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
};

const LABEL_MAP: Record<string, string> = {
  en: 'EN',
  tr: 'TR',
};

const FULL_LABEL_MAP: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe',
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale } = useAppSettings();

  const onSelectChange = (value: string) => {
    setLocale(value);
    router.refresh();
  };

  return (
    <Select onValueChange={onSelectChange} defaultValue={locale}>
      <SelectTrigger
        className={`group px-2 h-7 text-center justify-center bg-transparent text-xs leading-none rounded-md text-white hover:bg-neutral-800 focus:outline-none focus:ring-0 flex items-center `}
      >
        <span className={`text-base`} aria-hidden>
          {FLAG_MAP[locale] || '️'}
        </span>
        <span className="text-white/70 group-hover:text-black text-xs font-medium">
          {LABEL_MAP[locale] || '??'}
        </span>
      </SelectTrigger>

      <SelectContent className="py-1 bg-neutral-900 border border-neutral-700 rounded-md">
        {Object.entries(FLAG_MAP).map(([key, flag]) => (
          <SelectItem
            key={key}
            value={key}
            className=" py-1 text-sm text-white flex items-center space-x-2 hover:bg-neutral-800 focus:bg-neutral-700"
          >
            <span aria-hidden>
              {flag}
            </span>
            <span>{FULL_LABEL_MAP[key]}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}