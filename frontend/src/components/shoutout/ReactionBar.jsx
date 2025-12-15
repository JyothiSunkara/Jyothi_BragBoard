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
  const [showMobileModal, setShowMobileModal] = useState(false);

  const popupRef = useRef(null);

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

  const fetchReactedUsers = async () => {
    try {
      const data = await ApiService.getReactedUsers(shoutout.id);
      setReactedUsers(data);
    } catch (err) {
      console.error("Error fetching reacted users:", err);
    }
  };

  const totalReactions = emojiOptions.reduce(
    (sum, r) => sum + (reactions[r.type] || 0),
    0
  );

  useEffect(() => {
    fetchReactions();
  }, [shoutout.id]);

  return (
    <>
      {/* Mobile Reaction Button */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileModal(true)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg font-medium transition
            ${
              reactions.my_reaction
                ? "bg-violet-100 text-violet-700" // highlighted if reacted
                : "bg-gray-100 text-gray-700" // neutral if not reacted
            }`}
        >
          <span className="text-lg">
            {reactions.my_reaction
              ? emojiOptions.find((e) => e.type === reactions.my_reaction)
                  ?.emoji
              : "👍"}
          </span>

          <span className="text-sm">
            {totalReactions} {totalReactions === 1 ? "Reaction" : "Reactions"}
          </span>
        </button>
      </div>

      {/* Desktop Reaction Bar */}
      <div className="hidden sm:flex relative gap-3 mt-2 flex-wrap overflow-visible">
        {emojiOptions.map(({ type, emoji, label }) => {
          const active = reactions.my_reaction === type;
          const count = reactions[type] || 0;

          return (
            <div key={type} className="relative group">
              <motion.button
                onClick={() => handleReaction(type)}
                whileTap={{ scale: 1.35 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all 
            ${
              active
                ? "bg-purple-200 text-purple-800 font-semibold shadow-sm scale-90"
                : "bg-transparent hover:bg-gray-100 hover:scale-105"
            }`}
                disabled={loading}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm">{count}</span>
              </motion.button>

              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
          px-2 py-1 rounded-md bg-gray-200 text-xs opacity-0 
          group-hover:opacity-100 transition whitespace-nowrap shadow-md z-50"
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Modal for reactions */}
      {showMobileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex justify-center items-end sm:hidden">
          <div className="bg-white w-full p-4 rounded-t-2xl shadow-xl max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Reactions</h3>
              <button
                onClick={() => setShowMobileModal(false)}
                className="text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {emojiOptions.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    handleReaction(type);
                    setShowMobileModal(false);
                  }}
                  className={`flex flex-col items-center p-3 rounded-xl border
                  ${
                    reactions.my_reaction === type
                      ? "bg-purple-100 border-purple-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-sm mt-1">{label}</span>
                  <span className="text-[11px] text-gray-500 mt-1">
                    {reactions[type] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionBar;
