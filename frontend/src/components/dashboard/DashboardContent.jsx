import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import CountUp from "react-countup";

dayjs.extend(utc);

const DashboardContent = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    shoutoutsSent: 0,
    shoutoutsReceived: 0,
    topContributor: "-",
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      try {
        const res = await ApiService.getStats(currentUser.id);
        setStats(res);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (!currentUser) return null;

  const statCards = [
    { title: "Total Users in Dept", value: stats.totalUsers, icon: "👥", color: "bg-blue-100", textColor: "text-blue-500" },
    { title: "Shoutouts Received", value: stats.shoutoutsReceived, icon: "👏", color: "bg-green-100", textColor: "text-green-500" },
    { title: "Shoutouts Sent", value: stats.shoutoutsSent, icon: "✉️", color: "bg-yellow-100", textColor: "text-yellow-500" },
    { title: "Top Contributor", value: stats.topContributor, icon: "🏆", color: "bg-pink-100", textColor: "text-pink-500" },
  ];

  return (
    <div className="flex flex-col min-h-full space-y-6 p-4 bg-gray-50">
      {/* Welcome */}
      <h1 className="text-3xl font-bold mb-4">
        Welcome back, {currentUser.username}!
        <span className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded">
          {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
        </span>
      </h1>

      {/* User Info Stack */}
      <div className="bg-white p-6 rounded-lg shadow mb-4 hover:shadow-xl transition-shadow duration-500">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {currentUser.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-semibold">{currentUser.username}</h2>
        </div>
        <p className="text-gray-600"><span className="font-semibold">Email:</span> {currentUser.email}</p>
        <p className="text-gray-600"><span className="font-semibold">Department:</span> {currentUser.department}</p>
        <p className="text-gray-600"><span className="font-semibold">Role:</span> {currentUser.role}</p>
        <p className="text-gray-600"><span className="font-semibold">Member Since:</span> {new Date(currentUser.joined_at).toLocaleDateString()}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between ${card.color} p-4 rounded-lg shadow transition-all duration-500 transform hover:scale-105 cursor-pointer`}
          >
            <div className="flex flex-col">
              <p className={`${card.textColor} text-2xl`}>{card.icon}</p>
              <p className="text-gray-700 text-sm mt-1">{card.title}</p>
              {typeof card.value === "number" ? (
                <p className="text-2xl font-bold">
                  <CountUp end={card.value} duration={1.5} />
                </p>
              ) : (
                <p className="text-2xl font-bold">{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardContent;
