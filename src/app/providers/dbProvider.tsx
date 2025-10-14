import React, { createContext, useContext, useEffect, useState } from "react";
import { getDB } from "@/localdb/db";
import { type AppDatabase } from "@/localdb/types/types";

const DbCtx = createContext<AppDatabase | null>(null);
export const useDb = () => {
  const v = useContext(DbCtx);
  if (!v) throw new Error("useDb outside of DbProvider");
  return v;
};

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AppDatabase | null>(null);
  useEffect(() => {
    getDB().then(setDb);
  }, []);
  if (!db) return null; // splash or skeleton
  return <DbCtx.Provider value={db}>{children}</DbCtx.Provider>;
}
