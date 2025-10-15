import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(relativeTime);

const ShoutoutFeed = ({ currentUser }) => {
  const [shoutouts, setShoutouts] = useState([]);
  const [commentInput, setCommentInput] = useState({});

  useEffect(() => {
    const fetchShoutouts = async () => {
      try {
        const res = await ApiService.getShoutouts(); // Fetch all shoutouts
        setShoutouts(res);
      } catch (err) {
        console.error("Failed to fetch shoutouts", err);
      }
    };

    fetchShoutouts();
  }, []);

  const handleLike = (shoutId) => {
    setShoutouts((prev) =>
      prev.map((s) =>
        s.id === shoutId
          ? {
              ...s,
              likedByCurrentUser: !s.likedByCurrentUser,
              likes: s.likedByCurrentUser ? s.likes - 1 : s.likes + 1,
            }
          : s
      )
    );
  };

  const handleClap = (shoutId) => {
    setShoutouts((prev) =>
      prev.map((s) =>
        s.id === shoutId
          ? {
              ...s,
              clappedByCurrentUser: !s.clappedByCurrentUser,
              claps: s.clappedByCurrentUser ? s.claps - 1 : s.claps + 1,
            }
          : s
      )
    );
  };

  const handleAddComment = (shoutId) => {
    const text = commentInput[shoutId];
    if (!text) return;

    const newComment = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      text,
      created_at: new Date().toISOString(),
    };

    setShoutouts((prev) =>
      prev.map((s) =>
        s.id === shoutId
          ? { ...s, comments: [...s.comments, newComment] }
          : s
      )
    );

    setCommentInput((prev) => ({ ...prev, [shoutId]: "" }));
  };

  const handleDeleteComment = (shoutId, commentId) => {
    setShoutouts((prev) =>
      prev.map((s) =>
        s.id === shoutId
          ? {
              ...s,
              comments: s.comments.filter((c) => c.id !== commentId),
            }
          : s
      )
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      {shoutouts.map((shout) => (
        <div key={shout.id} className="bg-white p-6 rounded-lg shadow">
          {/* Header: User Info */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {shout.giver_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">
                {shout.giver_name}{" "}
                <span className="text-sm text-gray-500">
                  ({shout.giver_role || "Employee"})
                </span>
              </p>
              <p className="text-gray-400 text-sm">{shout.giver_department}</p>
            </div>
            <p className="ml-auto text-gray-400 text-sm">
              {dayjs.utc(shout.created_at).local().fromNow()}
            </p>
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-4">{shout.message}</p>

          {/* Recipients */}
          {shout.recipients?.length > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              To: {shout.recipients.map((r) => `${r.name} (${r.department})`).join(", ")}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              className={`px-3 py-1 rounded-lg ${
                shout.likedByCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => handleLike(shout.id)}
            >
              👍 {shout.likes || 0}
            </button>
            <button
              className={`px-3 py-1 rounded-lg ${
                shout.clappedByCurrentUser ? "bg-yellow-400 text-white" : "bg-gray-100"
              }`}
              onClick={() => handleClap(shout.id)}
            >
              👏 {shout.claps || 0}
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            {shout.comments?.map((c) => (
              <div key={c.id} className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  {c.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{c.username}</span>{" "}
                    <span className="text-gray-500 text-xs">({c.role})</span>
                  </p>
                  <p className="text-gray-600 text-sm">{c.text}</p>
                </div>
                {c.userId === currentUser.id && (
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleDeleteComment(shout.id, c.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Add a comment..."
                value={commentInput[shout.id] || ""}
                onChange={(e) =>
                  setCommentInput((prev) => ({ ...prev, [shout.id]: e.target.value }))
                }
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => handleAddComment(shout.id)}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShoutoutFeed;
