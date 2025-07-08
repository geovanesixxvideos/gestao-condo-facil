import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, DollarSign, Calendar, TrendingUp, TrendingDown, Download, Upload, CreditCard, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  apartment?: string;
  category: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  dueDate?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    description: "Taxa de condomínio - Janeiro 2024",
    amount: 450.00,
    apartment: "Apt 101",
    category: "Condomínio",
    date: "2024-01-15T10:00:00",
    status: "completed"
  },
  {
    id: "2",
    type: "expense", 
    description: "Manutenção elevador",
    amount: 2500.00,
    category: "Manutenção",
    date: "2024-01-14T14:30:00",
    status: "completed"
  },
  {
    id: "3",
    type: "income",
    description: "Taxa de condomínio - Janeiro 2024",
    amount: 450.00,
    apartment: "Apt 205",
    category: "Condomínio",
    date: "2024-01-10T08:00:00",
    status: "pending",
    dueDate: "2024-01-20T23:59:59"
  },
  {
    id: "4",
    type: "expense",
    description: "Conta de luz - Área comum",
    amount: 850.00,
    category: "Utilidades",
    date: "2024-01-12T16:00:00",
    status: "completed"
  },
  {
    id: "5",
    type: "income",
    description: "Taxa de limpeza",
    amount: 25.00,
    apartment: "Apt 304",
    category: "Limpeza",
    date: "2024-01-13T09:15:00",
    status: "completed"
  }
];

export default function FinancialManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "income" as const,
    description: "",
    amount: 0,
    apartment: "",
    category: "",
    dueDate: ""
  });

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.apartment && transaction.apartment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: "Pendente", className: "bg-warning/20 text-warning" },
      completed: { label: "Concluído", className: "bg-success/20 text-success" },
      cancelled: { label: "Cancelado", className: "bg-destructive/20 text-destructive" }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate totals
  const totalIncome = mockTransactions
    .filter(t => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = mockTransactions
    .filter(t => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = mockTransactions
    .filter(t => t.type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleCreateTransaction = () => {
    console.log("Creating transaction:", newTransaction);
    setNewTransaction({
      type: "income",
      description: "",
      amount: 0,
      apartment: "",
      category: "",
      dueDate: ""
    });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-1">
            Controle receitas, despesas e inadimplência
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as any})}
                    >
                      <option value="income">Receita</option>
                      <option value="expense">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor</label>
                    <Input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Descrição da transação..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Apartamento (opcional)</label>
                    <Input
                      value={newTransaction.apartment}
                      onChange={(e) => setNewTransaction({...newTransaction, apartment: e.target.value})}
                      placeholder="Apt 101"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Input
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      placeholder="Categoria"
                    />
                  </div>
                </div>
                {newTransaction.type === "income" && (
                  <div>
                    <label className="text-sm font-medium">Data de Vencimento</label>
                    <Input
                      type="date"
                      value={newTransaction.dueDate}
                      onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTransaction} className="bg-gradient-primary">
                    Criar Transação
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
              <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${balance >= 0 ? 'bg-success' : 'bg-destructive'}`}>
              {balance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <p className="text-3xl font-bold mt-2 text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas</p>
              <p className="text-3xl font-bold mt-2 text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendente</p>
              <p className="text-3xl font-bold mt-2 text-warning">{formatCurrency(pendingIncome)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filterType === "income" ? "default" : "outline"}
              onClick={() => setFilterType("income")}
              size="sm"
            >
              Receitas
            </Button>
            <Button
              variant={filterType === "expense" ? "default" : "outline"}
              onClick={() => setFilterType("expense")}
              size="sm"
            >
              Despesas
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pendentes
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="shadow-medium">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Histórico de Transações ({filteredTransactions.length})</h3>
        </div>
        <div className="divide-y">
          {filteredTransactions.map((transaction) => {
            const statusConfig = getStatusConfig(transaction.status);
            const isIncome = transaction.type === "income";

            return (
              <div key={transaction.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      isIncome ? 'bg-success/20' : 'bg-destructive/20'
                    }`}>
                      {isIncome ? (
                        <TrendingUp className={`h-6 w-6 ${isIncome ? 'text-success' : 'text-destructive'}`} />
                      ) : (
                        <TrendingDown className={`h-6 w-6 ${isIncome ? 'text-success' : 'text-destructive'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <Badge variant="outline" className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline">
                          {transaction.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(transaction.date)}
                        </div>
                        {transaction.apartment && (
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {transaction.apartment}
                          </div>
                        )}
                        {transaction.dueDate && transaction.status === "pending" && (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Vence em {formatDate(transaction.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      {transaction.status === "pending" && (
                        <Button size="sm" className="bg-success">
                          Confirmar
                        </Button>
                      )}
                    </div>
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