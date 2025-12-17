import { useEffect, useState, useRef } from "react";
import ApiService from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Star, Crown, Trophy } from "lucide-react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState({
    top_users_global: [],
    top_contributors_global: [],
    top_users_department: [],
    top_departments: [],
  });

  const loggedInUsername = localStorage.getItem("username");
  const [showPoints, setShowPoints] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const res = await ApiService.getLeaderboard();
      setLeaderboard(res);
    };
    load();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPoints(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rankIcon = (i) =>
    i === 0 ? (
      <Crown className="text-yellow-500" size={22} />
    ) : i === 1 ? (
      <Trophy className="text-gray-400" size={20} />
    ) : i === 2 ? (
      <Trophy className="text-amber-700" size={20} />
    ) : null;

  const highlight = (u) =>
    u === loggedInUsername
      ? "border-purple-500 bg-purple-50 shadow-md"
      : "border-gray-200 bg-white";

  const myStats = leaderboard.top_users_global.find(
    (u) => u.username === loggedInUsername
  );

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-500 mt-2">
            Track your progress and recognition.
          </p>
        </div>

        {/* My Stats Summary */}
        {myStats && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow">
            <h2 className="text-lg font-semibold mb-3">Your Points Summary</h2>

            <div className="grid grid-cols-4 text-center gap-4">
              <div>
                <p className="text-sm opacity-80">Sent</p>
                <p className="text-2xl font-bold">{myStats.sent_count}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Received</p>
                <p className="text-2xl font-bold">{myStats.received_count}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Tagged</p>
                <p className="text-2xl font-bold">{myStats.tagged_count}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Comments</p>
                <p className="text-2xl font-bold">{myStats.comment_count}</p>
              </div>
            </div>

            <p className="text-right mt-3 font-semibold text-lg">
              {myStats.score} pts
            </p>
          </div>
        )}

        {/* GLOBAL SCORE LEADERBOARD + POINTS SYSTEM BUTTON */}
        <section className="relative" ref={dropdownRef}>
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-purple-600 flex items-center gap-2">
                <Star className="text-purple-500" /> Gamified Global Leaderboard
              </h2>

              {/* Small Button - Right Corner */}
              <button
                onClick={() => setShowPoints((prev) => !prev)}
                className="text-sm px-3 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition"
              >
                Points System
              </button>
            </div>

            {showPoints && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-purple-200 shadow-xl rounded-xl p-4 z-20 animate-fadeIn">
                <h3 className="text-purple-700 font-semibold mb-2">
                  How Points Are Calculated
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    ✨ 1 Shout-Out Sent = <b>10 pts</b>
                  </li>
                  <li>
                    🏆 1 Shout-Out Received = <b>15 pts</b>
                  </li>
                  <li>
                    🏷️ Tagged in a Shout-Out = <b>5 pts</b>
                  </li>
                  <li>
                    💬 Each Comment Made = <b>2 pts</b>
                  </li>
                </ul>
              </div>
            )}

            {/* ===== Leaderboard Content ===== */}
            {leaderboard.top_users_global.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-gray-500 bg-purple-50 border border-purple-100 rounded-lg p-4 text-center max-w-md">
                  No leaderboard data available yet. Rankings will appear once
                  team members start participating in appreciation activities.
                  If this persists, please try logging in again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.top_users_global.map((u, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 flex justify-between items-center transition ${highlight(
                      u.username
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      {rankIcon(i)}
                      <span className="font-semibold text-gray-800">
                        {u.username}
                      </span>
                    </div>
                    <span className="text-purple-600 font-bold">
                      {u.score} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SHOUTOUTS SENT BAR CHART */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Top Contributors — Shoutouts Sent
          </h2>

          {leaderboard.top_contributors_global.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-4 text-center max-w-md">
                No contributor data available yet. Top contributors will appear
                once team members start sending shoutouts.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={leaderboard.top_contributors_global.slice(0, 8)}
                margin={{ left: 60 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="username" type="category" width={120} />
                <Tooltip />
                <Bar
                  dataKey="sent_count"
                  barSize={18}
                  fill="#1D4ED8"
                  radius={[5, 5, 5, 5]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* DEPARTMENT RANK */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Your Department Ranking
          </h2>

          {leaderboard?.top_users_department?.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.top_users_department.map((u, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg flex justify-between border ${highlight(
                    u.username
                  )}`}
                >
                  <span className="font-medium">{u.username}</span>
                  <span className="text-green-700 font-semibold">
                    {u.score} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-green-50 border border-green-100 rounded-lg p-4 text-center">
              No ranking data available for your department yet. Rankings will
              appear once team members start participating in appreciation
              activities.
            </p>
          )}
        </div>

        {/* TOP DEPARTMENTS */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold text-violet-600 mb-4">
            Top Departments
          </h2>

          {leaderboard?.top_departments?.length > 0 ? (
            <ul className="space-y-3">
              {leaderboard.top_departments.map((d, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg flex justify-between items-center border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {i === 0 && <Crown className="text-yellow-500" size={18} />}
                    {i === 1 && <Crown className="text-gray-400" size={18} />}
                    {i === 2 && <Crown className="text-amber-700" size={18} />}

                    <span className="font-medium">{d.department}</span>
                  </div>

                  <span className="text-violet-700 font-semibold">
                    {d.shoutout_count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 bg-violet-50 border border-violet-100 rounded-lg p-4 text-center">
              No department data available yet.Top departments will appear here
              once participation increases.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
