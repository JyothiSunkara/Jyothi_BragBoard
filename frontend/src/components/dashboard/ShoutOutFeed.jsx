import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(relativeTime);

const ShoutoutFeed = ({ currentUser }) => {
  const [shoutouts, setShoutouts] = useState([]);

  // Fetch shoutouts
  const fetchShoutouts = async () => {
    try {
      const res = await ApiService.getAllShoutouts();
      setShoutouts(res);
    } catch (err) {
      console.error("Failed to fetch shoutouts", err);
    }
  };

  useEffect(() => {
    fetchShoutouts();
  }, []);

  // Toggle like/clap
  const toggleReaction = async (shoutId, type) => {
    setShoutouts(prev =>
      prev.map(s => {
        if (s.id === shoutId) {
          const hasReacted = s[type].includes(currentUser.id);
          return {
            ...s,
            [type]: hasReacted
              ? s[type].filter(id => id !== currentUser.id)
              : [...s[type], currentUser.id],
          };
        }
        return s;
      })
    );

    try {
      const shout = shoutouts.find(s => s.id === shoutId);
      if (shout[type].includes(currentUser.id)) {
        await ApiService.removeReaction(shoutId, type);
      } else {
        await ApiService.addReaction(shoutId, type);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add comment
  const addComment = async (shoutId, text) => {
    if (!text.trim()) return;
    const newComment = { id: Date.now(), user: currentUser, text }; // temporary id
    setShoutouts(prev =>
      prev.map(s => (s.id === shoutId ? { ...s, comments: [...s.comments, newComment] } : s))
    );
    try {
      await ApiService.addComment(shoutId, { user_id: currentUser.id, text });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete comment
  const deleteComment = async (shoutId, commentId) => {
    setShoutouts(prev =>
      prev.map(s =>
        s.id === shoutId ? { ...s, comments: s.comments.filter(c => c.id !== commentId) } : s
      )
    );
    try {
      await ApiService.deleteComment(shoutId, commentId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4">
      {shoutouts.map(shout => (
        <div
          key={shout.id}
          className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 w-full relative"
        >
          {/* Time on top-right */}
          <p className="absolute top-4 right-4 text-gray-400 text-sm">
            {dayjs.utc(shout.created_at).local().fromNow()}
          </p>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {shout.giver_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">
                {shout.giver_name} {shout.giver_role ? `(${shout.giver_role})` : ""}
              </p>
              <p className="text-gray-400 text-sm">{shout.giver_department}</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-700 my-2">{shout.message}</p>

          {/* Tagged users */}
          {shout.tagged_users?.length > 0 && (
            <p className="text-gray-500 text-sm mb-2">
              Tagged: {shout.tagged_users.map(u => u.username).join(", ")}
            </p>
          )}

          {/* Reactions */}
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => toggleReaction(shout.id, "likes")}
              onDoubleClick={() => toggleReaction(shout.id, "likes")}
              className={`flex items-center space-x-1 ${
                shout.likes.includes(currentUser.id) ? "text-blue-500 font-bold" : "text-gray-500"
              }`}
            >
              👍 <span>{shout.likes.length}</span>
            </button>

            <button
              onClick={() => toggleReaction(shout.id, "claps")}
              onDoubleClick={() => toggleReaction(shout.id, "claps")}
              className={`flex items-center space-x-1 ${
                shout.claps.includes(currentUser.id) ? "text-yellow-500 font-bold" : "text-gray-500"
              }`}
            >
              👏 <span>{shout.claps.length}</span>
            </button>

            {/* Comments count */}
            <div className="flex items-center space-x-1 text-gray-500">
              💬 <span>{shout.comments.length}</span>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-3 space-y-2">
            {shout.comments.map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  <strong>
                    {c.user.username} {c.user.role ? `(${c.user.role})` : ""}:
                  </strong>{" "}
                  {c.text}
                </span>
                {c.user.id === currentUser.id && (
                  <button
                    onClick={() => deleteComment(shout.id, c.id)}
                    className="text-red-500 ml-2"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <CommentInput shoutId={shout.id} onAdd={addComment} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Comment input component
const CommentInput = ({ shoutId, onAdd }) => {
  const [text, setText] = useState("");
  return (
    <div className="flex mt-2 space-x-2">
      <input
        type="text"
        placeholder="Add a comment..."
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring focus:border-blue-300"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            onAdd(shoutId, text);
            setText("");
          }
        }}
      />
      <button
        onClick={() => {
          onAdd(shoutId, text);
          setText("");
        }}
        className="bg-blue-500 text-white px-3 py-1 rounded-lg"
      >
        Post
      </button>
    </div>
  );
};

export default ShoutoutFeed;
