import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, AlertTriangle, DollarSign, Calendar, TrendingUp, TrendingDown, Building, Bell } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "primary" | "secondary" | "warning" | "success";
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-gradient-primary",
    secondary: "bg-gradient-secondary", 
    warning: "bg-warning",
    success: "bg-success"
  };

  return (
    <Card className="p-6 shadow-medium hover:shadow-strong transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <div className="flex items-center mt-3 space-x-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={cn(
              "text-sm font-medium",
              trend === "up" ? "text-success" : "text-destructive"
            )}>
              {change}
            </span>
          </div>
        </div>
        <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface RecentActivity {
  id: string;
  type: "incident" | "payment" | "notice" | "booking";
  title: string;
  time: string;
  apartment?: string;
}

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "incident",
    title: "Vazamento no apartamento 102",
    time: "há 2 horas",
    apartment: "Apt 102"
  },
  {
    id: "2", 
    type: "payment",
    title: "Pagamento de condomínio recebido",
    time: "há 4 horas",
    apartment: "Apt 205"
  },
  {
    id: "3",
    type: "notice",
    title: "Novo aviso publicado",
    time: "há 6 horas"
  },
  {
    id: "4",
    type: "booking",
    title: "Reserva do salão de festas",
    time: "há 1 dia",
    apartment: "Apt 304"
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do condomínio - {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
          <Bell className="h-4 w-4 mr-2" />
          Novo Aviso
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Moradores"
          value="248"
          change="+12 este mês"
          trend="up"
          icon={<Users className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Ocorrências Abertas"
          value="7"
          change="-3 esta semana"
          trend="down"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          title="Arrecadação Mensal"
          value="R$ 85.420"
          change="+8.2% vs mês anterior"
          trend="up"
          icon={<DollarSign className="h-6 w-6" />}
          color="success"
        />
        <StatCard
          title="Reservas Ativas"
          value="12"
          change="+4 esta semana"
          trend="up"
          icon={<Calendar className="h-6 w-6" />}
          color="secondary"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="p-6 lg:col-span-2 shadow-medium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Atividades Recentes</h3>
            <Button variant="outline" size="sm">Ver Todas</Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  activity.type === "incident" && "bg-warning/20",
                  activity.type === "payment" && "bg-success/20",
                  activity.type === "notice" && "bg-primary/20",
                  activity.type === "booking" && "bg-secondary/20"
                )}>
                  {activity.type === "incident" && <AlertTriangle className="h-5 w-5 text-warning" />}
                  {activity.type === "payment" && <DollarSign className="h-5 w-5 text-success" />}
                  {activity.type === "notice" && <Bell className="h-5 w-5 text-primary" />}
                  {activity.type === "booking" && <Calendar className="h-5 w-5 text-secondary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.apartment && (
                      <Badge variant="outline" className="text-xs">
                        {activity.apartment}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold mb-6">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Users className="h-5 w-5 mr-3" />
              Cadastrar Morador
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <AlertTriangle className="h-5 w-5 mr-3" />
              Registrar Ocorrência
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Bell className="h-5 w-5 mr-3" />
              Enviar Aviso
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <DollarSign className="h-5 w-5 mr-3" />
              Lançar Cobrança
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Building className="h-5 w-5 mr-3" />
              Gerenciar Unidades
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
              <p className="text-2xl font-bold mt-2">94.5%</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inadimplência</p>
              <p className="text-2xl font-bold mt-2">3.2%</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-warning flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Satisfação</p>
              <p className="text-2xl font-bold mt-2">8.7/10</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-success flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}