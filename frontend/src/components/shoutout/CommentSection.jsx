import { useState, useEffect, useRef } from "react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function CommentSection({ shoutoutId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const menuRefs = useRef({});

  useEffect(() => {
    fetchComments();
  }, []);

  // ✅ Sort newest → oldest
  const fetchComments = async () => {
    let res = await ApiService.getComments(shoutoutId);
    res = res.sort(
      (a, b) => new Date(b.edited_at || b.created_at) - new Date(a.edited_at || a.created_at)
    );
    setComments(res);
  };

  // ✅ Close menu on outside click
  useEffect(() => {
    const closeMenu = (e) => {
      if (
        openMenu &&
        menuRefs.current[openMenu] &&
        !menuRefs.current[openMenu].contains(e.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [openMenu]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    await ApiService.addComment(shoutoutId, newComment.trim());
    setNewComment("");
    fetchComments();
  };

  const deleteComment = async (id) => {
    if (!confirm("Delete this comment?")) return;
    await ApiService.deleteComment(id);
    setOpenMenu(null);
    fetchComments();
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    await ApiService.updateComment(id, editValue.trim());
    setEditingId(null);
    setEditValue("");
    fetchComments();
  };

  return (
    <div className="mt-3 space-y-4">

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet — start the conversation ✨</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">

            {/* Header Row */}
            <div className="flex justify-between items-center" ref={(el) => (menuRefs.current[c.id] = el)}>
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {c.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{c.username}</p>
                  <p className="text-gray-500 text-xs">{c.department} | {c.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">

                <p className="text-[11px] text-gray-400 whitespace-nowrap">
                  {c.edited_at
                    ? `Edited: ${dayjs.utc(c.edited_at).local().format("DD MMM YYYY, hh:mm A")}`
                    : dayjs.utc(c.created_at).local().format("DD MMM YYYY, hh:mm A")}
                </p>

                {(currentUser.id === c.user_id || currentUser.role === "admin") && (
                  <button
                    onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                    className="text-gray-500 hover:text-gray-800 text-lg px-1"
                  >
                    ⋮
                  </button>
                )}

                {openMenu === c.id && (
                  <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditValue(c.content);
                        setOpenMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode */}
            {editingId === c.id ? (
              <div className="mt-3 flex gap-2 items-center ml-12">

                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 border rounded-md px-2 py-1 text-sm"
                />

                {/* ✅ Save disabled until value changes */}
                <button
                  onClick={() => saveEdit(c.id)}
                  disabled={editValue.trim() === c.content.trim()}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    editValue.trim() === c.content.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  Save
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-700 text-sm mt-2 ml-12">{c.content}</p>
            )}
          </div>
        ))
      )}

      {/* Add Comment */}
      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={postComment}
          className="bg-violet-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-violet-600 transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}
