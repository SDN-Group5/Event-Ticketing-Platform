import { ReactNode } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TicketVibeNavbar from "../components/common/TicketVibeNavbar";

/**
 * DashboardLayout Component
 * Layout chung cho tất cả dashboard pages
 * Neo Brutalism styling với Sidebar và Header
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TicketVibeNavbar />

      {/* Main Layout */}
      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;



