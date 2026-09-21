import { createContext, useContext, useMemo, useState } from "react";
import { useUserCondominiums, CondoOption } from "./useUserCondominiums";

interface CondoFilterContextValue {
  condominiums: CondoOption[];
  loading: boolean;
  selectedId: string;
  setSelectedId: (id: string) => void;
  matches: (condominiumId?: string | null) => boolean;
}

const CondoFilterContext = createContext<CondoFilterContextValue | undefined>(undefined);

export function CondoFilterProvider({ children }: { children: React.ReactNode }) {
  const { condominiums, loading } = useUserCondominiums();
  const [selectedId, setSelectedId] = useState("all");

  const value = useMemo<CondoFilterContextValue>(
    () => ({
      condominiums,
      loading,
      selectedId,
      setSelectedId,
      matches: (condominiumId) => selectedId === "all" || condominiumId === selectedId,
    }),
    [condominiums, loading, selectedId]
  );

  return <CondoFilterContext.Provider value={value}>{children}</CondoFilterContext.Provider>;
}

export function useCondoFilter() {
  const ctx = useContext(CondoFilterContext);
  if (!ctx) {
    return {
      condominiums: [] as CondoOption[],
      loading: false,
      selectedId: "all",
      setSelectedId: () => {},
      matches: () => true,
    } as CondoFilterContextValue;
  }
  return ctx;
}
