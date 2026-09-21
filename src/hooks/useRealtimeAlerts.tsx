import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

/**
 * Avisa em tempo real quando um novo aviso ou ocorrência é criado
 * em um condomínio que o usuário pode ver (a RLS já garante o filtro).
 */
export function useRealtimeAlerts() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("alerts-avisos-ocorrencias")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notices" },
        (payload) => {
          const row = payload.new as { title?: string; created_by?: string };
          if (row.created_by === user.id) return;
          toast({ title: "Novo aviso", description: row.title ?? "Um novo aviso foi publicado." });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          const row = payload.new as { title?: string; created_by?: string };
          if (row.created_by === user.id) return;
          toast({ title: "Nova ocorrência", description: row.title ?? "Uma nova ocorrência foi registrada." });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
