import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  User, 
  Bell, 
  Shield, 
  DollarSign, 
  Mail, 
  Calendar, 
  Database,
  Settings,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from "lucide-react";

interface CondoSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  cnpj: string;
  units: number;
  admin: string;
  adminEmail: string;
  adminPhone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  paymentReminders: boolean;
  maintenanceAlerts: boolean;
  eventNotifications: boolean;
}

interface FinancialSettings {
  defaultDueDate: number;
  latePaymentFee: number;
  interestRate: number;
  minimumBalance: number;
  autoGenerateBills: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  active: boolean;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    role: "admin",
    active: true,
    lastLogin: "2024-01-15T10:30:00"
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    role: "manager",
    active: true,
    lastLogin: "2024-01-14T16:20:00"
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    role: "viewer",
    active: false,
    lastLogin: "2024-01-10T09:15:00"
  }
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  
  const [condoSettings, setCondoSettings] = useState<CondoSettings>({
    name: "Condomínio Residencial Exemplo",
    address: "Rua das Flores, 123 - Bairro Jardim",
    phone: "(11) 3333-4444",
    email: "contato@condominioexemplo.com.br",
    cnpj: "12.345.678/0001-90",
    units: 120,
    admin: "João Silva",
    adminEmail: "joao.silva@email.com",
    adminPhone: "(11) 99999-9999"
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    paymentReminders: true,
    maintenanceAlerts: true,
    eventNotifications: false
  });

  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>({
    defaultDueDate: 10,
    latePaymentFee: 2.5,
    interestRate: 1.0,
    minimumBalance: 5000,
    autoGenerateBills: true
  });

  const handleSaveSettings = () => {
    console.log("Saving settings...");
    // Here you would save to your backend
  };

  const getRoleBadge = (role: string) => {
    const configs = {
      admin: { label: "Admin", className: "bg-destructive/20 text-destructive" },
      manager: { label: "Gerente", className: "bg-warning/20 text-warning" },
      viewer: { label: "Visualizador", className: "bg-muted text-muted-foreground" }
    };
    return configs[role as keyof typeof configs] || configs.viewer;
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
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações do condomínio e sistema
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-gradient-primary hover:opacity-90 shadow-primary">
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <Building className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Informações do Condomínio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="condo-name">Nome do Condomínio</Label>
                  <Input
                    id="condo-name"
                    value={condoSettings.name}
                    onChange={(e) => setCondoSettings({...condoSettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="condo-address">Endereço</Label>
                  <Textarea
                    id="condo-address"
                    value={condoSettings.address}
                    onChange={(e) => setCondoSettings({...condoSettings, address: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="condo-phone">Telefone</Label>
                  <Input
                    id="condo-phone"
                    value={condoSettings.phone}
                    onChange={(e) => setCondoSettings({...condoSettings, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="condo-email">Email</Label>
                  <Input
                    id="condo-email"
                    type="email"
                    value={condoSettings.email}
                    onChange={(e) => setCondoSettings({...condoSettings, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="condo-cnpj">CNPJ</Label>
                  <Input
                    id="condo-cnpj"
                    value={condoSettings.cnpj}
                    onChange={(e) => setCondoSettings({...condoSettings, cnpj: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="condo-units">Número de Unidades</Label>
                  <Input
                    id="condo-units"
                    type="number"
                    value={condoSettings.units}
                    onChange={(e) => setCondoSettings({...condoSettings, units: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Informações do Administrador</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="admin-name">Nome</Label>
                <Input
                  id="admin-name"
                  value={condoSettings.admin}
                  onChange={(e) => setCondoSettings({...condoSettings, admin: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={condoSettings.adminEmail}
                  onChange={(e) => setCondoSettings({...condoSettings, adminEmail: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="admin-phone">Telefone</Label>
                <Input
                  id="admin-phone"
                  value={condoSettings.adminPhone}
                  onChange={(e) => setCondoSettings({...condoSettings, adminPhone: e.target.value})}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações por email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, emailNotifications: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações por SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, smsNotifications: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações push no navegador</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, pushNotifications: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payment-reminders">Lembretes de Pagamento</Label>
                  <p className="text-sm text-muted-foreground">Enviar lembretes de vencimento</p>
                </div>
                <Switch
                  id="payment-reminders"
                  checked={notificationSettings.paymentReminders}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, paymentReminders: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-alerts">Alertas de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre manutenções programadas</p>
                </div>
                <Switch
                  id="maintenance-alerts"
                  checked={notificationSettings.maintenanceAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, maintenanceAlerts: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="event-notifications">Notificações de Eventos</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações sobre eventos</p>
                </div>
                <Switch
                  id="event-notifications"
                  checked={notificationSettings.eventNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, eventNotifications: checked})
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Configurações Financeiras</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="due-date">Dia de Vencimento Padrão</Label>
                  <Input
                    id="due-date"
                    type="number"
                    min="1"
                    max="31"
                    value={financialSettings.defaultDueDate}
                    onChange={(e) => setFinancialSettings({...financialSettings, defaultDueDate: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="late-fee">Taxa de Multa (%)</Label>
                  <Input
                    id="late-fee"
                    type="number"
                    step="0.1"
                    value={financialSettings.latePaymentFee}
                    onChange={(e) => setFinancialSettings({...financialSettings, latePaymentFee: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="interest-rate">Taxa de Juros Mensal (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    value={financialSettings.interestRate}
                    onChange={(e) => setFinancialSettings({...financialSettings, interestRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="min-balance">Saldo Mínimo (R$)</Label>
                  <Input
                    id="min-balance"
                    type="number"
                    value={financialSettings.minimumBalance}
                    onChange={(e) => setFinancialSettings({...financialSettings, minimumBalance: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-generate">Gerar Boletos Automaticamente</Label>
                  <p className="text-sm text-muted-foreground">Gerar boletos mensais automaticamente</p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={financialSettings.autoGenerateBills}
                  onCheckedChange={(checked) => 
                    setFinancialSettings({...financialSettings, autoGenerateBills: checked})
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
            <div className="space-y-4">
              {mockUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{user.name}</p>
                          <Badge variant="outline" className={roleBadge.className}>
                            {roleBadge.label}
                          </Badge>
                          <Badge variant={user.active ? "default" : "secondary"}>
                            {user.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Último acesso: {formatDate(user.lastLogin)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Backup e Restauração</h3>
            </div>
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Backup Automático</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Backup diário automático dos dados do sistema
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status: Ativo</span>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Backup Manual</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Criar backup manual dos dados atuais
                </p>
                <Button className="bg-gradient-primary">
                  <Database className="h-4 w-4 mr-2" />
                  Criar Backup Agora
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Restaurar Backup</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Restaurar dados de um backup anterior
                </p>
                <div className="flex gap-2">
                  <Input type="file" accept=".zip,.sql" />
                  <Button variant="outline">
                    Restaurar
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Histórico de Backups</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Últimos backups realizados
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>15/01/2024 - 02:00</span>
                    <span className="text-success">Sucesso</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>14/01/2024 - 02:00</span>
                    <span className="text-success">Sucesso</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>13/01/2024 - 02:00</span>
                    <span className="text-success">Sucesso</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}