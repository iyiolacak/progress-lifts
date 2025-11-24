import { EntryForm } from "@/components/EntryForm/EntryForm";
import ProdAtLocalhostLogo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/localdb/store/appPreferences";
import React from "react";
import { useEntryFormPosition } from "../hooks/useEntryFormPosition";

const Header = () => {
  const { isTop } = useEntryFormPosition();
  return (
    <header
      className={cn(
        "w-full bg-background z-[9999] border-b border-t",
        isTop ? "sticky top-0" : "fixed inset-x-0 bottom-0"
      )}
    >
      <div className="h-full px-3 md:px-8 mx-auto max-w-full flex items-center justify-between">
        {/* Logo – keeps intrinsic width */}
        <div className="absolute left-12 flex-shrink-0">
          <ProdAtLocalhostLogo />
        </div>
        
        {/* Command bar – grows, stays cetred, never shrinks below its content */}
        <div className="flex-1 h-full flex pt-6 pb-4 items-center justify-center">
            <div
              className="max-h-full w-full md:w-1/2"
              //   ref={audioVisualizerRef}
            >
              <EntryForm />
            </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
