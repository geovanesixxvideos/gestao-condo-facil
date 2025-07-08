import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/components/dashboard/Dashboard";
import ResidentsList from "@/components/residents/ResidentsList";
import IncidentsList from "@/components/incidents/IncidentsList";
import NoticesList from "@/components/notices/NoticesList";
import FinancialManager from "@/components/financial/FinancialManager";
import BookingsList from "@/components/bookings/BookingsList";
import SettingsPanel from "@/components/settings/SettingsPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "residents":
        return <ResidentsList />;
      case "incidents":
        return <IncidentsList />;
      case "notices":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Avisos</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "financial":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Financeiro</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "bookings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Reservas</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Configurações</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;