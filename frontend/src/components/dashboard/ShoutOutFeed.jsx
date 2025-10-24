import { useState, useEffect } from "react";
import { Edit2, Trash2, Filter, RotateCcw, TargetIcon } from "lucide-react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";

dayjs.extend(utc);

export default function ShoutOutFeed({ currentUser, shoutoutUpdated }) {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [senderDept, setSenderDept] = useState("All Departments");
  const [receiverDept, setReceiverDept] = useState("All Departments");
  const [searchName, setSearchName] = useState("");
  const [date, setDate] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const departments = [
    "All Departments",
    "Engineering",
    "HR",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Design",
  ];

  const fetchShoutouts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShoutouts();
      const visible = res.filter(
        (s) =>
          s.is_public ||
          s.giver_id === currentUser.id ||
          s.receiver_id === currentUser.id
      );
      setShoutouts(visible.reverse());
    } catch (err) {
      console.error("Failed to fetch shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoutouts();
  }, []);

  useEffect(() => {
    if (shoutoutUpdated) fetchShoutouts();
  }, [shoutoutUpdated]);

  useEffect(() => {
    let result = [...shoutouts];

    if (senderDept !== "All Departments") {
      result = result.filter((s) => s.giver_department === senderDept);
    }

    if (receiverDept !== "All Departments") {
      result = result.filter((s) => s.receiver_department === receiverDept);
    }

    if (searchName.trim() !== "") {
      result = result.filter(
        (s) =>
          s.giver_name.toLowerCase().includes(searchName.toLowerCase()) ||
          s.receiver_name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (date) {
      result = result.filter((s) =>
        dayjs(s.created_at).isSame(dayjs(date), "day")
      );
    }

    setFiltered(result);
  }, [senderDept, receiverDept, searchName, date, shoutouts]);

  const clearFilters = () => {
    setSenderDept("All Departments");
    setReceiverDept("All Departments");
    setSearchName("");
    setDate("");
  };

  const editShoutout = async (shout) => {
    const newMessage = prompt("Edit shoutout message:", shout.message);
    if (!newMessage || newMessage.trim() === "" || newMessage === shout.message)
      return;

    try {
      await ApiService.updateShoutout(shout.id, { message: newMessage });
      fetchShoutouts();
    } catch (err) {
      console.error("Edit shoutout failed:", err);
    }
  };

  const deleteShoutout = async (shoutId) => {
    if (!confirm("Are you sure you want to delete this shoutout?")) return;
    try {
      await ApiService.deleteShoutout(shoutId);
      setShoutouts((prev) => prev.filter((s) => s.id !== shoutId));
    } catch (err) {
      console.error("Delete shoutout failed:", err);
    }
  };

  return (
    <div className="p-4 flex flex-col space-y-6">
      {/* Filters */}
      <motion.div
        className="bg-white p-5 rounded-3xl shadow-lg flex flex-wrap items-center gap-4 sticky top-4 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Filter className="text-gray-600" size={20} />

        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Sender:</label>
          <select
            value={senderDept}
            onChange={(e) => setSenderDept(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-blue-400"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Receiver:</label>
          <select
            value={receiverDept}
            onChange={(e) => setReceiverDept(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-green-400"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by sender or receiver"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="flex-1 min-w-[250px] border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
        />

        <motion.button
          onClick={clearFilters}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-sm bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <RotateCcw size={18} className="mr-2" /> Clear Filters
        </motion.button>
      </motion.div>

      {/* Feed Heading */}
      {!loading && filtered.length > 0 && (
        <motion.div
          className="text-center font-semibold text-lg text-purple-600 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🎉 Shoutouts Feed {senderDept !== "All Departments" ? `from ${senderDept}` : ""}{" "}
          {receiverDept !== "All Departments" ? `to ${receiverDept}` : ""} 🎉
        </motion.div>
      )}

      {/* Loading */}
      {loading && <div className="text-center mt-6 text-gray-500">Loading feed...</div>}

      {/* No shoutouts */}
      {!loading && filtered.length === 0 && (
        <motion.div className="text-center mt-2 text-pink-600 font-semibold text-lg bg-pink-50 py-4 rounded-xl mx-6 shadow-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
           No shoutouts match your filters! 
        </motion.div>
      )}

      {/* Feed */}
      {filtered.map((shout) => (
        <motion.div
          key={shout.id}
          className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-200 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header: Giver info + Date + 3-dot menu */}
          <div className="flex justify-between items-start mb-3 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {shout.giver_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{shout.giver_name}</p>
                <p className="text-gray-500 text-xs">
                  {`${shout.giver_department || "N/A"} | ${shout.giver_role || "N/A"}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end relative">
              <p className="text-gray-400 text-xs">
                {dayjs.utc(shout.created_at).local().format("DD MMM YYYY, hh:mm A")}
              </p>

              {shout.giver_id === currentUser.id && (
                <div className="relative mt-1">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === shout.id ? null : shout.id)}
                    className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
                  >
                    ⋮
                  </button>

                  {openMenuId === shout.id && (
                    <div className="absolute right-0 mt-2 w-28 bg-white border rounded-xl shadow-lg flex flex-col z-20">
                      <button
                        onClick={() => { editShoutout(shout); setOpenMenuId(null); }}
                        className="px-4 py-2 text-left text-sm hover:bg-blue-100 rounded-t-xl flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => { deleteShoutout(shout.id); setOpenMenuId(null); }}
                        className="px-4 py-2 text-left text-sm hover:bg-red-100 rounded-b-xl flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Receiver */}
          {shout.receiver_name && (
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                To: {shout.receiver_name} | {shout.receiver_department || "N/A"} | {shout.receiver_role || "N/A"}
              </span>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-700 my-2">{shout.message}</p>

          {/* Image */}
          {shout.image_url && (
            <img
              src={shout.image_url}
              alt="shoutout"
              className="w-full h-44 object-cover rounded-lg mt-2 mb-2 shadow-sm"
            />
          )}

          {/* Tagged Users */}
          {shout.tagged_users?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {shout.tagged_users.map((u) => (
                <div key={u.id} className="flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100">
                  <TargetIcon size={12} className="mr-1 text-gray-700" />
                  {u.username}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
