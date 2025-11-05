import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ApiService from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShoutouts: 0,
    topContributors: [],
    mostTaggedUsers: []
  });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const topContributorsData = await ApiService.getTopContributors(); // [{username, sent_count}]
      const mostTaggedData = await ApiService.getMostTagged(); // [{username, tag_count}]

      setStats({
        totalUsers: topContributorsData.length, // counting unique users
        totalShoutouts: topContributorsData.reduce((acc, u) => acc + u.sent_count, 0),
        topContributors: topContributorsData.map(u => ({ username: u.username, count: u.sent_count })),
        mostTaggedUsers: mostTaggedData.map(u => ({ username: u.username, tag_count: u.tag_count }))
      });
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 text-transparent bg-clip-text">
        Admin Insights Dashboard
      </h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-50 to-white border">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-pink-50 to-white border">
          <p className="text-gray-600">Total Shout-Outs</p>
          <p className="text-3xl font-bold text-pink-600">{stats.totalShoutouts}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-blue-50 to-white border">
          <p className="text-gray-600">Active Engagement</p>
          <p className="text-3xl font-bold text-blue-600">{stats.topContributors.length} Contributors</p>
        </motion.div>
      </div>

      {/* TOP CONTRIBUTORS CHART */}
      <div className="bg-white border rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Top Contributors</h2>
        {stats.topContributors.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topContributors}>
              <XAxis dataKey="username" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No contributors data available</p>
        )}
      </div>

      {/* MOST TAGGED USERS */}
      <div className="bg-white border rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Most Tagged Users</h2>
        {stats.mostTaggedUsers.length ? (
          <ul className="space-y-2">
            {stats.mostTaggedUsers.map((u, i) => (
              <li key={i} className="p-3 rounded-lg border bg-gray-50">
                <strong>{u.username}</strong> — tagged {u.tag_count} times
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tagged users yet</p>
        )}
      </div>
    </div>
  );
}
