import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, User, Phone, Mail, MapPin } from "lucide-react";

interface Resident {
  id: string;
  name: string;
  apartment: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "pending";
  type: "owner" | "renter" | "authorized";
  joinDate: string;
}

const mockResidents: Resident[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    apartment: "Apt 101",
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
    phone: "(11) 66666-6666",
    email: "pedro.santos@email.com", 
    status: "active",
    type: "authorized",
    joinDate: "2023-08-05"
  }
];

export default function ResidentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredResidents = mockResidents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Morador
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, apartamento ou email..."
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
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
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}