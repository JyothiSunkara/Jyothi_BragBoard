import { useState, useEffect, useRef } from "react";
import { Edit2, Trash2, Filter, RotateCcw, TargetIcon } from "lucide-react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import EditShoutOut from "./EditShoutOut";
import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";

dayjs.extend(utc);

export default function ShoutOutFeed({
  currentUser,
  shoutoutUpdated,
  overrideShoutouts = null,
  title = "Shout-Out Feed",
  subtitle = "Browse recognitions shared across the organization 💬",
  showStats = false,
  hideSenderFilter = false,
}) {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [editingShoutoutId, setEditingShoutoutId] = useState(null);
  const [senderDept, setSenderDept] = useState("All Departments");
  const [receiverDept, setReceiverDept] = useState("All Departments");
  const [searchName, setSearchName] = useState("");
  const [date, setDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentCounts, setCommentCounts] = useState({}); // { [shoutId]: count }
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const departments = [
    "All Departments",
    "Engineering",
    "Human Resources",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Design",
  ];

  const menuRefs = useRef({});
  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  // Fetch shoutouts and remove deleted ones
  const fetchShoutouts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShoutouts();

      //  Remove deleted shoutouts
      const clean = res.filter((s) => !s.is_deleted);

      const visible = clean.filter((s) => {
        if (s.is_public === "public") return true;
        if (
          s.is_public === "private" &&
          (s.giver_id === currentUser.id || s.receiver_id === currentUser.id)
        )
          return true;
        if (
          s.is_public === "department_only" &&
          s.giver_department === currentUser.department
        )
          return true;
        return false;
      });

      const sorted = visible.sort((a, b) => {
        const aTime = new Date(a.edited_at || a.created_at);
        const bTime = new Date(b.edited_at || b.created_at);
        return bTime - aTime;
      });

      setShoutouts(sorted);
    } catch (err) {
      console.error("Failed to fetch shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (overrideShoutouts) {
      setShoutouts(overrideShoutouts);
      setLoading(false);
    } else {
      fetchShoutouts();
    }
  }, [overrideShoutouts]);

  useEffect(() => {
    if (shoutoutUpdated) fetchShoutouts();
  }, [shoutoutUpdated]);

  // Filtering
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

  // Delete shoutout completely from UI
  const deleteShoutout = async (shoutId) => {
    if (!confirm("Are you sure you want to delete this shoutout?")) return;
    try {
      await ApiService.deleteShoutout(shoutId);

      setShoutouts((prev) => prev.filter((s) => s.id !== shoutId));
    } catch (err) {
      console.error("Delete shoutout failed:", err);
    }
  };

  // Detect screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalCount = filtered.length;

  const sentCount = filtered.filter(
    (s) => s.giver_id === currentUser.id
  ).length;

  const receivedCount = filtered.filter(
    (s) => s.receiver_id === currentUser.id
  ).length;

  // useEffect(() => {
  //   if (hideSenderFilter) {
  //     setSenderDept("All");
  //   }
  // }, [hideSenderFilter]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-6 relative overflow-visible py-4">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-700 via-pink-500 to-indigo-500 text-transparent bg-clip-text">
            {title}
          </h2>

          <p className="text-gray-500 mb-6">{subtitle}</p>

          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* TOTAL */}
              <div className="col-span-2 sm:col-span-1 bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {totalCount}
                </p>
              </div>

              {/* SENT */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {sentCount}
                </p>
              </div>

              {/* RECEIVED */}
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">Received</p>
                <p className="text-2xl font-bold text-pink-700">
                  {receivedCount}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Filter Toggle */}
          {isMobile && (
            <div className="mb-2">
              <button
                onClick={() => setShowMobileFilters((prev) => !prev)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition"
              >
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          )}

          {/* Filters */}
          <motion.div
            className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl 
             flex flex-wrap items-center gap-4 relative z-20
             md:p-4 p-2" // Reduce padding on mobile
            initial={false}
            animate={
              isMobile
                ? {
                    height: showMobileFilters ? "auto" : 0,
                    opacity: showMobileFilters ? 1 : 0,
                  }
                : { height: "auto", opacity: 1 }
            }
            transition={{ duration: 0.3 }}
            style={{
              overflow: isMobile ? "hidden" : "visible",
              marginBottom: isMobile && !showMobileFilters ? "0px" : "1rem", // reduce gap when hidden
            }}
          >
            <Filter className="text-gray-600" size={20} />

            {/* Sender Filter */}
            {!hideSenderFilter && (
              <div className="flex items-center space-x-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700">
                  Sender:
                </label>
                <select
                  value={senderDept}
                  onChange={(e) => setSenderDept(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-blue-400"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Receiver Filter */}
            <div className="flex items-center space-x-2 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700">
                Receiver:
              </label>
              <select
                value={receiverDept}
                onChange={(e) => setReceiverDept(e.target.value)}
                className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-green-400"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by sender or receiver"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 min-w-[200px] border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
            />

            {/* Date Filter */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
            />

            {/* Clear Filters */}
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-sm bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <RotateCcw size={18} className="mr-2" /> Clear Filters
            </motion.button>
          </motion.div>

          {/* Count */}
          {!hideSenderFilter && (
            <motion.div
              className="flex justify-between items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 rounded-xl shadow border border-gray-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-600 text-base font-medium">
                Showing{" "}
                <span className="text-indigo-600 font-semibold">
                  {filtered.length}
                </span>{" "}
                shoutout{filtered.length !== 1 ? "s" : ""}{" "}
                {senderDept !== "All Departments" ||
                receiverDept !== "All Departments" ||
                searchName.trim() !== "" ||
                date !== ""
                  ? "based on your filters 🎯"
                  : "in total 🚀"}
              </p>
            </motion.div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="text-center mt-6 text-gray-500">
              Loading feed...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center mt-2 text-pink-600 font-semibold text-lg bg-pink-50 py-4 rounded-xl mx-6 shadow-inner">
              No shoutouts match your filters!
            </div>
          ) : (
            filtered.map((shout) => (
              <motion.div
                key={shout.id}
                className="bg-white-100 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* =================== HEADER =================== */}
                {/* MOBILE HEADER */}
                <div className="flex flex-col sm:hidden gap-2">
                  {/* Row 1: Profile + Sender (left), Category + 3-dot (right) */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {shout.giver_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {shout.giver_name}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {shout.giver_department} | {shout.giver_role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      {shout.category && (
                        <span className="inline-block text-[11px] bg-indigo-100 text-indigo-700 px-2 py-[3px] rounded-md font-medium">
                          {shout.category}
                        </span>
                      )}

                      {(shout.giver_id === currentUser.id ||
                        currentUser.role === "admin" ||
                        currentUser.role !== "admin") && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === shout.id ? null : shout.id
                              );
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition"
                          >
                            ⋮
                          </button>

                          {openMenuId === shout.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg w-36 overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
                            >
                              {shout.giver_id === currentUser.id && (
                                <button
                                  onClick={() => {
                                    setEditingShoutoutId(shout.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
                                >
                                  ✏️ Edit
                                </button>
                              )}

                              {(currentUser.role === "admin" ||
                                shout.giver_id === currentUser.id) && (
                                <button
                                  onClick={() => {
                                    deleteShoutout(shout.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                  🗑 Delete
                                </button>
                              )}

                              {shout.giver_id !== currentUser.id &&
                                currentUser.role !== "admin" && (
                                  <button
                                    onClick={async () => {
                                      const reason = prompt(
                                        "Please enter the reason for reporting this shoutout:"
                                      );
                                      if (!reason || !reason.trim()) return;
                                      await ApiService.reportShoutout(
                                        shout.id,
                                        reason.trim()
                                      );
                                      alert("Report submitted successfully!");
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 transition"
                                  >
                                    🚩 Report
                                  </button>
                                )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Recipient left, Timestamp right */}
                  <div className="flex justify-between items-center">
                    {shout.receiver_name && (
                      <span className="inline-block text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium break-words">
                        To: {shout.receiver_name} | {shout.receiver_role}
                      </span>
                    )}
                    <p className="text-[11px] text-gray-600 whitespace-nowrap">
                      {shout.edited_at
                        ? dayjs
                            .utc(shout.edited_at)
                            .local()
                            .format("DD MMM YYYY, hh:mm A")
                        : dayjs
                            .utc(shout.created_at)
                            .local()
                            .format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>

                {/* DESKTOP HEADER: unchanged */}
                <div className="hidden sm:flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold flex-shrink-0"
                      aria-hidden
                    >
                      {shout.giver_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {shout.giver_name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {shout.giver_department} | {shout.giver_role}
                      </span>
                      {shout.receiver_name && (
                        <span className="inline-block mt-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium break-words">
                          To: {shout.receiver_name} | {shout.receiver_role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 relative">
                    {shout.category && (
                      <span className="inline-block mt-1 text-[11px] bg-indigo-100 text-indigo-700 px-2 py-[3px] rounded-md font-medium">
                        {shout.category}
                      </span>
                    )}
                    <p className="text-[11px] text-gray-600 whitespace-nowrap mt-1">
                      {shout.edited_at
                        ? `Edited: ${dayjs
                            .utc(shout.edited_at)
                            .local()
                            .format("DD MMM YYYY, hh:mm A")}`
                        : dayjs
                            .utc(shout.created_at)
                            .local()
                            .format("DD MMM YYYY, hh:mm A")}
                    </p>

                    {(shout.giver_id === currentUser.id ||
                      currentUser.role === "admin" ||
                      currentUser.role !== "admin") && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === shout.id ? null : shout.id
                            );
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition ml-1"
                        >
                          ⋮
                        </button>

                        {openMenuId === shout.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg w-36 overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
                          >
                            {shout.giver_id === currentUser.id && (
                              <button
                                onClick={() => {
                                  setEditingShoutoutId(shout.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {(currentUser.role === "admin" ||
                              shout.giver_id === currentUser.id) && (
                              <button
                                onClick={() => {
                                  deleteShoutout(shout.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                              >
                                🗑 Delete
                              </button>
                            )}

                            {shout.giver_id !== currentUser.id &&
                              currentUser.role !== "admin" && (
                                <button
                                  onClick={async () => {
                                    const reason = prompt(
                                      "Please enter the reason for reporting this shoutout:"
                                    );
                                    if (!reason || !reason.trim()) return;
                                    await ApiService.reportShoutout(
                                      shout.id,
                                      reason.trim()
                                    );
                                    alert("Report submitted successfully!");
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 transition"
                                >
                                  🚩 Report
                                </button>
                              )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* =================== MESSAGE, IMAGE, TAGS, REACTIONS, COMMENTS =================== */}
                {editingShoutoutId !== shout.id && (
                  <p className="text-gray-700 text-sm mt-4 leading-relaxed">
                    {shout.edited_at && (
                      <span className="text-violet-600 font-medium mr-1">
                        (Edited)
                      </span>
                    )}
                    {shout.message}
                  </p>
                )}

                {shout.image_url && (
                  <img
                    src={shout.image_url}
                    alt="shoutout"
                    className="w-full max-w-lg rounded-lg mt-4 shadow-sm"
                  />
                )}

                {shout.tagged_users?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {shout.tagged_users.map((u) => (
                      <span
                        key={u.id}
                        className="px-2 py-1 bg-purple-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        <TargetIcon size={12} className="inline mr-1" />{" "}
                        {u.username}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200">
                  <ReactionBar shoutout={shout} />

                  <button
                    onClick={() =>
                      setOpenCommentsId(
                        openCommentsId === shout.id ? null : shout.id
                      )
                    }
                    className="text-sm font-semibold text-violet-600 hover:underline"
                  >
                    {openCommentsId === shout.id
                      ? `Hide Comments (${
                          commentCounts[shout.id] ?? shout.comment_count ?? 0
                        })`
                      : `View Comments (${
                          commentCounts[shout.id] ?? shout.comment_count ?? 0
                        })`}
                  </button>
                </div>

                {openCommentsId === shout.id && (
                  <div className="mt-4">
                    <CommentSection
                      shoutoutId={shout.id}
                      currentUser={currentUser}
                      onCommentCountChange={(count) =>
                        setCommentCounts((prev) => ({
                          ...prev,
                          [shout.id]: count,
                        }))
                      }
                    />
                  </div>
                )}

                {editingShoutoutId === shout.id && (
                  <EditShoutOut
                    currentUser={currentUser}
                    shoutout={shout}
                    onCancel={() => setEditingShoutoutId(null)}
                    onUpdated={fetchShoutouts}
                  />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
