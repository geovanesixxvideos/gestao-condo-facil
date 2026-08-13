import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, AlertTriangle, DollarSign, Calendar, TrendingUp, TrendingDown, Building, Bell } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "primary" | "secondary" | "warning" | "success";
  loading?: boolean;
}

function StatCard({ title, value, change, trend, icon, color, loading }: StatCardProps) {
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
          {loading ? (
            <Skeleton className="h-9 w-24 mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-2">{value}</p>
          )}
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    residents: 0,
    residentsNew: 0,
    openIncidents: 0,
    incidentsWeek: 0,
    monthRevenue: 0,
    prevMonthRevenue: 0,
    activeBookings: 0,
    bookingsWeek: 0,
    units: 0,
    overdueCount: 0,
    totalCharges: 0,
    resolvedRate: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const today = now.toISOString().slice(0, 10);

      const [
        residents,
        incidents,
        transactions,
        bookings,
        condos,
        recentIncidents,
        recentNotices,
        recentBookings,
        recentPayments,
      ] = await Promise.all([
        supabase.from("residents").select("id, created_at, status"),
        supabase.from("incidents").select("id, status, created_at"),
        supabase.from("transactions").select("id, type, amount, status, date"),
        supabase.from("bookings").select("id, date, status, created_at"),
        supabase.from("condominiums").select("units"),
        supabase.from("incidents").select("id, title, apartment, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("notices").select("id, title, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("bookings").select("id, area, apartment, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("transactions").select("id, description, apartment, amount, created_at, type").eq("type", "income").order("created_at", { ascending: false }).limit(4),
      ]);

      if (cancelled) return;

      const residentRows = residents.data ?? [];
      const incidentRows = incidents.data ?? [];
      const txRows = transactions.data ?? [];
      const bookingRows = bookings.data ?? [];

      const income = txRows.filter((t) => t.type === "income" && t.status === "paid");
      const monthRevenue = income
        .filter((t) => t.date >= startMonth)
        .reduce((s, t) => s + Number(t.amount), 0);
      const prevMonthRevenue = income
        .filter((t) => t.date >= startPrevMonth && t.date < startMonth)
        .reduce((s, t) => s + Number(t.amount), 0);

      const charges = txRows.filter((t) => t.type === "income");
      const overdue = charges.filter((t) => t.status !== "paid");

      const resolved = incidentRows.filter((i) => i.status === "resolved").length;

      setStats({
        residents: residentRows.length,
        residentsNew: residentRows.filter((r) => r.created_at >= startMonth).length,
        openIncidents: incidentRows.filter((i) => i.status !== "resolved").length,
        incidentsWeek: incidentRows.filter((i) => i.created_at >= weekAgo).length,
        monthRevenue,
        prevMonthRevenue,
        activeBookings: bookingRows.filter((b) => b.date >= today && b.status !== "cancelled").length,
        bookingsWeek: bookingRows.filter((b) => b.created_at >= weekAgo).length,
        units: (condos.data ?? []).reduce((s, c) => s + (c.units ?? 0), 0),
        overdueCount: overdue.length,
        totalCharges: charges.length,
        resolvedRate: incidentRows.length ? Math.round((resolved / incidentRows.length) * 100) : 0,
      });

      const merged: RecentActivity[] = [
        ...(recentIncidents.data ?? []).map((i) => ({
          id: `i-${i.id}`, type: "incident" as const, title: i.title,
          time: timeAgo(i.created_at), apartment: i.apartment ?? undefined, _t: i.created_at,
        })),
        ...(recentNotices.data ?? []).map((n) => ({
          id: `n-${n.id}`, type: "notice" as const, title: n.title, time: timeAgo(n.created_at), _t: n.created_at,
        })),
        ...(recentBookings.data ?? []).map((b) => ({
          id: `b-${b.id}`, type: "booking" as const, title: `Reserva - ${b.area}`,
          time: timeAgo(b.created_at), apartment: b.apartment ?? undefined, _t: b.created_at,
        })),
        ...(recentPayments.data ?? []).map((p) => ({
          id: `p-${p.id}`, type: "payment" as const, title: p.description,
          time: timeAgo(p.created_at), apartment: p.apartment ?? undefined, _t: p.created_at,
        })),
      ]
        .sort((a, b) => (a as any)._t < (b as any)._t ? 1 : -1)
        .slice(0, 6);

      setActivities(merged);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  const revenueChange = stats.prevMonthRevenue
    ? ((stats.monthRevenue - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100
    : 0;
  const occupancy = stats.units ? Math.min(100, (stats.residents / stats.units) * 100) : 0;
  const delinquency = stats.totalCharges ? (stats.overdueCount / stats.totalCharges) * 100 : 0;

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
        <Button className="bg-gradient-primary hover:opacity-90 shadow-primary" onClick={() => onNavigate?.("notices")}>
          <Bell className="h-4 w-4 mr-2" />
          Novo Aviso
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Moradores"
          value={String(stats.residents)}
          change={`${stats.residentsNew > 0 ? "+" : ""}${stats.residentsNew} este mês`}
          trend={stats.residentsNew > 0 ? "up" : "down"}
          icon={<Users className="h-6 w-6" />}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="Ocorrências Abertas"
          value={String(stats.openIncidents)}
          change={`${stats.incidentsWeek} nesta semana`}
          trend={stats.incidentsWeek > 0 ? "up" : "down"}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="warning"
          loading={loading}
        />
        <StatCard
          title="Arrecadação Mensal"
          value={currency(stats.monthRevenue)}
          change={`${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs mês anterior`}
          trend={revenueChange >= 0 ? "up" : "down"}
          icon={<DollarSign className="h-6 w-6" />}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Reservas Ativas"
          value={String(stats.activeBookings)}
          change={`${stats.bookingsWeek} nesta semana`}
          trend={stats.bookingsWeek > 0 ? "up" : "down"}
          icon={<Calendar className="h-6 w-6" />}
          color="secondary"
          loading={loading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="p-6 lg:col-span-2 shadow-medium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Atividades Recentes</h3>
          </div>
          <div className="space-y-4">
            {loading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            )}
            {!loading && activities.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
            )}
            {!loading && activities.map((activity) => (
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
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => onNavigate?.("residents")}>
              <Users className="h-5 w-5 mr-3" />
              Cadastrar Morador
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => onNavigate?.("incidents")}>
              <AlertTriangle className="h-5 w-5 mr-3" />
              Registrar Ocorrência
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => onNavigate?.("notices")}>
              <Bell className="h-5 w-5 mr-3" />
              Enviar Aviso
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => onNavigate?.("financial")}>
              <DollarSign className="h-5 w-5 mr-3" />
              Lançar Cobrança
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => onNavigate?.("condominiums")}>
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
              <p className="text-2xl font-bold mt-2">{occupancy.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.residents} de {stats.units} unidades</p>
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
              <p className="text-2xl font-bold mt-2">{delinquency.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.overdueCount} cobranças em aberto</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-warning flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ocorrências Resolvidas</p>
              <p className="text-2xl font-bold mt-2">{stats.resolvedRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">do total registrado</p>
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
