import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { CurriculumDetail } from "../../components/CurriculumDetail";
import { Eye, Send, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export function MyCurricula() {
  const { userProfile } = useAuth();
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null); // stores curriculum ID of expanded row

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, "curricula"),
      where("publishedBy", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setCurricula(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching curricula:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handlePublish = async (id, e) => {
    e.stopPropagation(); // prevent expanding the row
    try {
      const docRef = doc(db, "curricula", id);
      await updateDoc(docRef, {
        status: "published",
        publishedAt: new Date().toISOString()
      });
      toast.success("Curriculum published successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish curriculum.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // prevent expanding
    if (!window.confirm("Are you sure you want to delete this curriculum? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "curricula", id));
      toast.success("Curriculum deleted.");
      if (expandedRow === id) {
        setExpandedRow(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete curriculum.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
        <div>
          <div className="h-8 w-48 bg-[#E5E7EB] rounded-lg skeleton mb-2"></div>
          <div className="h-4 w-72 bg-[#E5E7EB] rounded-lg skeleton"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[11px] font-semibold tracking-wide border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Skill</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Semesters</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {[1, 2, 3].map((n, idx) => (
                  <tr key={n} className={idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 bg-[#E5E7EB] rounded skeleton"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-16 bg-[#E5E7EB] rounded skeleton"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-12 bg-[#E5E7EB] rounded skeleton"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-5 w-20 bg-[#E5E7EB] rounded-full skeleton"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 bg-[#E5E7EB] rounded skeleton"></div>
                    </td>
                    <td className="px-6 py-5 text-right flex justify-end items-center space-x-2">
                      <div className="h-8 w-12 bg-[#E5E7EB] rounded-lg skeleton"></div>
                      <div className="h-8 w-14 bg-[#E5E7EB] rounded-lg skeleton"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">My Curricula</h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Review, publish, or delete the syllabus templates you have created.
        </p>
      </div>

      {curricula.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <AlertCircle size={40} className="mx-auto text-[#9CA3AF] mb-3" />
          <p className="text-sm font-semibold text-[#6B7280]">No curricula found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">You haven't generated any curricula drafts yet.</p>
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {curricula.map((curric, index) => {
                  const isExpanded = expandedRow === curric.id;
                  const formattedDate = new Date(curric.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <React.Fragment key={curric.id}>
                      {/* Standard Table Row */}
                      <tr 
                        onClick={() => toggleRow(curric.id)}
                        className={`hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ${
                          index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                        } ${isExpanded ? "bg-[#EEF2FF]/40" : ""}`}
                      >
                        <td className="px-6 py-4 font-bold text-[#111827] text-xs truncate max-w-[200px]">
                          {curric.skill}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#6B7280]">
                          {curric.level}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">
                          {curric.semesters} Sems
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            curric.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                              curric.status === "published" ? "bg-[#10B981]" : "bg-[#F59E0B]"
                            }`}></span>
                            {curric.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#9CA3AF]">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle view details */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(curric.id);
                              }}
                              className="p-2 bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] rounded-lg transition-colors"
                              title="Toggle Details"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>

                            {/* Publish button (only if draft) */}
                            {curric.status === "draft" && (
                              <button
                                onClick={(e) => handlePublish(curric.id, e)}
                                className="p-2 bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0] rounded-lg transition-colors"
                                title="Publish to College"
                              >
                                <Send size={16} />
                              </button>
                            )}

                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDelete(curric.id, e)}
                              className="p-2 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                              title="Delete Outline"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-8 py-6 bg-[#FAFAFA] border-t border-b border-[#E5E7EB]">
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm max-w-5xl mx-auto">
                              <CurriculumDetail curriculum={curric} />
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

export default MyCurricula;
