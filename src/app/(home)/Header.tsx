import { EntryForm } from "@/components/EntryForm/EntryForm";
import ProdAtLocalhostLogo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/localdb/store/appPreferences";
import React from "react";

const Header = () => {
  const settings = useAppSettings();
  console.log(settings)
  return (
    <header className={cn("sticky bg-background z-[9999] flex-none border-b")}>
      <div className="h-full px-3 md:px-8 mx-auto max-w-full flex items-center justify-between">
        {/* Logo – keeps intrinsic width */}
        <div className="hidden md:block flex-shrink-0">
          <ProdAtLocalhostLogo />
        </div>

        {/* Command bar – grows, stays cetred, never shrinks below its content */}
        <div className="flex-1 h-full flex py-4 items-center justify-center">
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
