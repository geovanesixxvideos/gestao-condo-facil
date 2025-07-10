import { useState } from "react";
import { Building2, Search, Plus, MapPin, Users, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Condominium {
  id: string;
  name: string;
  address: string;
  units: number;
  residents: number;
  manager: string;
  phone: string;
  email: string;
  status: "Ativo" | "Inativo";
  type: "Residencial" | "Comercial" | "Misto";
  description?: string;
}

const mockCondominiums: Condominium[] = [
  {
    id: "1",
    name: "Residencial Jardim das Flores",
    address: "Rua das Flores, 123 - Centro",
    units: 24,
    residents: 68,
    manager: "João Silva",
    phone: "(11) 99999-9999",
    email: "joao@email.com",
    status: "Ativo",
    type: "Residencial",
    description: "Condomínio residencial com área de lazer completa"
  },
  {
    id: "2", 
    name: "Edifício Comercial Central",
    address: "Av. Principal, 456 - Centro",
    units: 15,
    residents: 0,
    manager: "Maria Santos",
    phone: "(11) 88888-8888",
    email: "maria@email.com",
    status: "Ativo",
    type: "Comercial",
    description: "Edifício comercial no centro da cidade"
  },
  {
    id: "3",
    name: "Condomínio Vila Verde",
    address: "Rua Verde, 789 - Vila Nova",
    units: 48,
    residents: 142,
    manager: "Pedro Costa",
    phone: "(11) 77777-7777", 
    email: "pedro@email.com",
    status: "Inativo",
    type: "Residencial",
    description: "Grande condomínio residencial com clube"
  }
];

export default function CondominiumsList() {
  const [condominiums, setCondominiums] = useState<Condominium[]>(mockCondominiums);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);
  const [formData, setFormData] = useState<Partial<Condominium>>({});
  const { toast } = useToast();

  const filteredCondominiums = condominiums.filter(condo =>
    condo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.name || !formData.address || !formData.manager) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newCondominium: Condominium = {
      id: Date.now().toString(),
      name: formData.name,
      address: formData.address,
      units: formData.units || 0,
      residents: 0,
      manager: formData.manager,
      phone: formData.phone || "",
      email: formData.email || "",
      status: formData.status as "Ativo" | "Inativo" || "Ativo",
      type: formData.type as "Residencial" | "Comercial" | "Misto" || "Residencial",
      description: formData.description || ""
    };

    setCondominiums([...condominiums, newCondominium]);
    setFormData({});
    setIsCreateDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Condomínio cadastrado com sucesso!"
    });
  };

  const handleEdit = () => {
    if (!selectedCondominium || !formData.name || !formData.address || !formData.manager) {
      toast({
        title: "Erro", 
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const updatedCondominiums = condominiums.map(condo =>
      condo.id === selectedCondominium.id
        ? { ...condo, ...formData }
        : condo
    );

    setCondominiums(updatedCondominiums);
    setIsEditDialogOpen(false);
    setSelectedCondominium(null);
    setFormData({});
    toast({
      title: "Sucesso",
      description: "Condomínio atualizado com sucesso!"
    });
  };

  const handleDelete = (id: string) => {
    setCondominiums(condominiums.filter(condo => condo.id !== id));
    toast({
      title: "Sucesso",
      description: "Condomínio excluído com sucesso!"
    });
  };

  const openEditDialog = (condominium: Condominium) => {
    setSelectedCondominium(condominium);
    setFormData(condominium);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (condominium: Condominium) => {
    setSelectedCondominium(condominium);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === "Ativo" ? "bg-green-500/10 text-green-600 border-green-200" : "bg-red-500/10 text-red-600 border-red-200";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Residencial": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "Comercial": return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "Misto": return "bg-orange-500/10 text-orange-600 border-orange-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Condomínios</h1>
          <p className="text-muted-foreground">Gerencie todos os condomínios cadastrados</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-elegant">
              <Plus className="h-4 w-4 mr-2" />
              Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Condomínio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome*</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Nome do condomínio"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Endereço*</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="col-span-3"
                  placeholder="Endereço completo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="units" className="text-right">Unidades</Label>
                <Input
                  id="units"
                  type="number"
                  value={formData.units || ""}
                  onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="Número de unidades"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manager" className="text-right">Síndico*</Label>
                <Input
                  id="manager"
                  value={formData.manager || ""}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="col-span-3"
                  placeholder="Nome do síndico"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="col-span-3"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tipo</Label>
                <Select
                  value={formData.type || "Residencial"}
                  onValueChange={(value) => setFormData({ ...formData, type: value as "Residencial" | "Comercial" | "Misto" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select
                  value={formData.status || "Ativo"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "Ativo" | "Inativo" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Descrição do condomínio (opcional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate} className="bg-gradient-primary hover:opacity-90">
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-accent/20 shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, endereço ou síndico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-accent/20 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{condominiums.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {condominiums.filter(c => c.status === "Ativo").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unidades</p>
                <p className="text-2xl font-bold text-blue-600">
                  {condominiums.reduce((acc, c) => acc + c.units, 0)}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moradores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {condominiums.reduce((acc, c) => acc + c.residents, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condominiums List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCondominiums.map((condominium) => (
          <Card key={condominium.id} className="border-accent/20 shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground mb-1">
                    {condominium.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {condominium.address}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(condominium.status)}>
                    {condominium.status}
                  </Badge>
                  <Badge className={getTypeColor(condominium.type)}>
                    {condominium.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Unidades</p>
                  <p className="font-medium">{condominium.units}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Moradores</p>
                  <p className="font-medium">{condominium.residents}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Síndico</p>
                <p className="font-medium">{condominium.manager}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openViewDialog(condominium)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(condominium)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o condomínio "{condominium.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(condominium.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCondominiums.length === 0 && (
        <Card className="border-accent/20 shadow-soft">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum condomínio encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente ajustar sua busca" : "Cadastre o primeiro condomínio"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Condomínio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Nome*</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Nome do condomínio"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">Endereço*</Label>
              <Input
                id="edit-address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-units" className="text-right">Unidades</Label>
              <Input
                id="edit-units"
                type="number"
                value={formData.units || ""}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                placeholder="Número de unidades"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-manager" className="text-right">Síndico*</Label>
              <Input
                id="edit-manager"
                value={formData.manager || ""}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="col-span-3"
                placeholder="Nome do síndico"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Tipo</Label>
              <Select
                value={formData.type || "Residencial"}
                onValueChange={(value) => setFormData({ ...formData, type: value as "Residencial" | "Comercial" | "Misto" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residencial">Residencial</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select
                value={formData.status || "Ativo"}
                onValueChange={(value) => setFormData({ ...formData, status: value as "Ativo" | "Inativo" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Descrição do condomínio"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEdit} className="bg-gradient-primary hover:opacity-90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Condomínio</DialogTitle>
          </DialogHeader>
          {selectedCondominium && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                  <p className="text-sm">{selectedCondominium.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <Badge className={getTypeColor(selectedCondominium.type)}>
                    {selectedCondominium.type}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                <p className="text-sm">{selectedCondominium.address}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unidades</Label>
                  <p className="text-sm">{selectedCondominium.units}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Moradores</Label>
                  <p className="text-sm">{selectedCondominium.residents}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedCondominium.status)}>
                    {selectedCondominium.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Síndico</Label>
                <p className="text-sm">{selectedCondominium.manager}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                  <p className="text-sm">{selectedCondominium.phone || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedCondominium.email || "Não informado"}</p>
                </div>
              </div>

              {selectedCondominium.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedCondominium.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}