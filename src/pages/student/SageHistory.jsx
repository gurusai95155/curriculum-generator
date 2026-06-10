import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trash2, ArrowRight, Layers, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export function SageHistory() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, "sageHistory"),
      where("studentUid", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setConversations(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sage history:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  const handleResumeChat = (id) => {
    navigate(`/student/sage?chat=${id}`);
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation(); // Prevent clicking row
    if (!window.confirm("Are you sure you want to delete this conversation history?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "sageHistory", id));
      toast.success("Conversation deleted.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
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
        <h2 className="text-2xl font-bold text-[#111827] flex items-center">
          <Sparkles className="mr-2 text-[#06B6D4]" size={24} />
          Sage Consultation History
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Review, resume, or clean up your previous study roadmaps and chatbot conversations.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <MessageSquare size={40} className="mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm font-semibold text-[#6B7280]">No chats recorded</p>
          <p className="text-xs text-[#9CA3AF] mt-1 mb-5">You haven't requested any custom roadmaps from Sage yet.</p>
          <button
            onClick={() => navigate("/student/sage")}
            className="bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-95 shadow-md transition-all"
          >
            Start First Chat
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[11px] font-semibold tracking-wide border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Topic / User Query</th>
                  <th className="px-6 py-4">Syllabus Contexts</th>
                  <th className="px-6 py-4">Messages Count</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {conversations.map((chat, index) => {
                  const dateStr = chat.updatedAt 
                    ? new Date(chat.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "N/A";

                  return (
                    <tr 
                      key={chat.id}
                      onClick={() => handleResumeChat(chat.id)}
                      className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ${
                        index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-[#111827] text-xs truncate max-w-[250px]">
                        {chat.title || "Study Roadmap"}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6B7280]">
                        <span className="inline-flex items-center bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded text-[10px]">
                          <Layers size={10} className="mr-1 text-[#9CA3AF]" />
                          {chat.contextCurriculumIds?.length || 0} Core Contexts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">
                        {chat.messages?.length || 0} turns
                      </td>
                      <td className="px-6 py-4 text-xs text-[#9CA3AF] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeChat(chat.id);
                            }}
                            className="p-2 bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#DBEAFE] rounded-lg transition-colors shadow-2xs"
                            title="Resume Discussion"
                          >
                            <ArrowRight size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-2 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors shadow-2xs"
                            title="Delete History"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default SageHistory;
