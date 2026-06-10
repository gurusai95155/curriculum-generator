import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Eye, User, ArrowRight, BookOpen } from "lucide-react";

export function ViewHistory() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, "viewHistory"),
      where("studentUid", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.viewedAt || 0) - new Date(a.viewedAt || 0));
      setHistory(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching view history:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  const handleReopen = (curriculumId) => {
    navigate(`/student/browse?view=${curriculumId}`);
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
          <Eye className="mr-2 text-[#06B6D4]" size={24} />
          Syllabus View History
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Keep track of curricula you've examined within your institution.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <Eye size={40} className="mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm font-semibold text-[#6B7280]">No history found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Your viewed curriculum documents will be registered here.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[11px] font-semibold tracking-wide border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Curriculum / Skill</th>
                  <th className="px-6 py-4">Faculty Author</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Viewed At</th>
                  <th className="px-6 py-4 text-right">Reopen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {history.map((item, index) => {
                  const dateStr = item.viewedAt 
                    ? new Date(item.viewedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A";

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => handleReopen(item.curriculumId)}
                      className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ${
                        index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-[#111827] text-xs truncate max-w-[200px]">
                        <span className="flex items-center">
                          <BookOpen size={13} className="mr-1.5 text-[#9CA3AF] shrink-0" />
                          {item.curriculumTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6B7280]">
                        <span className="flex items-center">
                          <User size={12} className="mr-1 text-[#9CA3AF] shrink-0" />
                          {item.facultyName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6B7280] font-medium">
                        {item.college}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#9CA3AF] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReopen(item.curriculumId);
                            }}
                            className="p-2 bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#DBEAFE] rounded-lg transition-colors shadow-2xs"
                            title="Reopen Syllabus"
                          >
                            <ArrowRight size={16} />
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

export default ViewHistory;

