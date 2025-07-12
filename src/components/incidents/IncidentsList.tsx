import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, User, Edit, Trash2, Eye } from "lucide-react";

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
  images?: string[];
  videos?: string[];
}

const initialIncidents: Incident[] = [
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
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<Omit<Incident, 'id' | 'createdAt' | 'resolvedAt'>>({
    title: "",
    description: "",
    apartment: "",
    resident: "",
    status: "open",
    priority: "medium",
    category: "maintenance",
    images: [],
    videos: []
  });

  const filteredIncidents = incidents.filter(incident => {
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

  // CRUD Functions
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      apartment: "",
      resident: "",
      status: "open",
      priority: "medium",
      category: "maintenance",
      images: [],
      videos: []
    });
  };

  const handleCreate = () => {
    const newIncident: Incident = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    setIncidents([...incidents, newIncident]);
    resetForm();
    setShowCreateDialog(false);
    toast({
      title: "Ocorrência criada com sucesso!",
      description: `${newIncident.title} foi registrada no sistema.`,
    });
  };

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      apartment: incident.apartment,
      resident: incident.resident,
      status: incident.status,
      priority: incident.priority,
      category: incident.category,
      images: incident.images || [],
      videos: incident.videos || []
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedIncident) return;
    
    const updatedIncidents = incidents.map(incident =>
      incident.id === selectedIncident.id
        ? { ...incident, ...formData }
        : incident
    );
    
    setIncidents(updatedIncidents);
    resetForm();
    setShowEditDialog(false);
    setSelectedIncident(null);
    toast({
      title: "Ocorrência atualizada com sucesso!",
      description: `As informações foram atualizadas.`,
    });
  };

  const handleResolve = (incident: Incident) => {
    const updatedIncidents = incidents.map(i =>
      i.id === incident.id
        ? { ...i, status: "resolved" as const, resolvedAt: new Date().toISOString() }
        : i
    );
    
    setIncidents(updatedIncidents);
    toast({
      title: "Ocorrência resolvida!",
      description: `${incident.title} foi marcada como resolvida.`,
    });
  };

  const handleDelete = (incident: Incident) => {
    const updatedIncidents = incidents.filter(i => i.id !== incident.id);
    setIncidents(updatedIncidents);
    toast({
      title: "Ocorrência removida",
      description: `${incident.title} foi removida do sistema.`,
      variant: "destructive"
    });
  };

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailsDialog(true);
  };

  const handleFileUpload = (files: FileList, type: 'images' | 'videos') => {
    const fileArray = Array.from(files);
    const urls = fileArray.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), ...urls]
    }));
  };

  const removeFile = (index: number, type: 'images' | 'videos') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type]?.filter((_, i) => i !== index) || []
    }));
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
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Ocorrência</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Título da ocorrência"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva a ocorrência em detalhes..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Apartamento</label>
                  <Input
                    value={formData.apartment}
                    onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                    placeholder="Apt 101 ou Área Comum"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Morador</label>
                  <Input
                    value={formData.resident}
                    onChange={(e) => setFormData({...formData, resident: e.target.value})}
                    placeholder="Nome do morador"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="maintenance">Manutenção</option>
                    <option value="security">Segurança</option>
                    <option value="noise">Ruído</option>
                    <option value="cleaning">Limpeza</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="open">Aberta</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="resolved">Resolvida</option>
                    <option value="closed">Fechada</option>
                  </select>
                </div>
              </div>
              
              {/* Upload de Imagens e Vídeos */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Imagens</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'images')}
                    className="w-full p-2 border rounded-lg"
                  />
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Upload ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeFile(index, 'images')}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Vídeos</label>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'videos')}
                    className="w-full p-2 border rounded-lg"
                  />
                  {formData.videos && formData.videos.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Vídeo {index + 1}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFile(index, 'videos')}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate} className="bg-gradient-primary">
                  Criar Ocorrência
                </Button>
                <Button variant="outline" onClick={() => {setShowCreateDialog(false); resetForm();}}>
                  Cancelar
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
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(incident)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(incident)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    {incident.status === "open" && (
                      <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleResolve(incident)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    )}
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
                            Tem certeza que deseja excluir a ocorrência "{incident.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(incident)} className="bg-destructive text-destructive-foreground">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ocorrência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título da ocorrência"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva a ocorrência em detalhes..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Apartamento</label>
                <Input
                  value={formData.apartment}
                  onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  placeholder="Apt 101 ou Área Comum"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Morador</label>
                <Input
                  value={formData.resident}
                  onChange={(e) => setFormData({...formData, resident: e.target.value})}
                  placeholder="Nome do morador"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="maintenance">Manutenção</option>
                  <option value="security">Segurança</option>
                  <option value="noise">Ruído</option>
                  <option value="cleaning">Limpeza</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="open">Aberta</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="resolved">Resolvida</option>
                  <option value="closed">Fechada</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdate} className="bg-gradient-primary">
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => {setShowEditDialog(false); resetForm();}}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título</label>
                <p className="text-lg font-medium">{selectedIncident.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-base">{selectedIncident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Apartamento</label>
                  <p className="text-lg font-medium">{selectedIncident.apartment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Morador</label>
                  <p className="text-lg font-medium">{selectedIncident.resident}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusConfig(selectedIncident.status).className}>
                    {getStatusConfig(selectedIncident.status).label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
                  <Badge variant="outline" className={getPriorityConfig(selectedIncident.priority).className}>
                    {getPriorityConfig(selectedIncident.priority).label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                  <Badge variant="outline" className={getCategoryConfig(selectedIncident.category).className}>
                    {getCategoryConfig(selectedIncident.category).label}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criada em</label>
                  <p className="text-base">{formatDate(selectedIncident.createdAt)}</p>
                </div>
                {selectedIncident.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolvida em</label>
                    <p className="text-base">{formatDate(selectedIncident.resolvedAt)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => {setShowDetailsDialog(false); handleEdit(selectedIncident);}} className="bg-gradient-primary">
                  Editar
                </Button>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}