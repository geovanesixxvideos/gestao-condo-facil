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
import { Search, Plus, Megaphone, Calendar, User, Pin, Building2, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserCondominiums } from "@/hooks/useUserCondominiums";

interface Notice {
  id: string;
  condominium_id: string;
  created_by: string;
  title: string;
  content: string;
  author: string | null;
  priority: string;
  category: string;
  pinned: boolean;
  created_at: string;
}

export default function NoticesList() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { condominiums } = useUserCondominiums();
  const [notices, setNotices] = useState<(Notice & { condo_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState<Partial<Notice>>({ priority: "medium", category: "general", pinned: false });

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("notices").select("*, condominiums(name)").order("pinned", { ascending: false }).order("created_at", { ascending: false });
    setNotices((data ?? []).map((n: any) => ({ ...n, condo_name: n.condominiums?.name })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = notices.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const submit = async () => {
    if (!form.title || !form.content || !form.condominium_id) {
      return toast({ title: "Erro", description: "Título, conteúdo e condomínio obrigatórios", variant: "destructive" });
    }
    if (editing) {
      const { error } = await supabase.from("notices").update({
        title: form.title, content: form.content, priority: form.priority,
        category: form.category, pinned: form.pinned, author: form.author,
      }).eq("id", editing.id);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Atualizado!" });
    } else {
      const { error } = await supabase.from("notices").insert({
        condominium_id: form.condominium_id!, created_by: user!.id,
        title: form.title!, content: form.content!,
        author: form.author ?? user?.email ?? null,
        priority: form.priority ?? "medium",
        category: form.category ?? "general",
        pinned: form.pinned ?? false,
      });
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Aviso publicado!" });
    }
    setForm({ priority: "medium", category: "general", pinned: false });
    setEditing(null); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removido" }); load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Avisos e Comunicados</h1>
          <p className="text-muted-foreground mt-1">{isSindico ? "Mantenha os moradores informados" : "Avisos do seu condomínio"}</p>
        </div>
        {isSindico && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ priority: "medium", category: "general", pinned: false }); } }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Novo Aviso</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Aviso</DialogTitle></DialogHeader>
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
                  <Label>Conteúdo *</Label>
                  <Textarea value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Select value={form.category || "general"} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem><SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem><SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="emergency">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pinned" checked={form.pinned ?? false} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                  <Label htmlFor="pinned">Fixar no topo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} className="bg-gradient-primary">{editing ? "Salvar" : "Publicar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card><CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </CardContent></Card>

      {loading ? <p className="text-center text-muted-foreground">Carregando...</p> :
        filtered.length === 0 ? <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhum aviso publicado.</CardContent></Card> :
        <div className="space-y-4">
          {filtered.map(n => (
            <Card key={n.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {n.pinned && <Pin className="h-4 w-4 text-warning" />}
                        <h3 className="text-lg font-semibold">{n.title}</h3>
                        <Badge variant="outline">{n.priority}</Badge>
                        <Badge variant="outline">{n.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 whitespace-pre-wrap">{n.content}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />{n.condo_name}</span>
                        {n.author && <span className="flex items-center"><User className="h-4 w-4 mr-1" />{n.author}</span>}
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(n.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  {isSindico && n.created_by === user?.id && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditing(n); setForm(n); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
