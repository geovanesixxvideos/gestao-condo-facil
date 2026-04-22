import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, User, Phone, Mail, MapPin, Edit, Trash2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserCondominiums } from "@/hooks/useUserCondominiums";

interface Resident {
  id: string;
  user_id: string | null;
  condominium_id: string;
  name: string;
  email: string;
  apartment: string;
  phone: string | null;
  type: string;
  status: string;
  join_date: string;
}

export default function ResidentsList() {
  const { role } = useAuth();
  const { toast } = useToast();
  const { condominiums } = useUserCondominiums();
  const [residents, setResidents] = useState<(Resident & { condo_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [form, setForm] = useState<Partial<Resident>>({ status: "active", type: "owner" });

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("residents")
      .select("*, condominiums(name)")
      .order("created_at", { ascending: false });
    setResidents((data ?? []).map((r: any) => ({ ...r, condo_name: r.condominiums?.name })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.apartment.toLowerCase().includes(search.toLowerCase())
  );

  const submit = async () => {
    if (!form.name || !form.email || !form.apartment || !form.condominium_id) {
      return toast({ title: "Erro", description: "Preencha nome, email, apartamento e condomínio", variant: "destructive" });
    }
    if (editing) {
      const { error } = await supabase.from("residents").update({
        name: form.name, email: form.email, apartment: form.apartment,
        phone: form.phone, type: form.type, status: form.status, condominium_id: form.condominium_id,
      }).eq("id", editing.id);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Atualizado!" });
    } else {
      const { error } = await supabase.from("residents").insert({
        name: form.name, email: form.email, apartment: form.apartment,
        phone: form.phone ?? null, type: form.type ?? "owner",
        status: form.status ?? "active", condominium_id: form.condominium_id!,
      });
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Morador cadastrado!", description: "Quando ele se cadastrar com este e-mail, será vinculado ao condomínio automaticamente." });
    }
    setForm({ status: "active", type: "owner" }); setEditing(null); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("residents").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removido" }); load();
  };

  const openEdit = (r: Resident) => {
    setEditing(r);
    setForm(r);
    setOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Moradores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os moradores dos seus condomínios</p>
        </div>
        {isSindico && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ status: "active", type: "owner" }); } }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Novo Morador</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Morador</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Condomínio *</Label>
                    <Select value={form.condominium_id || ""} onValueChange={(v) => setForm({ ...form, condominium_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {condominiums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email * (será o login do morador)</Label>
                    <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Apartamento *</Label>
                    <Input value={form.apartment || ""} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.type || "owner"} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="renter">Inquilino</SelectItem>
                        <SelectItem value="authorized">Autorizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status || "active"} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} className="bg-gradient-primary">{editing ? "Salvar" : "Cadastrar"}</Button>
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
        filtered.length === 0 ? <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhum morador cadastrado.</CardContent></Card> :
        <Card>
          <div className="divide-y">
            {filtered.map(r => (
              <div key={r.id} className="p-6 hover:bg-muted/30">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium">{r.name}</h4>
                        <Badge>{r.status}</Badge>
                        <Badge variant="outline">{r.type}</Badge>
                        {!r.user_id && <Badge variant="outline" className="bg-warning/20 text-warning">Aguardando cadastro</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center"><Building2 className="h-4 w-4 mr-2" />{r.condo_name}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{r.apartment}</div>
                        <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />{r.phone || "-"}</div>
                        <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />{r.email}</div>
                      </div>
                    </div>
                  </div>
                  {isSindico && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      }
    </div>
  );
}
