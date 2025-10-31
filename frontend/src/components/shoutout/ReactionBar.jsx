import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ApiService from "../../services/api";

const emojiOptions = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "clap", emoji: "👏", label: "Appreciate" },
  { type: "celebrate", emoji: "🎉", label: "Celebrate" },
  { type: "insightful", emoji: "💡", label: "Insightful" },
  { type: "support", emoji: "🤝", label: "Support" },
  { type: "star", emoji: "⭐", label: "Star" },
];

const ReactionBar = ({ shoutout }) => {
  const [reactions, setReactions] = useState({
    my_reaction: null,
    like: 0,
    love: 0,
    clap: 0,
    celebrate: 0,
    insightful: 0,
    support: 0,
    star: 0,
  });

  const [loading, setLoading] = useState(false);
  const [reactedUsers, setReactedUsers] = useState({});
  const [showPopup, setShowPopup] = useState(null);
  const popupRef = useRef(null); // <--- REFERENCE TO POPUP

  // Close popup when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReactions = async () => {
    try {
      const data = await ApiService.getReactionCounts(shoutout.id);
      setReactions((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  };

  const handleReaction = async (type) => {
    if (loading) return;
    setLoading(true);

    setReactions((prev) => {
      const current = prev.my_reaction;
      const newState = { ...prev };

      if (current) newState[current] = Math.max(0, newState[current] - 1);

      if (current === type) {
        newState.my_reaction = null;
        return newState;
      }

      newState[type] = (newState[type] || 0) + 1;
      newState.my_reaction = type;
      return newState;
    });

    try {
      await ApiService.addReaction(shoutout.id, type);
      fetchReactions();
    } catch (err) {
      console.error("Reaction Error:", err);
    }

    setLoading(false);
  };

  const fetchReactedUsers = async (type) => {
    try {
      const data = await ApiService.getReactedUsers(shoutout.id);
      setReactedUsers(data);
      setShowPopup((prev) => (prev === type ? null : type));
    } catch (err) {
      console.error("Error fetching reacted users:", err);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [shoutout.id]);

  return (
    <div className="relative flex gap-3 mt-2 flex-wrap">
      {emojiOptions.map(({ type, emoji, label }) => {
        const active = reactions.my_reaction === type;
        const count = reactions[type] || 0;
        const users = reactedUsers[type] || [];

        return (
          <div key={type} className="relative group">
            <motion.button
              onClick={() => handleReaction(type)}
              whileTap={{ scale: 1.35 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`
                flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-150
                ${active
                  ? "bg-purple-200 text-purple-800 font-semibold shadow-sm scale-90"
                  : "bg-transparent hover:bg-gray-100 hover:scale-105"
                }
              `}
              disabled={loading}
            >
              <span className="text-lg">{emoji}</span>

              {/* count (no underline) */}
              <span
                className="text-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchReactedUsers(type);
                }}
              >
                {count}
              </span>
            </motion.button>

            {/* Tooltip */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                px-2 py-1 rounded-md bg-gray-200 text-xs opacity-0 group-hover:opacity-100 
                transition duration-200 pointer-events-none"
            >
              {label}
            </div>

            {/* Popup */}
            {showPopup === type && users.length > 0 && (
              <div
                ref={popupRef}
                className="absolute bg-white border border-gray-200 shadow-md rounded-md p-2 mt-1 w-64 z-20"
              >
                {users.map((user, i) => (
                  <div key={i} className="py-1 text-sm">
                    <strong>{user.username}</strong>
                    {user.department || user.role ? (
                      <> | {user.department || "N/A"} | {user.role || "N/A"}</>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReactionBar;
