-- ============ CONDOMÍNIOS ============
CREATE TABLE public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 0,
  manager_name TEXT,
  phone TEXT,
  email TEXT,
  type TEXT NOT NULL DEFAULT 'Residencial',
  status TEXT NOT NULL DEFAULT 'Ativo',
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- ============ MORADORES (vínculo user -> condomínio) ============
CREATE TABLE public.residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- pode ser nulo até o usuário se cadastrar
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  apartment TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL DEFAULT 'owner',
  status TEXT NOT NULL DEFAULT 'active',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (condominium_id, email)
);
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_residents_user ON public.residents(user_id);
CREATE INDEX idx_residents_condo ON public.residents(condominium_id);

-- ============ Função: condomínios do usuário (security definer) ============
CREATE OR REPLACE FUNCTION public.user_condominium_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  -- síndico vê os condomínios que criou
  SELECT id FROM public.condominiums WHERE created_by = _user_id
  UNION
  -- morador vê o condomínio em que está vinculado
  SELECT condominium_id FROM public.residents WHERE user_id = _user_id;
$$;

-- ============ Trigger: vincular resident.user_id quando o usuário se cadastra ============
CREATE OR REPLACE FUNCTION public.link_resident_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.residents
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_link_resident ON auth.users;
CREATE TRIGGER on_auth_user_created_link_resident
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.link_resident_on_signup();

-- ============ OCORRÊNCIAS ============
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  apartment TEXT,
  resident_name TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'maintenance',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- ============ AVISOS ============
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  pinned BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- ============ RESERVAS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  area TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  apartment TEXT,
  phone TEXT,
  email TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============ FINANCEIRO ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  type TEXT NOT NULL, -- income | expense
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  apartment TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============ Trigger updated_at ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_condo_upd BEFORE UPDATE ON public.condominiums FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_resid_upd BEFORE UPDATE ON public.residents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_inc_upd BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_not_upd BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_book_upd BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tx_upd BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ POLICIES ============

-- CONDOMINIUMS
CREATE POLICY "Sindicos criam condominios" ON public.condominiums
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'sindico') AND created_by = auth.uid());

CREATE POLICY "Ver condominios vinculados" ON public.condominiums
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Sindico edita seus condominios" ON public.condominiums
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Sindico remove seus condominios" ON public.condominiums
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND public.has_role(auth.uid(), 'sindico'));

-- RESIDENTS
CREATE POLICY "Sindico cria moradores nos seus condominios" ON public.residents
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'sindico')
    AND condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid())
  );

CREATE POLICY "Ver moradores do meu condominio" ON public.residents
  FOR SELECT TO authenticated
  USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Sindico edita moradores dos seus condominios" ON public.residents
  FOR UPDATE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico remove moradores dos seus condominios" ON public.residents
  FOR DELETE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

-- INCIDENTS (moradores podem criar ocorrências do próprio condomínio; síndico gerencia)
CREATE POLICY "Ver ocorrencias do meu condominio" ON public.incidents
  FOR SELECT TO authenticated
  USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Criar ocorrencias no meu condominio" ON public.incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND condominium_id IN (SELECT public.user_condominium_ids(auth.uid()))
  );

CREATE POLICY "Sindico edita ocorrencias" ON public.incidents
  FOR UPDATE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico remove ocorrencias" ON public.incidents
  FOR DELETE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

-- NOTICES (somente síndico cria/edita; moradores leem)
CREATE POLICY "Ver avisos do meu condominio" ON public.notices
  FOR SELECT TO authenticated
  USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Sindico cria avisos" ON public.notices
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid())
  );

CREATE POLICY "Sindico edita avisos" ON public.notices
  FOR UPDATE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico remove avisos" ON public.notices
  FOR DELETE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

-- BOOKINGS (moradores criam reservas no próprio condomínio)
CREATE POLICY "Ver reservas do meu condominio" ON public.bookings
  FOR SELECT TO authenticated
  USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Criar reservas no meu condominio" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND condominium_id IN (SELECT public.user_condominium_ids(auth.uid()))
  );

CREATE POLICY "Editar minhas reservas ou sindico" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid())
  );

CREATE POLICY "Remover minhas reservas ou sindico" ON public.bookings
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid())
  );

-- TRANSACTIONS (somente síndico gerencia; moradores leem)
CREATE POLICY "Ver financeiro do meu condominio" ON public.transactions
  FOR SELECT TO authenticated
  USING (condominium_id IN (SELECT public.user_condominium_ids(auth.uid())));

CREATE POLICY "Sindico cria transacoes" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid())
  );

CREATE POLICY "Sindico edita transacoes" ON public.transactions
  FOR UPDATE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));

CREATE POLICY "Sindico remove transacoes" ON public.transactions
  FOR DELETE TO authenticated
  USING (condominium_id IN (SELECT id FROM public.condominiums WHERE created_by = auth.uid()));