import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, TrendingUp, TrendingDown, AlertCircle, Building2, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserCondominiums } from "@/hooks/useUserCondominiums";

interface Tx {
  id: string;
  condominium_id: string;
  created_by: string;
  type: string;
  description: string;
  amount: number;
  apartment: string | null;
  category: string | null;
  status: string;
  due_date: string | null;
  date: string;
}

const formatCurrency = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function FinancialManager() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { condominiums } = useUserCondominiums();
  const [txs, setTxs] = useState<(Tx & { condo_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tx | null>(null);
  const [form, setForm] = useState<Partial<Tx>>({ type: "income", status: "pending" });

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("transactions").select("*, condominiums(name)").order("date", { ascending: false });
    setTxs((data ?? []).map((t: any) => ({ ...t, condo_name: t.condominiums?.name, amount: Number(t.amount) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = txs.filter(t => {
    const m = t.description.toLowerCase().includes(search.toLowerCase());
    const f = filterType === "all" || t.type === filterType;
    return m && f;
  });

  const submit = async () => {
    if (!form.description || !form.amount || !form.condominium_id) {
      return toast({ title: "Erro", description: "Descrição, valor e condomínio obrigatórios", variant: "destructive" });
    }
    if (editing) {
      const { error } = await supabase.from("transactions").update({
        type: form.type, description: form.description, amount: form.amount,
        apartment: form.apartment, category: form.category, status: form.status, due_date: form.due_date,
      }).eq("id", editing.id);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Atualizada!" });
    } else {
      const { error } = await supabase.from("transactions").insert({
        condominium_id: form.condominium_id!, created_by: user!.id,
        type: form.type ?? "income", description: form.description!,
        amount: form.amount!, apartment: form.apartment ?? null,
        category: form.category ?? null, status: form.status ?? "pending",
        due_date: form.due_date ?? null,
      });
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Transação criada!" });
    }
    setForm({ type: "income", status: "pending" }); setEditing(null); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removida" }); load();
  };

  const totalIncome = txs.filter(t => t.type === "income" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalExp = txs.filter(t => t.type === "expense" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const pending = txs.filter(t => t.type === "income" && t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExp;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-1">{isSindico ? "Controle financeiro dos condomínios" : "Financeiro do seu condomínio"}</p>
        </div>
        {isSindico && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ type: "income", status: "pending" }); } }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Transação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Transação</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Condomínio *</Label>
                  <Select value={form.condominium_id || ""} onValueChange={(v) => setForm({ ...form, condominium_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{condominiums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.type || "income"} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input type="number" step="0.01" value={form.amount ?? ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2"><Label>Descrição *</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Apartamento</Label><Input value={form.apartment || ""} onChange={(e) => setForm({ ...form, apartment: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Categoria</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status || "pending"} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vencimento</Label>
                    <Input type="date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} className="bg-gradient-primary">{editing ? "Salvar" : "Criar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(balance)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Receitas</p>
          <p className="text-2xl font-bold mt-1 text-success">{formatCurrency(totalIncome)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(totalExp)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Pendente</p>
          <p className="text-2xl font-bold mt-1 text-warning">{formatCurrency(pending)}</p>
        </CardContent></Card>
      </div>

      <Card><CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {[{v:"all",l:"Todas"},{v:"income",l:"Receitas"},{v:"expense",l:"Despesas"}].map(o => (
              <Button key={o.v} size="sm" variant={filterType === o.v ? "default" : "outline"} onClick={() => setFilterType(o.v)}>{o.l}</Button>
            ))}
          </div>
        </div>
      </CardContent></Card>

      {loading ? <p className="text-center text-muted-foreground">Carregando...</p> :
        filtered.length === 0 ? <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhuma transação.</CardContent></Card> :
        <Card>
          <div className="divide-y">
            {filtered.map(t => {
              const isIncome = t.type === "income";
              return (
                <div key={t.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isIncome ? "bg-success/20" : "bg-destructive/20"}`}>
                      {isIncome ? <TrendingUp className="h-6 w-6 text-success" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium">{t.description}</h4>
                        <Badge variant="outline">{t.status}</Badge>
                        {t.category && <Badge variant="outline">{t.category}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />{t.condo_name}</span>
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                        {t.apartment && <span>{t.apartment}</span>}
                        {t.due_date && t.status === "pending" && <span className="flex items-center"><AlertCircle className="h-4 w-4 mr-1" />Vence: {new Date(t.due_date).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    {isSindico && (
                      <div className="flex gap-2 mt-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(t); setForm(t); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      }
    </div>
  );
}
