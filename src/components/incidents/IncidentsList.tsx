import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserCondominiums } from "@/hooks/useUserCondominiums";

interface Incident {
  id: string;
  condominium_id: string;
  created_by: string;
  title: string;
  description: string | null;
  apartment: string | null;
  resident_name: string | null;
  status: string;
  priority: string;
  category: string;
  created_at: string;
}

export default function IncidentsList() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { condominiums } = useUserCondominiums();
  const [incidents, setIncidents] = useState<(Incident & { condo_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [form, setForm] = useState<Partial<Incident>>({ status: "open", priority: "medium", category: "maintenance" });

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("incidents").select("*, condominiums(name)").order("created_at", { ascending: false });
    setIncidents((data ?? []).map((i: any) => ({ ...i, condo_name: i.condominiums?.name })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = incidents.filter(i => {
    const m = i.title.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || i.status === filter;
    return m && f;
  });

  const submit = async () => {
    if (!form.title || !form.condominium_id) {
      return toast({ title: "Erro", description: "Título e condomínio são obrigatórios", variant: "destructive" });
    }
    if (editing) {
      const { error } = await supabase.from("incidents").update({
        title: form.title, description: form.description, apartment: form.apartment,
        resident_name: form.resident_name, status: form.status, priority: form.priority, category: form.category,
        resolved_at: form.status === "resolved" ? new Date().toISOString() : null,
      }).eq("id", editing.id);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Atualizada!" });
    } else {
      const { error } = await supabase.from("incidents").insert({
        condominium_id: form.condominium_id!,
        created_by: user!.id,
        title: form.title!,
        description: form.description ?? null,
        apartment: form.apartment ?? null,
        resident_name: form.resident_name ?? null,
        status: form.status ?? "open",
        priority: form.priority ?? "medium",
        category: form.category ?? "maintenance",
      });
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Ocorrência criada!" });
    }
    setForm({ status: "open", priority: "medium", category: "maintenance" });
    setEditing(null); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("incidents").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removida" }); load();
  };

  const openEdit = (i: Incident) => { setEditing(i); setForm(i); setOpen(true); };

  const statusConfig: any = {
    open: { label: "Aberta", icon: AlertTriangle, className: "bg-destructive/20 text-destructive" },
    in_progress: { label: "Em Andamento", icon: Clock, className: "bg-warning/20 text-warning" },
    resolved: { label: "Resolvida", icon: CheckCircle, className: "bg-success/20 text-success" },
    closed: { label: "Fechada", icon: XCircle, className: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ocorrências</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as ocorrências do seu condomínio</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ status: "open", priority: "medium", category: "maintenance" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Ocorrência</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Ocorrência</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condomínio *</Label>
                <Select value={form.condominium_id || ""} onValueChange={(v) => setForm({ ...form, condominium_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{condominiums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apartamento</Label>
                  <Input value={form.apartment || ""} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Morador</Label>
                  <Input value={form.resident_name || ""} onChange={(e) => setForm({ ...form, resident_name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={form.priority || "medium"} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category || "maintenance"} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Manutenção</SelectItem><SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="noise">Ruído</SelectItem><SelectItem value="cleaning">Limpeza</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isSindico && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status || "open"} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberta</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="resolved">Resolvida</SelectItem><SelectItem value="closed">Fechada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} className="bg-gradient-primary">{editing ? "Salvar" : "Criar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {["all", "open", "in_progress", "resolved"].map(s => (
              <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
                {s === "all" ? "Todas" : statusConfig[s]?.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent></Card>

      {loading ? <p className="text-center text-muted-foreground">Carregando...</p> :
        filtered.length === 0 ? <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhuma ocorrência.</CardContent></Card> :
        <div className="space-y-4">
          {filtered.map(i => {
            const sc = statusConfig[i.status] || statusConfig.open;
            const canEdit = isSindico || i.created_by === user?.id;
            return (
              <Card key={i.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{i.title}</h3>
                        <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                        <Badge variant="outline">{i.priority}</Badge>
                        <Badge variant="outline">{i.category}</Badge>
                      </div>
                      {i.description && <p className="text-muted-foreground mb-3">{i.description}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {i.apartment && <span>{i.apartment}</span>}
                        {i.resident_name && <span>• {i.resident_name}</span>}
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(i.created_at).toLocaleString("pt-BR")}</span>
                        <span>• {i.condo_name}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(i)}><Edit className="h-4 w-4" /></Button>
                        {isSindico && <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}
