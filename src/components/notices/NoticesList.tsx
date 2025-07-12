import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Megaphone, Calendar, User, Eye, Pin, AlertCircle, Building2, UserCheck } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "general" | "maintenance" | "financial" | "event" | "emergency";
  pinned: boolean;
  views: number;
  condominium: string;
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "Manutenção do elevador - Bloco A",
    content: "Informamos que no dia 20/01/2024 será realizada a manutenção preventiva do elevador do Bloco A. O serviço será das 8h às 17h. Pedimos a compreensão de todos.",
    author: "Administração",
    createdAt: "2024-01-15T09:00:00",
    priority: "high",
    category: "maintenance",
    pinned: true,
    views: 45,
    condominium: "Residencial Jardim das Flores"
  },
  {
    id: "2", 
    title: "Assembleia Geral Ordinária",
    content: "Convocamos todos os condôminos para a Assembleia Geral Ordinária que será realizada no dia 25/01/2024 às 19h30 no salão de festas. Pauta em anexo.",
    author: "Síndico João Silva",
    createdAt: "2024-01-14T10:30:00",
    priority: "urgent",
    category: "general",
    pinned: true,
    views: 78,
    condominium: "Edifício Vista Alegre"
  },
  {
    id: "3",
    title: "Nova taxa de limpeza",
    content: "A partir de fevereiro/2024, será cobrada uma taxa adicional de R$ 25,00 para manutenção da limpeza das áreas comuns, conforme aprovado em assembleia.",
    author: "Administração",
    createdAt: "2024-01-13T14:20:00",
    priority: "medium",
    category: "financial",
    pinned: false,
    views: 32,
    condominium: "Condomínio Parque Real"
  },
  {
    id: "4",
    title: "Festa de Carnaval do Condomínio",
    content: "Venha participar da nossa festa de Carnaval! Dia 10/02/2024 às 20h no salão de festas. Haverá música, comida e diversão para toda a família!",
    author: "Comissão de Eventos",
    createdAt: "2024-01-12T16:45:00",
    priority: "low",
    category: "event",
    pinned: false,
    views: 23,
    condominium: "Residencial Jardim das Flores"
  }
];

// Simular usuário atual como síndico
const currentUser = {
  role: "sindico", // "sindico" | "morador" | "admin"
  name: "João Silva"
};

export default function NoticesList() {
  // Verificar se usuário é síndico
  if (currentUser.role !== "sindico") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center shadow-medium">
          <div className="flex justify-center mb-4">
            <UserCheck className="h-16 w-16 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Esta área é exclusiva para síndicos. Entre em contato com a administração para mais informações.
          </p>
        </Card>
      </div>
    );
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    priority: "medium" as const,
    category: "general" as const,
    pinned: false,
    condominium: ""
  });

  const filteredNotices = mockNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === "all" || notice.category === filterCategory;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Pinned notices first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-primary/20 text-primary" },
      high: { label: "Alta", className: "bg-warning/20 text-warning" },
      urgent: { label: "Urgente", className: "bg-destructive/20 text-destructive" }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      general: { label: "Geral", className: "bg-primary/20 text-primary" },
      maintenance: { label: "Manutenção", className: "bg-secondary/20 text-secondary" },
      financial: { label: "Financeiro", className: "bg-success/20 text-success" },
      event: { label: "Evento", className: "bg-warning/20 text-warning" },
      emergency: { label: "Emergência", className: "bg-destructive/20 text-destructive" }
    };
    return configs[category as keyof typeof configs] || configs.general;
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

  const handleCreateNotice = () => {
    // Here you would typically send to an API
    console.log("Creating notice:", newNotice);
    setNewNotice({
      title: "",
      content: "",
      priority: "medium",
      category: "general",
      pinned: false,
      condominium: ""
    });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Avisos e Comunicados</h1>
          <p className="text-muted-foreground mt-1">
            Mantenha todos os moradores informados
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Aviso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="Digite o título do aviso..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  placeholder="Digite o conteúdo do aviso..."
                  rows={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Condomínio</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={newNotice.condominium}
                  onChange={(e) => setNewNotice({...newNotice, condominium: e.target.value})}
                >
                  <option value="">Selecione o condomínio</option>
                  <option value="Residencial Jardim das Flores">Residencial Jardim das Flores</option>
                  <option value="Edifício Vista Alegre">Edifício Vista Alegre</option>
                  <option value="Condomínio Parque Real">Condomínio Parque Real</option>
                  <option value="Residencial Boa Vista">Residencial Boa Vista</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({...newNotice, priority: e.target.value as any})}
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
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({...newNotice, category: e.target.value as any})}
                  >
                    <option value="general">Geral</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="financial">Financeiro</option>
                    <option value="event">Evento</option>
                    <option value="emergency">Emergência</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newNotice.pinned}
                  onChange={(e) => setNewNotice({...newNotice, pinned: e.target.checked})}
                />
                <label className="text-sm">Fixar aviso no topo</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateNotice} className="bg-gradient-primary">
                  Publicar Aviso
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
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
              placeholder="Buscar por título ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              onClick={() => setFilterCategory("all")}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterCategory === "general" ? "default" : "outline"}
              onClick={() => setFilterCategory("general")}
              size="sm"
            >
              Geral
            </Button>
            <Button
              variant={filterCategory === "maintenance" ? "default" : "outline"}
              onClick={() => setFilterCategory("maintenance")}
              size="sm"
            >
              Manutenção
            </Button>
            <Button
              variant={filterCategory === "financial" ? "default" : "outline"}
              onClick={() => setFilterCategory("financial")}  
              size="sm"
            >
              Financeiro
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">Total de Avisos</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">2</p>
            <p className="text-sm text-muted-foreground">Fixados</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">178</p>
            <p className="text-sm text-muted-foreground">Total de Views</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">5</p>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </div>
        </Card>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => {
          const priorityConfig = getPriorityConfig(notice.priority);
          const categoryConfig = getCategoryConfig(notice.category);

          return (
            <Card key={notice.id} className="shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {notice.pinned && <Pin className="h-4 w-4 text-warning" />}
                        <h3 className="text-lg font-semibold">{notice.title}</h3>
                        <Badge variant="outline" className={priorityConfig.className}>
                          {priorityConfig.label}
                        </Badge>
                        <Badge variant="outline" className={categoryConfig.className}>
                          {categoryConfig.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {notice.content}
                      </p>
                       <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          {notice.condominium}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {notice.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(notice.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          {notice.views} visualizações
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}