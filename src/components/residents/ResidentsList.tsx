import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, User, Phone, Mail, MapPin, Edit, Trash2, Eye, Building2 } from "lucide-react";

interface Resident {
  id: string;
  name: string;
  apartment: string;
  condominium: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "pending";
  type: "owner" | "renter" | "authorized";
  joinDate: string;
}

const initialResidents: Resident[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    apartment: "Apt 101",
    condominium: "Residencial Jardim das Flores",
    phone: "(11) 99999-9999",
    email: "maria.silva@email.com",
    status: "active",
    type: "owner",
    joinDate: "2023-01-15"
  },
  {
    id: "2",
    name: "João Oliveira",
    apartment: "Apt 102",
    condominium: "Residencial Jardim das Flores", 
    phone: "(11) 88888-8888",
    email: "joao.oliveira@email.com",
    status: "active",
    type: "renter",
    joinDate: "2023-03-20"
  },
  {
    id: "3",
    name: "Ana Costa",
    apartment: "Apt 205",
    condominium: "Condomínio Vila Verde",
    phone: "(11) 77777-7777", 
    email: "ana.costa@email.com",
    status: "pending",
    type: "owner",
    joinDate: "2024-01-10"
  },
  {
    id: "4",
    name: "Pedro Santos",
    apartment: "Apt 304",
    condominium: "Edifício Comercial Central",
    phone: "(11) 66666-6666",
    email: "pedro.santos@email.com", 
    status: "active",
    type: "authorized",
    joinDate: "2023-08-05"
  }
];

export default function ResidentsList() {
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<Omit<Resident, 'id'>>({
    name: "",
    apartment: "",
    condominium: "",
    phone: "",
    email: "",
    status: "active",
    type: "owner",
    joinDate: new Date().toISOString().split('T')[0]
  });

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.condominium.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || resident.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const, className: "bg-success text-success-foreground" },
      inactive: { label: "Inativo", variant: "secondary" as const, className: "bg-muted text-muted-foreground" },
      pending: { label: "Pendente", variant: "outline" as const, className: "bg-warning/20 text-warning border-warning" }
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      owner: { label: "Proprietário", className: "bg-primary/20 text-primary" },
      renter: { label: "Inquilino", className: "bg-secondary/20 text-secondary" },
      authorized: { label: "Autorizado", className: "bg-accent/20 text-accent-foreground" }
    };

    return typeConfig[type as keyof typeof typeConfig] || typeConfig.owner;
  };

  // CRUD Functions
  const resetForm = () => {
    setFormData({
      name: "",
      apartment: "",
      condominium: "",
      phone: "",
      email: "",
      status: "active",
      type: "owner",
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreate = () => {
    const newResident: Resident = {
      id: Date.now().toString(),
      ...formData
    };
    
    setResidents([...residents, newResident]);
    resetForm();
    setShowCreateDialog(false);
    toast({
      title: "Morador criado com sucesso!",
      description: `${newResident.name} foi adicionado ao sistema.`,
    });
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      name: resident.name,
      apartment: resident.apartment,
      condominium: resident.condominium,
      phone: resident.phone,
      email: resident.email,
      status: resident.status,
      type: resident.type,
      joinDate: resident.joinDate
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedResident) return;
    
    const updatedResidents = residents.map(resident =>
      resident.id === selectedResident.id
        ? { ...resident, ...formData }
        : resident
    );
    
    setResidents(updatedResidents);
    resetForm();
    setShowEditDialog(false);
    setSelectedResident(null);
    toast({
      title: "Morador atualizado com sucesso!",
      description: `As informações foram atualizadas.`,
    });
  };

  const handleDelete = (resident: Resident) => {
    const updatedResidents = residents.filter(r => r.id !== resident.id);
    setResidents(updatedResidents);
    toast({
      title: "Morador removido",
      description: `${resident.name} foi removido do sistema.`,
      variant: "destructive"
    });
  };

  const handleViewDetails = (resident: Resident) => {
    setSelectedResident(resident);
    setShowDetailsDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Moradores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os moradores e unidades do condomínio
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Morador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Morador</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo do morador"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condomínio *</label>
                  <Input
                    value={formData.condominium}
                    onChange={(e) => setFormData({...formData, condominium: e.target.value})}
                    placeholder="Nome do condomínio"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apartamento/Unidade *</label>
                  <Input
                    value={formData.apartment}
                    onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                    placeholder="Apt 101, Sala 205, etc."
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Ingresso</label>
                  <Input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full h-10 p-2 border rounded-lg bg-background"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    className="w-full h-10 p-2 border rounded-lg bg-background"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="owner">Proprietário</option>
                    <option value="renter">Inquilino</option>
                    <option value="authorized">Autorizado</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => {setShowCreateDialog(false); resetForm();}}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} className="bg-gradient-primary min-w-[120px]">
                  Criar Morador
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, apartamento, condomínio ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              onClick={() => setFilterStatus("active")}
              size="sm"
            >
              Ativos
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pendentes
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">248</p>
            <p className="text-sm text-muted-foreground">Total de Moradores</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">232</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">12</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">4</p>
            <p className="text-sm text-muted-foreground">Inativos</p>
          </div>
        </Card>
      </div>

      {/* Residents List */}
      <Card className="shadow-medium">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Lista de Moradores ({filteredResidents.length})</h3>
        </div>
        <div className="divide-y">
          {filteredResidents.map((resident) => (
            <div key={resident.id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{resident.name}</h4>
                      <Badge className={getStatusBadge(resident.status).className}>
                        {getStatusBadge(resident.status).label}
                      </Badge>
                      <Badge variant="outline" className={getTypeBadge(resident.type).className}>
                        {getTypeBadge(resident.type).label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {resident.condominium}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {resident.apartment}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {resident.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {resident.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(resident)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(resident)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir {resident.name}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(resident)} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Morador</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome completo do morador"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condomínio *</label>
                <Input
                  value={formData.condominium}
                  onChange={(e) => setFormData({...formData, condominium: e.target.value})}
                  placeholder="Nome do condomínio"
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Apartamento/Unidade *</label>
                <Input
                  value={formData.apartment}
                  onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  placeholder="Apt 101, Sala 205, etc."
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Ingresso</label>
                <Input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full h-10 p-2 border rounded-lg bg-background"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  className="w-full h-10 p-2 border rounded-lg bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="owner">Proprietário</option>
                  <option value="renter">Inquilino</option>
                  <option value="authorized">Autorizado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => {setShowEditDialog(false); resetForm();}}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} className="bg-gradient-primary min-w-[120px]">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Morador</DialogTitle>
          </DialogHeader>
          {selectedResident && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="text-lg font-medium">{selectedResident.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Condomínio</label>
                  <p className="text-lg font-medium">{selectedResident.condominium}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Apartamento/Unidade</label>
                  <p className="text-lg font-medium">{selectedResident.apartment}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-lg font-medium">{selectedResident.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg font-medium">{selectedResident.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Data de Ingresso</label>
                  <p className="text-lg font-medium">{formatDate(selectedResident.joinDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusBadge(selectedResident.status).className}>
                    {getStatusBadge(selectedResident.status).label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant="outline" className={getTypeBadge(selectedResident.type).className}>
                    {getTypeBadge(selectedResident.type).label}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {setShowDetailsDialog(false); handleEdit(selectedResident);}} className="bg-gradient-primary">
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}