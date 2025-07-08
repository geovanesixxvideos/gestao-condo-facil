import { useState } from "react";
import { Building2, Menu, X, Home, Users, AlertTriangle, Megaphone, DollarSign, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "residents", label: "Moradores", icon: Users },
  { id: "incidents", label: "Ocorrências", icon: AlertTriangle },
  { id: "notices", label: "Avisos", icon: Megaphone },
  { id: "financial", label: "Financeiro", icon: DollarSign },
  { id: "bookings", label: "Reservas", icon: Calendar },
  { id: "settings", label: "Configurações", icon: Settings },
];

export default function Layout({ children, activeTab = "dashboard", onTabChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-hero transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">CondoManager</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                    activeTab === item.id && "bg-white/20 text-white font-medium"
                  )}
                  onClick={() => {
                    onTabChange?.(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 rounded-lg p-4 text-white/80 text-sm">
            <p className="font-medium">Condomínio Residencial</p>
            <p className="text-xs">Síndico: João Silva</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-card border-b shadow-soft">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Bem-vindo de volta!</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">JS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}