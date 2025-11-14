import ToggleSound from '@/components/ToggleSound'
import { Settings } from 'iconoir-react/regular'
import Link from 'next/link'
import React from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { APP_NAME } from '@/lib/appInfo';

const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="flex-none border-t px-6 py-4 text-sm text-muted-foreground bg-background/60 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-y-3">
        <div className="*:font-regular flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
          <span>{t('copyright', { appName: APP_NAME })}</span>
          <span>
            <a href="https://github.com/iyiolacak/local-loop/blob/main/LICENSE" className="underline hover:text-primary transition-colors">
              {t('license')}
            </a>{' '}
            · @<span className="font-medium text-foreground"><Link href={"https://github.com/iyiolacak/"}>iyiolacak</Link></span>
          </span>
          <span>{t('privacy')}</span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <a
            href="https://github.com/iyiolacak/local-loop"
            className="underline hover:text-primary transition-colors"
          >
            {t('github')}
          </a>
          <a href="./LICENSE" className="underline hover:text-primary transition-colors">
            {t('licenseLink')}
          </a>
                    <Link passHref href="/settings" className="underline hover:text-primary transition-colors">
            <Settings/>
          </Link>
          <ToggleSound />
          <LanguageSwitcher />
        </nav>
      </div>
    </footer>
  )
}

export default Footer
