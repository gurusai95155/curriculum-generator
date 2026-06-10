import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { CurriculumDetail } from "../../components/CurriculumDetail";
import { Search, X, Eye, FileText } from "lucide-react";

export function GenerationHistory() {
  const { userProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal view state
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!userProfile) return;

    async function fetchHistory() {
      try {
        const q = query(
          collection(db, "generationHistory"),
          where("facultyUid", "==", userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setHistory(list);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userProfile]);

  // Client side filtering
  const filteredHistory = history.filter((item) => {
    const inputs = item.inputs || {};
    const skill = inputs.skill || "";
    const level = inputs.level || "";
    const date = item.createdAt ? new Date(item.createdAt) : null;

    // Search term check
    const matchesSearch = skill.toLowerCase().includes(searchTerm.toLowerCase());

    // Level check
    const matchesLevel = levelFilter === "" || level === levelFilter;

    // Date range check
    let matchesDate = true;
    if (date) {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (date < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesLevel && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">Generation History</h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Full audit log of all curriculum attempts generated using the LLaMA 3.3 model.
        </p>
      </div>

      {/* Filter and Search Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search by skill */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-[#9CA3AF]" size={16} />
            <input
              type="text"
              placeholder="Search by skill name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all font-medium"
            />
          </div>

          {/* Filter by Level */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] font-medium transition-all"
            >
              <option value="">All Levels</option>
              <option value="Diploma">Diploma</option>
              <option value="BTech">BTech</option>
              <option value="Master's">Master's</option>
              <option value="Certification">Certification</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] font-medium transition-all"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] font-medium transition-all"
            />
          </div>

        </div>
      </div>

      {/* History table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <FileText size={40} className="mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm font-semibold text-[#6B7280]">No attempts found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Try clearing your filters or changing search keywords.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[11px] font-semibold tracking-wide border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Skill</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Semesters</th>
                  <th className="px-6 py-4">Industry Focus</th>
                  <th className="px-6 py-4">Generated At</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredHistory.map((item, index) => {
                  const dateStr = item.createdAt 
                    ? new Date(item.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A";

                  const inputs = item.inputs || {};

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ${
                        index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-[#111827] text-xs truncate max-w-[200px]">
                        {inputs.skill}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#6B7280]">
                        {inputs.level}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">
                        {inputs.semesters} Semesters
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6B7280]">
                        {inputs.industryFocus || "General"}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#9CA3AF] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="p-2 bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] rounded-lg transition-colors shadow-2xs"
                          >
                            <Eye size={16} />
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

      {/* Modal Dialog for View Curriculum detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden fade-in-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
              <div>
                <h3 className="font-bold text-[#111827] text-sm">Generated Log Details</h3>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">Attempt ID: {selectedItem.id}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-100 text-[#6B7280] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <CurriculumDetail 
                curriculum={{
                  skill: selectedItem.inputs?.skill,
                  level: selectedItem.inputs?.level,
                  semesters: selectedItem.inputs?.semesters,
                  weeklyHours: selectedItem.inputs?.weeklyHours,
                  industryFocus: selectedItem.inputs?.industryFocus || "General",
                  generatedData: selectedItem.generatedData,
                  publishedByName: userProfile.name,
                  college: userProfile.college
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] text-right">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default GenerationHistory;
