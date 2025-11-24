import { useAppSettings } from "@/localdb/store/appPreferences";
import { useShallow } from "zustand/react/shallow";

export const useEntryFormPosition = () =>
  useAppSettings(
    useShallow((s) => ({
      pos: s.entryFormPosition,
      setPos: s.setEntryFormPosition,
      isTop: s.entryFormPosition === "top",
    }))
  );
