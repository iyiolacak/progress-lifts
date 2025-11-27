import { EntryForm } from "@/components/EntryForm/EntryForm";
import ProdAtLocalhostLogo from "@/components/Logo";
import { cn } from "@/lib/utils";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

const Header = () => {
  const { isTop } = useEntryFormPosition();
  return (
    <header
      className={cn(
        "w-full bg-background z-40 border-b border-t",
        isTop ? "sticky top-0" : "fixed inset-x-0 bottom-0"
      )}
    >
      <div className="h-full px-3 md:px-8 mx-auto max-w-full grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <ProdAtLocalhostLogo />
        </div>

        {/* Command bar – grows, stays centered, never shrinks below its content */}
        <div className="flex h-full items-center justify-center pt-6 pb-4">
          <div className="max-h-full w-full md:w-2/3 lg:w-1/2">
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
