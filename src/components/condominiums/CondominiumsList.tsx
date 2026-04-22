import { useEffect, useState } from "react";
import { Building2, Search, Plus, MapPin, Users, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Condominium {
  id: string;
  name: string;
  address: string;
  units: number;
  manager_name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  type: string;
  description: string | null;
  created_by: string;
}

export default function CondominiumsList() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState<Condominium | null>(null);
  const [formData, setFormData] = useState<Partial<Condominium>>({});

  const isSindico = role === "sindico";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("condominiums")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    setCondominiums((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = condominiums.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name || !formData.address) {
      toast({ title: "Erro", description: "Nome e endereço são obrigatórios", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("condominiums").insert({
      name: formData.name,
      address: formData.address,
      units: formData.units ?? 0,
      manager_name: formData.manager_name ?? null,
      phone: formData.phone ?? null,
      email: formData.email ?? null,
      type: formData.type ?? "Residencial",
      status: formData.status ?? "Ativo",
      description: formData.description ?? null,
      created_by: user!.id,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Condomínio criado!" });
    setFormData({}); setIsCreateOpen(false); load();
  };

  const handleEdit = async () => {
    if (!selected) return;
    const { error } = await supabase.from("condominiums").update({
      name: formData.name, address: formData.address, units: formData.units,
      manager_name: formData.manager_name, phone: formData.phone, email: formData.email,
      type: formData.type, status: formData.status, description: formData.description,
    }).eq("id", selected.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Atualizado!" }); setIsEditOpen(false); setSelected(null); setFormData({}); load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("condominiums").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Removido" }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Condomínios</h1>
          <p className="text-muted-foreground">Gerencie todos os condomínios cadastrados</p>
        </div>
        {isSindico && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-elegant">
                <Plus className="h-4 w-4 mr-2" /> Novo Condomínio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Condomínio</DialogTitle></DialogHeader>
              <CondoForm formData={formData} setFormData={setFormData} />
              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); setFormData({}); }}>Cancelar</Button>
                <Button onClick={handleCreate} className="bg-gradient-primary">Cadastrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="pt-6 text-center text-muted-foreground">Nenhum condomínio cadastrado.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Card key={c.id} className="shadow-soft hover:shadow-elegant transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />{c.address}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge>{c.status}</Badge>
                    <Badge variant="outline">{c.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Unidades</p><p className="font-medium">{c.units}</p></div>
                  <div><p className="text-muted-foreground">Síndico</p><p className="font-medium">{c.manager_name || "-"}</p></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelected(c); setIsViewOpen(true); }}>
                    <Eye className="h-3 w-3 mr-1" />Ver
                  </Button>
                  {isSindico && c.created_by === user?.id && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelected(c); setFormData(c); setIsEditOpen(true); }}>
                        <Edit className="h-3 w-3 mr-1" />Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Condomínio</DialogTitle></DialogHeader>
          <CondoForm formData={formData} setFormData={setFormData} />
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} className="bg-gradient-primary">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p><strong>Endereço:</strong> {selected.address}</p>
              <p><strong>Unidades:</strong> {selected.units}</p>
              <p><strong>Síndico:</strong> {selected.manager_name || "-"}</p>
              <p><strong>Telefone:</strong> {selected.phone || "-"}</p>
              <p><strong>Email:</strong> {selected.email || "-"}</p>
              <p><strong>Tipo:</strong> {selected.type}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              {selected.description && <p><strong>Descrição:</strong> {selected.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CondoForm({ formData, setFormData }: { formData: any; setFormData: (d: any) => void }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Unidades</Label>
          <Input type="number" value={formData.units || ""} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Endereço *</Label>
        <Input value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Síndico</Label>
          <Input value={formData.manager_name || ""} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={formData.type || "Residencial"} onValueChange={(v) => setFormData({ ...formData, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Residencial">Residencial</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
              <SelectItem value="Misto">Misto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status || "Ativo"} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
        </div>
      </div>
    </div>
  );
}
