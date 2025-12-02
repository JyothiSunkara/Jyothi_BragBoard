import {
  MessageSquare,
  Send,
  UserCircle,
  Award,
  BarChart3,
  Settings,
  FileWarning,
  Trophy,
} from "lucide-react";

const Sidebar = ({ activeView, setActiveView, userRole, isOpen, toggleSidebar }) => {
  const commonItems = [
    { id: "feed", name: "Shout-Out Feed", icon: <MessageSquare size={20} /> },
    { id: "create", name: "Create Shout-Out", icon: <Send size={20} /> },
    { id: "my-shoutouts", name: "My Shout-Outs", icon: <UserCircle size={20} /> },
    { id: "achievements", name: "Achievements", icon: <Award size={20} /> },
    { id: "leaderboard", name: "Leaderboard", icon: <Trophy size={20} /> },
  ];

  const adminItems = [
    { id: "admin-dashboard", name: "Admin Dashboard", icon: <BarChart3 size={20} /> },
    { id: "reports", name: "Reports", icon: <FileWarning size={20} /> },
  ];

  const settingsItem = { id: "settings", name: "Settings", icon: <Settings size={20} /> };

  const menuItems =
    userRole === "admin"
      ? [...commonItems, ...adminItems, settingsItem]
      : [...commonItems, settingsItem];

  return (
    <>
      {/* 🔥 MOBILE BACKDROP */}
      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      ></div>

     {/* 🔥 MOBILE SIDEBAR */}
<div
  className={`md:hidden fixed top-0 left-0 h-screen w-64 z-50
  bg-gradient-to-b from-indigo-50 via-white to-purple-50 
  shadow-lg transform transition-transform duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  {/* Inner wrapper to handle relative positioning */}
  <div className="relative p-4 h-full">
    <button
      className="absolute top-4 right-4 text-gray-600 hover:text-indigo-600"
      onClick={toggleSidebar}
    >
      ✕
    </button>

    {/* Menu */}
    <div className="mt-8">
    {menuItems.map((item) => (
      <div
        key={item.id}
        onClick={() => {
          setActiveView(item.id);
          toggleSidebar();
        }}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 
          ${
            activeView === item.id
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
              : "hover:bg-indigo-100 text-gray-700"
          }
        `}
      >
        <span className={activeView === item.id ? "text-white" : "text-indigo-600"}>
          {item.icon}
        </span>
        <span className="text-lg font-medium">{item.name}</span>
      </div>
    ))}
    </div>
  </div>
</div>

      {/* 🔥 DESKTOP SIDEBAR */}
      <div
        className={`hidden md:flex flex-col min-h-screen shadow-sm 
        bg-gradient-to-b from-indigo-50 via-white to-purple-50
        transition-all duration-300 p-4
        ${isOpen ? "w-64" : "w-20"}`}
      >
        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="self-end mb-4 text-gray-500 hover:text-indigo-600"
        >
          {isOpen ? "←" : "→"}
        </button>

        {/* Menu */}
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 
              ${
                activeView === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "hover:bg-indigo-100 text-gray-700"
              }
            `}
          >
            <span className={activeView === item.id ? "text-white" : "text-indigo-600"}>
              {item.icon}
            </span>

            {isOpen && <span className="text-lg font-medium">{item.name}</span>}
          </div>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
