import { useEntryFormPosition } from "@/app/hooks/useEntryFormPosition";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/localdb/store/appPreferences";
import React from "react";
import { shallow } from "zustand/shallow";

interface PositionOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  pos: "top" | "bottom";
  checked: boolean;
}

const EntryFormPositionSetting = () => {
  const { pos, setPos, isTop } = useEntryFormPosition();
  console.log(pos, isTop)
  return (
    <div className="space-y-5">
      <div>
        <h3 className=" font-semibold tracking-normal font-foreground text-[17px]">
          Command bar placement
        </h3>
        <p className="text-foreground/60 tracking-wider font-medium text-sm">
          Determine which placement of the command bar more convenient. Top or
          bottom
        </p>
      </div>
      {/* options */}
      <div className="flex gap-3">
        <PositionOption pos="top" checked={isTop} onClick={() => setPos("top")}/>
        <PositionOption pos="bottom" checked={!isTop} onClick={() => setPos("bottom")}/>

        {/* <Skeleton className="w-52 h-32" />
        <Skeleton className="w-52 h-32" /> */}
      </div>
    </div>
  );
};

export default EntryFormPositionSetting;

const PositionOption = ({
  pos,
  checked,
  ...rest
}: PositionOptionProps) => {
  return (
    <div {...rest}>

    <div
      className={cn(
        "w-52 h-32 cursor-pointer hover:bg-white/20 bg-product-card border-2 rounded-lg flex p-3 justify-center",
        checked ? "border-foreground" : "",
        pos === "top" ? "items-start" : "items-end",
      )}
    >
      <div className="relative py-3 w-full bg-foreground/40 rounded-lg" />
      <div className="p-3 ml-2 bg-foreground/40 rounded-lg">
      </div>
    </div>
    <p className="paragraph-sm text-center mt-2 text-foreground/60 capitalize">{pos}</p>
    </div>

  );
};
