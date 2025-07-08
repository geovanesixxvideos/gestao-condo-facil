import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  id: string;
  area: string;
  resident: string;
  apartment: string;
  phone: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

interface Area {
  id: string;
  name: string;
  capacity: number;
  hourlyRate: number;
  available: boolean;
}

const mockAreas: Area[] = [
  { id: "1", name: "Salão de Festas", capacity: 50, hourlyRate: 80, available: true },
  { id: "2", name: "Churrasqueira", capacity: 20, hourlyRate: 40, available: true },
  { id: "3", name: "Quadra Esportiva", capacity: 30, hourlyRate: 30, available: true },
  { id: "4", name: "Piscina", capacity: 15, hourlyRate: 0, available: true },
  { id: "5", name: "Salão de Jogos", capacity: 25, hourlyRate: 25, available: false }
];

const mockBookings: Booking[] = [
  {
    id: "1",
    area: "Salão de Festas",
    resident: "Maria Silva Santos",
    apartment: "Apt 101",
    phone: "(11) 99999-9999",
    email: "maria.silva@email.com",
    date: "2024-01-25",
    startTime: "19:00",
    endTime: "23:00",
    status: "pending",
    notes: "Festa de aniversário para 40 pessoas",
    createdAt: "2024-01-15T10:00:00"
  },
  {
    id: "2",
    area: "Churrasqueira",
    resident: "João Oliveira",
    apartment: "Apt 205",
    phone: "(11) 88888-8888",
    email: "joao.oliveira@email.com",
    date: "2024-01-20",
    startTime: "12:00",
    endTime: "17:00",
    status: "confirmed",
    notes: "Reunião de família",
    createdAt: "2024-01-12T14:30:00"
  },
  {
    id: "3",
    area: "Quadra Esportiva",
    resident: "Pedro Santos",
    apartment: "Apt 304",
    phone: "(11) 77777-7777",
    email: "pedro.santos@email.com",
    date: "2024-01-18",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
    notes: "Partida de futebol",
    createdAt: "2024-01-10T09:15:00"
  },
  {
    id: "4",
    area: "Piscina",
    resident: "Ana Costa",
    apartment: "Apt 102",
    phone: "(11) 66666-6666",
    email: "ana.costa@email.com",
    date: "2024-01-22",
    startTime: "14:00",
    endTime: "18:00",
    status: "cancelled",
    notes: "Cancelado devido ao tempo",
    createdAt: "2024-01-14T16:20:00"
  }
];

export default function BookingsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({
    area: "",
    resident: "",
    apartment: "",
    phone: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: ""
  });

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesArea = filterArea === "all" || booking.area === filterArea;
    
    return matchesSearch && matchesStatus && matchesArea;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: "Pendente", 
        className: "bg-warning/20 text-warning",
        icon: Clock
      },
      confirmed: { 
        label: "Confirmado", 
        className: "bg-success/20 text-success",
        icon: CheckCircle
      },
      cancelled: { 
        label: "Cancelado", 
        className: "bg-destructive/20 text-destructive",
        icon: XCircle
      },
      completed: { 
        label: "Concluído", 
        className: "bg-muted text-muted-foreground",
        icon: CheckCircle
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const calculateTotalHours = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculateCost = (area: string, startTime: string, endTime: string) => {
    const areaData = mockAreas.find(a => a.name === area);
    if (!areaData) return 0;
    
    const hours = calculateTotalHours(startTime, endTime);
    return hours * areaData.hourlyRate;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleCreateBooking = () => {
    console.log("Creating booking:", newBooking);
    setNewBooking({
      area: "",
      resident: "",
      apartment: "",
      phone: "",
      email: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: ""
    });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservas de Áreas Comuns</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as reservas das áreas comuns do condomínio
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Área</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={newBooking.area}
                    onChange={(e) => setNewBooking({...newBooking, area: e.target.value})}
                  >
                    <option value="">Selecione uma área</option>
                    {mockAreas.filter(area => area.available).map(area => (
                      <option key={area.id} value={area.name}>
                        {area.name} - {formatCurrency(area.hourlyRate)}/hora
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Horário Início</label>
                  <Input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horário Fim</label>
                  <Input
                    type="time"
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({...newBooking, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Morador</label>
                  <Input
                    value={newBooking.resident}
                    onChange={(e) => setNewBooking({...newBooking, resident: e.target.value})}
                    placeholder="Nome do morador"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Apartamento</label>
                  <Input
                    value={newBooking.apartment}
                    onChange={(e) => setNewBooking({...newBooking, apartment: e.target.value})}
                    placeholder="Apt 101"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                  placeholder="Observações sobre a reserva..."
                />
              </div>
              {newBooking.area && newBooking.startTime && newBooking.endTime && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Resumo da Reserva:</p>
                  <p className="text-sm text-muted-foreground">
                    Custo total: {formatCurrency(calculateCost(newBooking.area, newBooking.startTime, newBooking.endTime))}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateBooking} className="bg-gradient-primary">
                  Criar Reserva
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Areas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {mockAreas.map((area) => (
          <Card key={area.id} className="p-4 shadow-soft">
            <div className="text-center">
              <h4 className="font-medium text-sm mb-2">{area.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Capacidade: {area.capacity} pessoas
              </p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(area.hourlyRate)}/h
              </p>
              <Badge 
                variant={area.available ? "default" : "secondary"}
                className={area.available ? "bg-success text-success-foreground" : ""}
              >
                {area.available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por morador, apartamento ou área..."
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
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pendentes
            </Button>
            <Button
              variant={filterStatus === "confirmed" ? "default" : "outline"}
              onClick={() => setFilterStatus("confirmed")}
              size="sm"
            >
              Confirmadas
            </Button>
            <select 
              className="px-3 py-1 border rounded-lg text-sm"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            >
              <option value="all">Todas as áreas</option>
              {mockAreas.map(area => (
                <option key={area.id} value={area.name}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">15</p>
            <p className="text-sm text-muted-foreground">Total de Reservas</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">3</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">8</p>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">R$ 1.240</p>
            <p className="text-sm text-muted-foreground">Receita este mês</p>
          </div>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="shadow-medium">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Lista de Reservas ({filteredBookings.length})</h3>
        </div>
        <div className="divide-y">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const cost = calculateCost(booking.area, booking.startTime, booking.endTime);

            return (
              <div key={booking.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{booking.area}</h4>
                        <Badge variant="outline" className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                        {cost > 0 && (
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            {formatCurrency(cost)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {booking.resident} - {booking.apartment}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(booking.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {booking.phone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {booking.email}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {calculateTotalHours(booking.startTime, booking.endTime)}h de uso
                        </div>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Obs: {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    {booking.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          Confirmar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancelar
                        </Button>
                      </>
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