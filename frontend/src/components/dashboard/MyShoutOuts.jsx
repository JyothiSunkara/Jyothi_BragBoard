import { useState, useMemo } from "react";
import ShoutOutFeed from "./ShoutOutFeed";
import dayjs from "dayjs";

export default function MyShoutOuts({ currentUser, shoutouts, handleDeleteShout }) {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  // 👇 All departments available in your app (adjust to your setup)
  const allDepartments = [
    "Engineering",
    "Marketing",
    "Human Resources",
    "Finance",
    "Design",
    "Sales",
    "Operations",
    "Product",
    "Support",
  ];

  // ✅ Step 1: Filter by department
  const filteredByDepartment = useMemo(() => {
    if (!Array.isArray(shoutouts)) return [];
    if (selectedDepartment === "all") return shoutouts;
    return shoutouts.filter(
      (s) =>
        s.giver_department === selectedDepartment ||
        s.tagged_users.some((u) => u.department === selectedDepartment)
    );
  }, [shoutouts, selectedDepartment]);

  // ✅ Step 2: Filter by time
  const filteredByTime = useMemo(() => {
    if (timeFilter === "all") return filteredByDepartment;
    const days = parseInt(timeFilter);
    const cutoff = dayjs().subtract(days, "day");
    return filteredByDepartment.filter((s) => dayjs(s.created_at).isAfter(cutoff));
  }, [filteredByDepartment, timeFilter]);

  // ✅ Step 3: Stats — based on filtered data
  const totalFiltered = filteredByTime.length;
  const sentFiltered = filteredByTime.filter((s) => s.giver_id === currentUser?.id).length;
  const receivedFiltered = filteredByTime.filter((s) =>
    s.tagged_users.some((u) => u.id === currentUser?.id)
  ).length;

  return (
    <div className="p-6">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        My Shout-Outs
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Department Filter */}
        <div>
          <label className="text-sm text-gray-600 mr-2 font-semibold">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 shadow-sm"
          >
            <option value="all">All Departments</option>
            {allDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <label className="text-sm text-gray-600 mr-2 font-semibold">Time:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Total Shout-Outs</p>
          <p className="text-2xl font-bold text-indigo-600">{totalFiltered}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-green-600">{sentFiltered}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Received</p>
          <p className="text-2xl font-bold text-pink-600">{receivedFiltered}</p>
        </div>
      </div>

      {/* Feed */}
      {filteredByTime.length > 0 ? (
        <ShoutOutFeed
          currentUser={currentUser}
          shoutouts={filteredByTime}
          handleDeleteShout={handleDeleteShout}
        />
      ) : (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500 border border-gray-100">
          You haven’t sent or received any shout-outs
          {selectedDepartment !== "all"
            ? ` in the ${selectedDepartment} department`
            : ""}
          {timeFilter !== "all"
            ? ` within the last ${timeFilter} days.`
            : "."}
        </div>
      )}
    </div>
  );
}
