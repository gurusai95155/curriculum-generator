import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { MessageSquare, Calendar, BookOpen, CornerDownRight } from "lucide-react";
import toast from "react-hot-toast";

export function FacultyComments() {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replies states
  const [replyingTo, setReplyingTo] = useState(null); // comment.id
  const [replyInputs, setReplyInputs] = useState({}); // { [commentId]: text }

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

  useEffect(() => {
    if (!userProfile) return;

    // First fetch all curricula belonging to this faculty member to map their IDs
    async function loadComments() {
      try {
        const curricQuery = query(
          collection(db, "curricula"),
          where("publishedBy", "==", userProfile.uid)
        );
        const curricSnapshot = await getDocs(curricQuery);
        const curriculumIds = curricSnapshot.docs.map(doc => doc.id);

        if (curriculumIds.length === 0) {
          setComments([]);
          setLoading(false);
          return;
        }

        // Set up real-time onSnapshot for comments from this college
        // We'll filter client-side to only show comments belonging to this faculty's curricula
        const commentsQuery = query(
          collection(db, "comments"),
          where("college", "==", userProfile.college)
        );

        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
          const allComments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          
          // Filter comments that match this faculty's curriculum IDs
          const filtered = allComments.filter(comment => 
            curriculumIds.includes(comment.curriculumId)
          );

          setComments(filtered);
          setLoading(false);
        }, (error) => {
          console.error("Error setting up comments snapshot:", error);
          setLoading(false);
        });

        return unsubscribe;

      } catch (error) {
        console.error("Error in loadComments:", error);
        setLoading(false);
      }
    }

    let unsub;
    loadComments().then(res => {
      unsub = res;
    });

    return () => {
      if (unsub) unsub();
    };
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">Student Comments</h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Review discussions and feedback posted by students on your published curricula.
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <MessageSquare size={40} className="mx-auto text-[#9CA3AF] mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-[#6B7280]">No comments received yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Feedback from students will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
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
              <div 
                key={comment.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] flex gap-4 transition-all hover:shadow-md hover:border-[#4F46E5]"
              >
                {/* Student Avatar Icon with gradient background */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white font-bold text-sm shrink-0 shadow-sm">
                  {comment.studentName?.charAt(0).toUpperCase()}
                </div>

                {/* Comment Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div>
                      <h4 className="font-semibold text-[15px] text-[#111827]">{comment.studentName}</h4>
                      <p className="text-[10px] text-[#9CA3AF] font-medium">Student at {comment.college}</p>
                    </div>
                    <span className="text-[12px] text-[#9CA3AF] flex items-center shrink-0">
                      <Calendar size={12} className="mr-1 text-[#9CA3AF]" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-[14px] text-[#374151] bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-xl break-words leading-relaxed mb-3">
                    {comment.text}
                  </p>

                  {/* Target Curriculum Link details */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="inline-flex items-center text-[10px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-lg border border-[#E0E7FF]">
                      <BookOpen size={11} className="mr-1.5 shrink-0" />
                      <span className="truncate">Syllabus: {comment.curriculumTitle}</span>
                    </div>
                    {replyingTo !== comment.id && (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs font-bold text-[#4F46E5] hover:text-[#7C3AED] hover:underline flex items-center space-x-1"
                      >
                        <span>Reply &rarr;</span>
                      </button>
                    )}
                  </div>

                  {/* Sub-Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-4 border-l-2 border-[#E5E7EB] space-y-2.5 mt-4">
                      {comment.replies.map((reply, rIdx) => {
                        const rDateStr = reply.createdAt 
                          ? new Date(reply.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Just now";

                        const isFacultyReply = reply.authorRole === "Faculty";
                        return (
                          <div key={reply.replyId || rIdx} className="flex space-x-2.5 items-start bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 shadow-2xs">
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

                  {/* Inline Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="flex items-center gap-2 mt-4 pl-4 border-l-2 border-[#E5E7EB]">
                      <CornerDownRight size={14} className="text-[#9CA3AF] shrink-0" />
                      <input
                        type="text"
                        placeholder="Write reply to student..."
                        value={replyInputs[comment.id] || ""}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-[#111827] placeholder:text-[#9CA3AF]"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!(replyInputs[comment.id] || "").trim()}
                        className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-xl text-xs font-semibold transition-colors shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FacultyComments;
