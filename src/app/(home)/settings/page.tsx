"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ModelProviderCard,
  VoiceInputCard,
  DiagnosticsCard,
  EntryFocusSetting,
} from "./components";
import EntryFormPositionSetting from "./components/EntryFormPositionSetting";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

type TabKey =
  | "compute"
  | "sanitization"
  | "persistence"
  | "logs"
  | "cli"
  | "renderer";

type Section = {
  key: TabKey;
  label: string;
  group: "Compute" | "State" | "Runtime";
  icon: AppIconName;
  content: React.ReactNode;
};

type PlaceholderCardProps = {
  title: string;
  description: string;
  items: string[];
};

const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  title,
  description,
  items,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">{title}</CardTitle>
      <CardDescription className="text-base text-foreground/70">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-foreground/80">
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const sections: Section[] = [
  {
    key: "compute",
    label: "Model Configuration",
    group: "Compute",
    icon: "cog",
    content: (
      <>
        <ModelProviderCard />
        <PlaceholderCard
          title="Model Configuration"
          description="Configure your LLM endpoint and defaults."
          items={[
            "API endpoint (OpenAI, Ollama, custom)",
            "Context window limit and temperature",
            "System prompt override",
          ]}
        />
      </>
    ),
  },
  {
    key: "sanitization",
    label: "Privacy Layer",
    group: "Compute",
    icon: "lock-shield",
    content: (
      <>
        <DiagnosticsCard />
        <PlaceholderCard
          title="Privacy Layer"
          description="Control how data is scrubbed before leaving the device."
          items={[
            "PII regex rules and overrides",
            "Local whitelist (JSON editor)",
            "Network egress logs",
          ]}
        />
      </>
    ),
  },
  {
    key: "persistence",
    label: "Database & Sync",
    group: "State",
    icon: "common-file-stack",
    content: (
      <PlaceholderCard
        title="Database & Sync"
        description="Manage local storage and future sync options."
        items={[
          "Export to Markdown/JSON",
          "P2P sync (coming soon)",
          "Vacuum DB and storage quota",
        ]}
      />
    ),
  },
  {
    key: "logs",
    label: "Activity Stream",
    group: "State",
    icon: "binocular",
    content: (
      <PlaceholderCard
        title="Activity Stream"
        description="Review and control retention for logs."
        items={[
          "Retention policy (e.g., auto-delete after 30 days)",
          "Audit log with raw JSON of requests",
          "Visibility controls",
        ]}
      />
    ),
  },
  {
    key: "cli",
    label: "Command Line",
    group: "Runtime",
    icon: "navigation-menu",
    content: (
      <>
        <EntryFormPositionSetting />
        <EntryFocusSetting />
        <PlaceholderCard
          title="Command Line"
          description="Configure keyboard-first workflows."
          items={[
            "Global hotkey and focus behavior",
            "Aliases/macros (e.g., g -> gym)",
            "Auto-focus preferences",
          ]}
        />
      </>
    ),
  },
  {
    key: "renderer",
    label: "Renderer",
    group: "Runtime",
    icon: "smiley-smile",
    content: (
      <>
        <VoiceInputCard />
        <PlaceholderCard
          title="Renderer"
          description="Tune how the interface feels."
          items={[
            "Font family (serif, mono, sans)",
            "Density (comfortable vs. compact)",
            "Haptics and high-contrast mode",
          ]}
        />
      </>
    ),
  },
];

const groups = Array.from(new Set(sections.map((s) => s.group)));

type NavButtonProps = {
  item: Section;
  isActive: boolean;
  onClick: () => void;
};

const NavButton: React.FC<NavButtonProps> = ({ item, isActive, onClick }) => {
  return (
    <button
      key={item.key}
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[150px] items-center gap-2 whitespace-nowrap rounded-md border border-transparent px-3 py-2 text-left text-sm font-medium transition",
        "hover:bg-foreground/10",
        isActive &&
          "inset-shadow-2xs inset-shadow-foreground/10 bg-foreground/5 text-foreground shadow-md"
      )}
      aria-pressed={isActive}
      aria-current={isActive ? "true" : undefined}
    >
      <AppIcon name={item.icon} size={18} className="opacity-80" aria-hidden />
      <span className="text-[15px] leading-tight">{item.label}</span>
    </button>
  );
};

export default function PrivacySettings() {
  const t = useTranslations("SettingsPage");
  const [active, setActive] = React.useState<TabKey>("compute");

  const sectionRefs = React.useRef<Record<TabKey, HTMLDivElement | null>>(
    sections.reduce(
      (acc, section) => ({ ...acc, [section.key]: null }),
      {} as Record<TabKey, HTMLDivElement | null>
    )
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        const nextKey = top?.target.getAttribute("data-key") as
          | TabKey
          | null;

        if (nextKey && nextKey !== active) {
          setActive(nextKey);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.25, 0.5, 0.75],
      }
    );

    Object.values(sectionRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = (key: TabKey) => {
    const target = sectionRefs.current[key];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollMargin = "calc(var(--navbar-height) + 3.5rem)";

  return (
    <div className="h-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <h2 className="text-3xl text-foreground/90">Settings and Preferences</h2>

      <Separator />

      <div className="flex w-full flex-col items-start gap-6 md:flex-row md:gap-8">
        {/* Desktop nav */}
        <aside className="sticky top-[calc(var(--navbar-height)+1rem)] hidden h-screen w-[280px] max-h-[calc(100vh-var(--navbar-height)-2rem)] self-start border-r pr-1 md:block">
          <nav
            className="flex max-h-full w-full flex-col gap-5 overflow-auto"
            aria-label="Settings navigation"
          >
            {groups.map((group) => (
              <div key={group} className="space-y-2">
                <div className="w-full text-start text-[15px] font-medium text-foreground/40">
                  {group}
                </div>
                <div className="flex w-full flex-col gap-1.5">
                  {sections
                    .filter((s) => s.group === group)
                    .map((item) => (
                      <NavButton
                        key={item.key}
                        item={item}
                        isActive={active === item.key}
                        onClick={() => {
                          setActive(item.key);
                          scrollToSection(item.key);
                        }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="w-full flex-1 space-y-6 md:space-y-8">
          <div className="sticky top-[var(--navbar-height)] z-30 border-b border-border/60 bg-background/90 backdrop-blur md:hidden">
            <nav
              className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-3"
              aria-label="Settings quick navigation"
            >
              {sections.map((item) => (
                <NavButton
                  key={item.key}
                  item={item}
                  isActive={active === item.key}
                  onClick={() => {
                    setActive(item.key);
                    scrollToSection(item.key);
                  }}
                />
              ))}
            </nav>
          </div>

          {/* Sections */}
          {sections.map((section) => {
            return (
              <section
                key={section.key}
                ref={(node) => {
                  if (node) sectionRefs.current[section.key] = node;
                }}
                data-key={section.key}
                className="space-y-4 pt-1"
                style={{ scrollMarginTop: scrollMargin }}
              >
                <div className="flex items-center gap-2 text-foreground/80">
                  <AppIcon name={section.icon} size={20} className="opacity-90" aria-hidden />
                  <h2 className="text-xl font-semibold">{section.label}</h2>
                </div>
                {section.content}
              </section>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-foreground/60">{t("footer")}</p>
    </div>
  );
}
