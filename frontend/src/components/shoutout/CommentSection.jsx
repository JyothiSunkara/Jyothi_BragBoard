import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ApiService from "../../services/api";

dayjs.extend(utc);

export default function CommentSection({
  shoutoutId,
  currentUser,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const menuRefs = useRef({});

  useEffect(() => {
    fetchComments();
  }, [shoutoutId]);

  const fetchComments = async () => {
    try {
      const res = await ApiService.getComments(shoutoutId);
      const visible = res
        .filter((c) => !c.is_deleted)
        .sort(
          (a, b) =>
            new Date(b.edited_at || b.created_at) -
            new Date(a.edited_at || a.created_at)
        );

      setComments(visible);
      onCommentCountChange?.(visible.length);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      await ApiService.addComment(shoutoutId, newComment.trim());
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const deleteComment = async (id) => {
    if (!confirm("Delete this comment?")) return;
    try {
      if (currentUser.role === "admin") {
        await ApiService.adminDeleteComment(id);
      } else {
        await ApiService.deleteComment(id);
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
      onCommentCountChange?.(comments.length - 1);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      const updated = await ApiService.updateComment(id, editValue.trim());
      setEditingId(null);
      setEditValue("");
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        openMenu &&
        menuRefs.current[openMenu] &&
        !menuRefs.current[openMenu].contains(e.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  return (
    <div className="mt-3 space-y-4">
      {comments.length === 0 && (
        <p className="text-gray-500 text-sm">
          No comments yet — start the conversation ✨
        </p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-white-100 border border-gray-200 rounded-xl p-3 shadow-sm relative overflow-visible"
          ref={(el) => (menuRefs.current[c.id] = el)}
        >
          {/* HEADER */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold shrink-0">
                {c.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {c.username}
                </p>
                <p className="text-gray-500 text-xs">{c.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* CLEAN TIME (no Edited here) */}
              <p className="text-[11px] text-gray-400 whitespace-nowrap">
                {dayjs
                  .utc(c.edited_at || c.created_at)
                  .local()
                  .format("DD MMM YYYY, hh:mm A")}
              </p>

              {(currentUser.id === c.user_id ||
                currentUser.role === "admin") && (
                <button
                  onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600 text-lg"
                >
                  ⋮
                </button>
              )}
            </div>
          </div>

          {/* MENU */}
          {openMenu === c.id && (
            <div className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-30">
              {currentUser.id === c.user_id && (
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditValue(c.content);
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
                >
                  ✏️ Edit
                </button>
              )}
              <button
                onClick={() => deleteComment(c.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50"
              >
                🗑 Delete
              </button>
            </div>
          )}

          {/* BODY */}
          {editingId === c.id ? (
            <div className="mt-3 pl-12 flex flex-col gap-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => saveEdit(c.id)}
                  disabled={editValue.trim() === c.content.trim()}
                  className={`px-3 py-1 text-sm rounded-md ${
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
            </div>
          ) : (
            <div className="mt-2 pl-12">
              <p className="text-gray-700 text-sm break-words">
                {c.edited_at && (
                  <span className="text-violet-600 font-medium mr-1">
                    (Edited)
                  </span>
                )}
                {c.content}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* NEW COMMENT */}
      <div className="flex gap-2 items-start mt-4">
        <div className="w-9 h-9 rounded-full bg-violet-300 flex items-center justify-center text-white shrink-0">
          👤
        </div>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={postComment}
          className="bg-violet-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-violet-600"
        >
          Post
        </button>
      </div>
    </div>
  );
}
