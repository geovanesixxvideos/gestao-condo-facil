CREATE TABLE public.condominium_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominium_id uuid NOT NULL UNIQUE REFERENCES public.condominiums(id) ON DELETE CASCADE,
  cnpj text,
  contact_phone text,
  contact_email text,
  admin_name text,
  admin_email text,
  admin_phone text,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  payment_reminders boolean NOT NULL DEFAULT true,
  maintenance_alerts boolean NOT NULL DEFAULT true,
  event_notifications boolean NOT NULL DEFAULT false,
  default_due_day integer NOT NULL DEFAULT 10,
  late_fee_percent numeric NOT NULL DEFAULT 2,
  interest_rate_percent numeric NOT NULL DEFAULT 1,
  minimum_balance numeric NOT NULL DEFAULT 0,
  auto_generate_bills boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.condominium_settings TO authenticated;
GRANT ALL ON public.condominium_settings TO service_role;

ALTER TABLE public.condominium_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver configuracoes do meu condominio"
ON public.condominium_settings FOR SELECT TO authenticated
USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Sindico cria configuracoes"
ON public.condominium_settings FOR INSERT TO authenticated
WITH CHECK (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico edita configuracoes"
ON public.condominium_settings FOR UPDATE TO authenticated
USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico remove configuracoes"
ON public.condominium_settings FOR DELETE TO authenticated
USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE TRIGGER set_condominium_settings_updated_at
BEFORE UPDATE ON public.condominium_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;