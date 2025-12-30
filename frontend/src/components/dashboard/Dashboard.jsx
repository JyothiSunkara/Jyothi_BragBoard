import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import ApiService from "../../services/api";

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState("feed");
  const [shoutouts, setShoutouts] = useState([]);
  const [shoutoutUpdated, setShoutoutUpdated] = useState(false);
  const [currentUser, setCurrentUser] = useState(user); // local state for updates
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // desktop → open
      } else {
        setSidebarOpen(false); // mobile → closed
      }
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("current_user"));
      setCurrentUser(updatedUser);
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  // Fetch shoutouts on mount
  useEffect(() => {
    const fetchShoutouts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${API_BASE_URL}/shoutouts/feed?department=all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch shoutouts");
        const data = await res.json();
        setShoutouts(data);
      } catch (error) {
        console.error("Error loading shoutouts:", error);
      }
    };

    fetchShoutouts();
  }, []);

  const handleShoutoutPosted = () => {
    setShoutoutUpdated((prev) => !prev);
  };

  // Handle delete locally
  const handleDeleteShout = (id) => {
    setShoutouts((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  // bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        user={currentUser}
        onLogout={onLogout}
        onMenuToggle={toggleSidebar}
        setActiveView={setActiveView}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          userRole={currentUser?.role}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <div className="flex-1 overflow-y-auto">
          <MainContent
            activeView={activeView}
            user={currentUser}
            shoutouts={shoutouts}
            handleDeleteShout={handleDeleteShout}
            shoutoutUpdated={shoutoutUpdated}
            handleShoutoutPosted={handleShoutoutPosted}
            isSidebarOpen={sidebarOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
