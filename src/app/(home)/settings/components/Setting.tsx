import { useEntryFormPosition } from "@/app/hooks/useEntryFormPosition";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/localdb/store/appPreferences";
import React from "react";
import { shallow } from "zustand/shallow";

type SettingVariant = "switch" | "preview-cards" | "children"
interface SettingRootType extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  variant?: SettingVariant
  children: React.ReactNode;
}
const SettingRoot = ({ title, description, variant = "switch", children }: SettingRootType) => {
  return (
    <div className="space-y-5">
      <div>
        <h3 className=" font-semibold tracking-normal font-foreground text-[17px]">
          {title}
        </h3>
        <p className="text-foreground/60 tracking-wider font-medium text-sm">
          {description}
        </p>
      </div>
      {children}
      {/* options */}
    </div>
  );
};

export default SettingRoot;

const SettingOptionGroup = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex gap-3">
        <Skeleton className="w-52 h-32" />
        <Skeleton className="w-52 h-32" />
      </div>
    );
  }
  return <div className="flex gap-3">{children}</div>;
};

const SettingOptionItem = {};

const PositionOption = ({
  pos,
  checked,
}: {
  pos: "top" | "bottom";
  checked: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-52 h-32 hover:bg-white/20 bg-product-card border-2 rounded-lg flex p-3 justify-center",
        checked ?? "border-product",
        pos === "top" ? "items-start" : "items-end"
      )}
    >
      <div className="relative py-3 w-full bg-foreground/40 rounded-lg" />
      <div className="p-3 ml-2 bg-foreground/40 rounded-lg" />
    </div>
  );
};
