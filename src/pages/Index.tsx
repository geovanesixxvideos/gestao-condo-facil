import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/components/dashboard/Dashboard";
import CondominiumsList from "@/components/condominiums/CondominiumsList";
import ResidentsList from "@/components/residents/ResidentsList";
import IncidentsList from "@/components/incidents/IncidentsList";
import NoticesList from "@/components/notices/NoticesList";
import FinancialManager from "@/components/financial/FinancialManager";
import BookingsList from "@/components/bookings/BookingsList";
import SettingsPanel from "@/components/settings/SettingsPanel";
import { CondoFilterProvider } from "@/hooks/useCondoFilter";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  useRealtimeAlerts();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "condominiums":
        return <CondominiumsList />;
      case "residents":
        return <ResidentsList />;
      case "incidents":
        return <IncidentsList />;
      case "notices":
        return <NoticesList />;
      case "financial":
        return <FinancialManager />;
      case "bookings":
        return <BookingsList />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <CondoFilterProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </CondoFilterProvider>
  );
};

export default Index;
