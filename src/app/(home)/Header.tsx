import React from "react";
import { EntryForm } from "@/components/EntryForm/EntryForm";
import ProdAtLocalhostLogo from "@/components/Logo";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

const Header = () => {
  const { isTop } = useEntryFormPosition();

  return (
    <header
      className={cn(
        "relative w-full z-9999 bg-background h-[var(--navbar-height)]",
        isTop ? "sticky top-0" : "fixed inset-x-0 bottom-0"
      )}
    >
      {/* directional fade so content behind doesn’t distract */}

      <div
        className={cn(
          "px-4 md:px-8 w-full justify-between flex gap-3",
          isTop ? "py-4" : "pt-2 pb-8"
        )}
      >
        <div className="">
          <ProdAtLocalhostLogo />
        </div>

        <div className="flex w-full h-full items-center justify-center">
          <div className="w-full max-w-5xl">
            <EntryForm />
          </div>
        </div>

        <div className="hidden md:flex items-center justify-end">
          <SidebarTrigger />
        </div>
      </div>
    </header>
  );
};

export default Header;
