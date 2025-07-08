import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, User } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  apartment: string;
  resident: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "maintenance" | "security" | "noise" | "cleaning" | "other";
  createdAt: string;
  resolvedAt?: string;
}

const mockIncidents: Incident[] = [
  {
    id: "1",
    title: "Vazamento no banheiro",
    description: "Há um vazamento constante na torneira do banheiro principal",
    apartment: "Apt 102",
    resident: "Maria Silva",
    status: "open",
    priority: "high",
    category: "maintenance",
    createdAt: "2024-01-15T10:30:00"
  },
  {
    id: "2",
    title: "Barulho excessivo",
    description: "Vizinho está fazendo muito barulho durante a madrugada",
    apartment: "Apt 205",
    resident: "João Oliveira",
    status: "in_progress", 
    priority: "medium",
    category: "noise",
    createdAt: "2024-01-14T22:15:00"
  },
  {
    id: "3",
    title: "Lâmpada queimada no corredor",
    description: "Lâmpada do corredor do 3º andar está queimada",
    apartment: "Área Comum",
    resident: "Ana Costa",
    status: "resolved",
    priority: "low",
    category: "maintenance",
    createdAt: "2024-01-13T14:20:00",
    resolvedAt: "2024-01-14T09:00:00"
  },
  {
    id: "4",
    title: "Problema na fechadura",
    description: "Porta do apartamento não está fechando corretamente",
    apartment: "Apt 304",
    resident: "Pedro Santos",
    status: "open",
    priority: "urgent",
    category: "security",
    createdAt: "2024-01-15T16:45:00"
  }
];

export default function IncidentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.resident.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || incident.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      open: { 
        label: "Aberta", 
        icon: AlertTriangle, 
        className: "bg-destructive/20 text-destructive border-destructive"
      },
      in_progress: { 
        label: "Em Andamento", 
        icon: Clock, 
        className: "bg-warning/20 text-warning border-warning"
      },
      resolved: { 
        label: "Resolvida", 
        icon: CheckCircle, 
        className: "bg-success/20 text-success border-success"
      },
      closed: { 
        label: "Fechada", 
        icon: XCircle, 
        className: "bg-muted text-muted-foreground border-muted"
      }
    };
    return configs[status as keyof typeof configs] || configs.open;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-primary/20 text-primary" },
      high: { label: "Alta", className: "bg-warning/20 text-warning" },
      urgent: { label: "Urgente", className: "bg-destructive/20 text-destructive" }
    };
    return configs[priority as keyof typeof configs] || configs.low;
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      maintenance: { label: "Manutenção", className: "bg-secondary/20 text-secondary" },
      security: { label: "Segurança", className: "bg-destructive/20 text-destructive" },
      noise: { label: "Ruído", className: "bg-warning/20 text-warning" },
      cleaning: { label: "Limpeza", className: "bg-success/20 text-success" },
      other: { label: "Outros", className: "bg-muted text-muted-foreground" }
    };
    return configs[category as keyof typeof configs] || configs.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ocorrências</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe todas as ocorrências do condomínio
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, apartamento ou morador..."
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
              Todas
            </Button>
            <Button
              variant={filterStatus === "open" ? "default" : "outline"}
              onClick={() => setFilterStatus("open")}
              size="sm"
            >
              Abertas
            </Button>
            <Button
              variant={filterStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setFilterStatus("in_progress")}
              size="sm"
            >
              Em Andamento
            </Button>
            <Button
              variant={filterStatus === "resolved" ? "default" : "outline"}
              onClick={() => setFilterStatus("resolved")}
              size="sm"
            >
              Resolvidas
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">7</p>
            <p className="text-sm text-muted-foreground">Abertas</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">3</p>
            <p className="text-sm text-muted-foreground">Em Andamento</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">45</p>
            <p className="text-sm text-muted-foreground">Resolvidas este mês</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">2.5h</p>
            <p className="text-sm text-muted-foreground">Tempo médio resolução</p>
          </div>
        </Card>
      </div>

      {/* Incidents List */}
      <Card className="shadow-medium">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Lista de Ocorrências ({filteredIncidents.length})</h3>
        </div>
        <div className="divide-y">
          {filteredIncidents.map((incident) => {
            const statusConfig = getStatusConfig(incident.status);
            const priorityConfig = getPriorityConfig(incident.priority);
            const categoryConfig = getCategoryConfig(incident.category);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={incident.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="h-10 w-10 bg-destructive/20 rounded-full flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{incident.title}</h4>
                          <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline" className={priorityConfig.className}>
                            {priorityConfig.label}
                          </Badge>
                          <Badge variant="outline" className={categoryConfig.className}>
                            {categoryConfig.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{incident.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {incident.resident} - {incident.apartment}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Criada em {formatDate(incident.createdAt)}
                          </div>
                          {incident.resolvedAt && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolvida em {formatDate(incident.resolvedAt)}
                            </div>
                          )}
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
                    {incident.status === "open" && (
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}