import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Send, MessageSquare, Calendar, CornerDownRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function CommentSection({ curriculumId, curriculumTitle }) {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Replies states
  const [replyingTo, setReplyingTo] = useState(null); // comment.id
  const [replyInputs, setReplyInputs] = useState({}); // { [commentId]: text }

  useEffect(() => {
    if (!curriculumId) return;

    const q = query(
      collection(db, "comments"),
      where("curriculumId", "==", curriculumId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      setComments(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error loading comments:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [curriculumId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!userProfile) {
      toast.error("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    try {
      const commentDoc = {
        curriculumId,
        curriculumTitle,
        studentUid: userProfile.uid,
        studentName: userProfile.name,
        college: userProfile.college,
        text: newComment.trim(),
        replies: [], // empty replies array initially
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "comments"), commentDoc);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId) => {
    const text = replyInputs[commentId] || "";
    if (!text.trim() || !userProfile) return;

    try {
      const replyObj = {
        replyId: `${userProfile.uid}_${Date.now()}`,
        authorName: userProfile.name,
        authorRole: userProfile.role,
        text: text.trim(),
        createdAt: new Date().toISOString()
      };

      const commentDocRef = doc(db, "comments", commentId);
      await updateDoc(commentDocRef, {
        replies: arrayUnion(replyObj)
      });

      // Clear input and toggle status
      setReplyInputs(prev => ({
        ...prev,
        [commentId]: ""
      }));
      setReplyingTo(null);
      toast.success("Reply posted!");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
      toast.success("Comment deleted!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.");
    }
  };


  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
      <h3 className="text-[18px] font-semibold text-[#111827] flex items-center mb-6 border-b border-[#E5E7EB] pb-4">
        <MessageSquare size={20} className="text-[#4F46E5] mr-2" />
        Discussion ({comments.length})
      </h3>

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center text-[13px] text-[#9CA3AF]">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-[#9CA3AF] bg-[#F9FAFB] rounded-xl mb-6 border border-[#E5E7EB]">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 mb-6 scrollbar">
          {comments.map((comment) => {
            const dateStr = comment.createdAt 
              ? new Date(comment.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Just now";

            const isMyComment = userProfile && comment.studentUid === userProfile.uid;

            return (
              <div 
                key={comment.id} 
                className={`group border rounded-xl p-4 transition-all duration-200 flex flex-col gap-3 ${
                  isMyComment 
                    ? "bg-[#EEF2FF]/40 border-[#4F46E5]/20" 
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                
                {/* Main Comment */}
                <div className="flex space-x-3 items-start relative">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white font-bold shrink-0 text-sm shadow-sm">
                    {comment.studentName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-[14px] font-semibold text-[#111827]">{comment.studentName}</p>
                        {isMyComment && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/10">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="text-[12px] text-[#9CA3AF] flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {dateStr}
                        </p>
                        {isMyComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-[12px] text-red-400 hover:text-red-600 transition-opacity duration-150 flex items-center gap-1 font-medium cursor-pointer"
                            title="Delete Comment"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[14px] text-[#374151] leading-relaxed break-words whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>

                {/* Sub-Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-6 border-l-2 border-[#4F46E5]/20 space-y-2.5 mt-1">
                    {comment.replies.map((reply, rIdx) => {
                      const rDateStr = reply.createdAt 
                        ? new Date(reply.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Just now";

                      const isFacultyReply = reply.authorRole === "Faculty";
                      return (
                        <div key={reply.replyId || rIdx} className="flex space-x-2.5 items-start bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 shadow-sm">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                            isFacultyReply 
                              ? "bg-gradient-to-tr from-[#10B981] to-[#059669] text-white" 
                              : "bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white"
                          }`}>
                            {reply.authorName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <div className="flex items-center space-x-1.5">
                                <p className="text-[13px] font-semibold text-[#111827]">
                                  {reply.authorName}
                                </p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isFacultyReply 
                                    ? "bg-emerald-100 text-[#10B981] border border-emerald-200/40" 
                                    : "bg-indigo-100 text-[#4F46E5]"
                                }`}>
                                  {reply.authorRole}
                                </span>
                              </div>
                              <p className="text-[12px] text-[#9CA3AF]">{rDateStr}</p>
                            </div>
                            <p className="text-[13px] text-[#374151] leading-relaxed break-words whitespace-pre-wrap">{reply.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply triggers and Forms */}
                {userProfile?.role === "Faculty" && (
                  <div className="pl-6 mt-1">
                    {replyingTo === comment.id ? (
                      <div className="flex items-center gap-2">
                        <CornerDownRight size={14} className="text-[#9CA3AF] shrink-0" />
                        <input
                          type="text"
                          placeholder="Write reply to student..."
                          value={replyInputs[comment.id] || ""}
                          onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          className="flex-1 px-4 py-2 text-[13px] bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-[#111827] placeholder-[#9CA3AF] transition-shadow duration-150"
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!(replyInputs[comment.id] || "").trim()}
                          className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 text-white rounded-xl text-[13px] font-semibold shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] rounded-xl text-[13px] font-semibold transition-all duration-200 shrink-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-[13px] font-semibold text-[#4F46E5] hover:text-[#7C3AED] hover:underline flex items-center space-x-1 transition-all duration-150"
                      >
                        <span>Reply &rarr;</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Comment Form (only for student or logged in user) */}
      <form onSubmit={handleSubmit} className="relative mt-4">
        <textarea
          rows="2"
          placeholder="Share your thoughts or questions about this curriculum..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          className="w-full px-4 py-3 text-[14px] bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] focus:bg-white transition-all resize-none pr-12 text-[#111827] placeholder-[#9CA3AF]"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-110 disabled:bg-[#9CA3AF] disabled:opacity-50 text-white rounded-xl shadow-md transition-all duration-200 cursor-pointer"
        >
          <Send size={14} className={submitting ? "animate-pulse" : ""} />
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
