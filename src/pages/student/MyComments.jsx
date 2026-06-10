import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { MessageSquare, Trash2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export function MyComments() {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null); // comment.id

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, "comments"),
      where("studentUid", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setComments(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching student comments:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "comments", id));
      toast.success("Comment deleted successfully.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06B6D4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">My Comments</h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Track and manage all the comments and feedback you have posted on college curricula.
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <MessageSquare size={40} className="mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm font-semibold text-[#6B7280]">No comments posted yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Your questions or feedback in discussions will be recorded here.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[11px] font-semibold tracking-wide border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Syllabus / Curriculum</th>
                  <th className="px-6 py-4">Comment Text</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {comments.map((comment, index) => {
                  const isExpanded = expandedRow === comment.id;
                  const dateStr = comment.createdAt 
                    ? new Date(comment.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A";

                  return (
                    <React.Fragment key={comment.id}>
                      <tr 
                        onClick={() => setExpandedRow(isExpanded ? null : comment.id)}
                        className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ${
                          index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                        } ${isExpanded ? "bg-[#E0F7FA]/30" : ""}`}
                      >
                        <td className="px-6 py-4 font-bold text-[#111827] text-xs truncate max-w-[200px]">
                          <span className="flex items-center">
                            <BookOpen size={13} className="mr-1.5 text-[#9CA3AF] shrink-0" />
                            {comment.curriculumTitle}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#374151] max-w-[300px] truncate">
                          {comment.text}
                          {comment.replies && comment.replies.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                              {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#9CA3AF] whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComment(comment.id);
                            }}
                            className="p-2 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors shadow-2xs"
                            title="Delete Comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable row content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="px-8 py-5 bg-[#FAFAFA] border-t border-b border-[#E5E7EB]">
                            <div className="max-w-3xl space-y-4">
                              <div>
                                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Original Comment</h4>
                                <div className="flex space-x-3 items-start bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E0F7FA] border border-[#B2EBF2] text-[#006064] font-bold shrink-0 text-xs">
                                    {comment.studentName?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <p className="text-xs font-bold text-[#111827]">{comment.studentName}</p>
                                      <p className="text-[10px] text-[#9CA3AF]">{dateStr}</p>
                                    </div>
                                    <p className="text-xs text-[#374151] leading-relaxed break-words whitespace-pre-wrap">{comment.text}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Replies</h4>
                                {!comment.replies || comment.replies.length === 0 ? (
                                  <div className="text-xs text-[#9CA3AF] italic bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center">
                                    No replies yet.
                                  </div>
                                ) : (
                                  <div className="pl-4 border-l-2 border-[#E5E7EB] space-y-2.5">
                                    {comment.replies.map((reply, rIdx) => {
                                      const rDateStr = reply.createdAt 
                                        ? new Date(reply.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                                        : "Just now";

                                      const isFacultyReply = reply.authorRole === "Faculty";
                                      return (
                                        <div key={reply.replyId || rIdx} className="flex space-x-2.5 items-start bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-2xs">
                                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                                            isFacultyReply 
                                              ? "bg-emerald-50 border border-emerald-100 text-[#065F46]" 
                                              : "bg-indigo-50 border border-indigo-100 text-[#4F46E5]"
                                          }`}>
                                            {reply.authorName?.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                              <p className="text-[11px] font-bold text-[#111827]">
                                                {reply.authorName}{" "}
                                                <span className={`ml-1 text-[8px] px-1 rounded-sm uppercase tracking-wide font-black ${
                                                  isFacultyReply 
                                                    ? "bg-[#D1FAE5] text-[#065F46]" 
                                                    : "bg-[#EEF2FF] text-[#4F46E5]"
                                                }`}>
                                                  {reply.authorRole}
                                                </span>
                                              </p>
                                              <p className="text-[9px] text-[#9CA3AF] font-medium">{rDateStr}</p>
                                            </div>
                                            <p className="text-[11px] text-[#374151] leading-relaxed break-words whitespace-pre-wrap">{reply.text}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyComments;

