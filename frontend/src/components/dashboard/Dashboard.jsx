import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

const Dashboard = ({ user, onLogout }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [activeView, setActiveView] = useState("feed");

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  {/* Header */}
  <Header user={user} onLogout={onLogout} />

  {/* Sidebar + MainContent */}
  <div className="flex flex-1 overflow-hidden">
    <Sidebar
      activeView={activeView}
      setActiveView={setActiveView}
      selectedDepartment={selectedDepartment}
      setSelectedDepartment={setSelectedDepartment}
      userRole={user?.role}
    />

    <div className="flex-1 overflow-y-auto">
      <MainContent
        activeView={activeView}
        selectedDepartment={selectedDepartment}
        user={user}
      />
    </div>
  </div>
</div>

  );
};

export default Dashboard;
