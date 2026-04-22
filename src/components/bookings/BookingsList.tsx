import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, Clock, User, Trash2, Edit, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserCondominiums } from "@/hooks/useUserCondominiums";

interface Booking {
  id: string;
  condominium_id: string;
  created_by: string;
  area: string;
  resident_name: string;
  apartment: string | null;
  phone: string | null;
  email: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

export default function BookingsList() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { condominiums } = useUserCondominiums();
  const [bookings, setBookings] = useState<(Booking & { condo_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<Partial<Booking>>({ status: "pending" });

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*, condominiums(name)").order("date", { ascending: false });
    setBookings((data ?? []).map((b: any) => ({ ...b, condo_name: b.condominiums?.name })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter(b => {
    const m = b.area.toLowerCase().includes(search.toLowerCase()) || b.resident_name.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || b.status === filter;
    return m && f;
  });

  const submit = async () => {
    if (!form.area || !form.resident_name || !form.date || !form.start_time || !form.end_time || !form.condominium_id) {
      return toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
    }
    if (editing) {
      const { error } = await supabase.from("bookings").update({
        area: form.area, resident_name: form.resident_name, apartment: form.apartment,
        phone: form.phone, email: form.email, date: form.date, start_time: form.start_time,
        end_time: form.end_time, status: form.status, notes: form.notes,
      }).eq("id", editing.id);
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Atualizada!" });
    } else {
      const { error } = await supabase.from("bookings").insert({
        condominium_id: form.condominium_id!, created_by: user!.id,
        area: form.area!, resident_name: form.resident_name!,
        apartment: form.apartment ?? null, phone: form.phone ?? null, email: form.email ?? null,
        date: form.date!, start_time: form.start_time!, end_time: form.end_time!,
        status: form.status ?? "pending", notes: form.notes ?? null,
      });
      if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
      toast({ title: "Reserva criada!" });
    }
    setForm({ status: "pending" }); setEditing(null); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removida" }); load();
  };

  const statusConfig: any = {
    pending: { label: "Pendente", className: "bg-warning/20 text-warning" },
    confirmed: { label: "Confirmada", className: "bg-success/20 text-success" },
    cancelled: { label: "Cancelada", className: "bg-destructive/20 text-destructive" },
    completed: { label: "Concluída", className: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservas de Áreas Comuns</h1>
          <p className="text-muted-foreground mt-1">Reservas do seu condomínio</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ status: "pending" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Reserva</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Reserva</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condomínio *</Label>
                <Select value={form.condominium_id || ""} onValueChange={(v) => setForm({ ...form, condominium_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{condominiums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Área *</Label><Input value={form.area || ""} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Salão de Festas" /></div>
                <div className="space-y-2"><Label>Data *</Label><Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Início *</Label><Input type="time" value={form.start_time || ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fim *</Label><Input type="time" value={form.end_time || ""} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Morador *</Label><Input value={form.resident_name || ""} onChange={(e) => setForm({ ...form, resident_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Apartamento</Label><Input value={form.apartment || ""} onChange={(e) => setForm({ ...form, apartment: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Observações</Label><Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              {isSindico && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status || "pending"} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem><SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem><SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} className="bg-gradient-primary">{editing ? "Salvar" : "Reservar"}</Button>
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
            {["all", "pending", "confirmed", "completed"].map(s => (
              <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
                {s === "all" ? "Todas" : statusConfig[s]?.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent></Card>

      {loading ? <p className="text-center text-muted-foreground">Carregando...</p> :
        filtered.length === 0 ? <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhuma reserva.</CardContent></Card> :
        <div className="space-y-4">
          {filtered.map(b => {
            const sc = statusConfig[b.status] || statusConfig.pending;
            const canEdit = isSindico || b.created_by === user?.id;
            return (
              <Card key={b.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-lg">{b.area}</h4>
                          <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />{b.condo_name}</span>
                          <span className="flex items-center"><User className="h-4 w-4 mr-1" />{b.resident_name} {b.apartment && `(${b.apartment})`}</span>
                          <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(b.date).toLocaleDateString("pt-BR")}</span>
                          <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{b.start_time} - {b.end_time}</span>
                        </div>
                        {b.notes && <p className="text-sm text-muted-foreground mt-2">{b.notes}</p>}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(b); setForm(b); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
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
