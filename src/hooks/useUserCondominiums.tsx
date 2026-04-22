import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CondoOption {
  id: string;
  name: string;
}

export function useUserCondominiums() {
  const { user } = useAuth();
  const [condominiums, setCondominiums] = useState<CondoOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCondominiums([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("condominiums")
        .select("id, name")
        .order("name");
      setCondominiums(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return { condominiums, loading };
}
