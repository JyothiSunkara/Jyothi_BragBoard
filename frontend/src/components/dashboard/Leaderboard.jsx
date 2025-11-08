import { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "react-hot-toast";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState({
    top_users_global: [],
    top_users_department: [],
    top_departments: []
  });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getLeaderboard();
      setLeaderboard(res);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatShoutouts = (count) => `${count} ${count === 1 ? "shoutout" : "shoutouts"}`;

  return (
    <div className="p-6 space-y-10">
      {/* Page Heading */}
      <div className="mb-6">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Leaderboard
        </h1>
        <p className="text-gray-500 mt-1">
          See top contributors and department-wise performance based on shoutouts sent and received.
        </p>
      </div>

      {/* Global Top Contributors */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-blue-600">Top Contributors — Company-wide</h2>
        <p className="text-gray-500 mb-4">This shows the top users across the company based on shoutouts sent.</p>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : leaderboard.top_users_global.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                layout="vertical"
                data={leaderboard.top_users_global.slice(0, 5)}
                margin={{ left: 60 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="username" type="category" width={140} />
                <Tooltip formatter={(value) => formatShoutouts(value)} />
                <Bar dataKey="shoutouts_sent" fill="#6366F1" barSize={20} radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data found.</p>
          )}
        </div>
      </div>

      {/* Department Top Contributors */}
      <div className="flex flex-col md:flex-row gap-6">
  {/* Left: Top Contributors — Department */}
  <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-2 text-green-600">Top Contributors — Your Department</h2>
    <p className="text-gray-500 mb-4">This shows top users within your department based on shoutouts sent.</p>
    <ul className="space-y-2">
      {leaderboard.top_users_department.map((u, i) => (
        <li key={i} className="p-3 rounded-lg bg-green-50 flex items-center justify-between">
          <span className="text-gray-700 font-medium">{u.username}</span>
          <span className="text-indigo-600 font-semibold">{u.shoutouts_sent} shoutout{u.shoutouts_sent > 1 ? "s" : ""}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Right: Total Departments / Top Departments */}
  <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-2 text-violet-600">Top Departments — Based on Shoutouts Received</h2>
    <p className="text-gray-500 mb-4">This shows departments ranked by the total number of shoutouts received.</p>
    <ul className="space-y-2">
      {leaderboard.top_departments.map((d, i) => (
        <li key={i} className="p-3 rounded-lg bg-violet-50 flex items-center justify-between">
          <span className="text-gray-700 font-medium">{d.department}</span>
          <span className="text-indigo-600 font-semibold">{d.shoutout_count} shoutout{d.shoutout_count > 1 ? "s" : ""}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
     
    </div>
  );
}
