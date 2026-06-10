import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, onSnapshot, addDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { CurriculumCard } from "../../components/CurriculumCard";
import { CurriculumDetail } from "../../components/CurriculumDetail";
import { CommentSection } from "../../components/CommentSection";
import { exportCurriculumJSON, exportCurriculumPDF } from "../../utils/curriculumExport";
import { Search, ArrowLeft, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export function BrowseCurricula() {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [semestersFilter, setSemestersFilter] = useState("");

  // Detail view state
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  // Read URL query parameters to auto-expand a curriculum
  const viewId = searchParams.get("view");

  useEffect(() => {
    if (!userProfile?.college) return;

    // Fetch published curricula for this college
    const q = query(
      collection(db, "curricula"),
      where("college", "==", userProfile.college),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setCurricula(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching published curricula:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile?.college]);

  // Handle URL query trigger for detailed viewing
  useEffect(() => {
    if (viewId && curricula.length > 0) {
      const found = curricula.find(c => c.id === viewId);
      if (found) {
        handleViewCurriculum(found);
      }
    }
  }, [viewId, curricula]);

  const handleViewCurriculum = async (curriculum) => {
    setSelectedCurriculum(curriculum);
    setSearchParams({ view: curriculum.id });

    // Save to viewHistory Firestore collection (preventing duplicates)
    if (userProfile) {
      try {
        const q = query(
          collection(db, "viewHistory"),
          where("studentUid", "==", userProfile.uid),
          where("curriculumId", "==", curriculum.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const existingDoc = snap.docs[0];
          await updateDoc(doc(db, "viewHistory", existingDoc.id), {
            viewedAt: new Date().toISOString()
          });
        } else {
          await addDoc(collection(db, "viewHistory"), {
            studentUid: userProfile.uid,
            curriculumId: curriculum.id,
            curriculumTitle: curriculum.skill,
            facultyName: curriculum.publishedByName || "Faculty Member",
            college: userProfile.college,
            viewedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error writing to viewHistory:", err);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedCurriculum(null);
    setSearchParams({});
  };

  const handleDownloadJSON = (curriculum) => {
    try {
      exportCurriculumJSON(curriculum);
      toast.success("JSON downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download JSON");
      console.error("JSON download error:", error);
    }
  };

  const handleDownloadPDF = (curriculum) => {
    try {
      exportCurriculumPDF(curriculum);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF export error:", error);
    }
  };

  // Client side filtering
  const filteredCurricula = curricula.filter(c => {
    const skill = c.skill || "";
    const level = c.level || "";
    const semesters = String(c.semesters);

    const matchesSearch = skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "" || level === levelFilter;
    const matchesSemesters = semestersFilter === "" || semesters === semestersFilter;

    return matchesSearch && matchesLevel && matchesSemesters;
  });

  if (loading) {
    return (
      <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
        <div>
          <div className="h-8 w-48 bg-[#E5E7EB] rounded-lg skeleton mb-2"></div>
          <div className="h-4 w-72 bg-[#E5E7EB] rounded-lg skeleton"></div>
        </div>

        {/* Filters Bar Skeleton */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-10 bg-[#E5E7EB] rounded-xl skeleton"></div>
            <div className="h-10 bg-[#E5E7EB] rounded-xl skeleton"></div>
            <div className="h-10 bg-[#E5E7EB] rounded-xl skeleton"></div>
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] flex flex-col gap-4 relative overflow-hidden">
              {/* Top accent bar shim */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] skeleton"></div>
              
              <div className="flex justify-between items-start mt-2">
                {/* Level badge and semesters badge */}
                <div className="h-5 w-20 bg-[#E5E7EB] rounded-full skeleton"></div>
                <div className="h-5 w-24 bg-[#E5E7EB] rounded-full skeleton"></div>
              </div>

              {/* Title & info shims */}
              <div className="space-y-2.5">
                <div className="h-6 w-3/4 bg-[#E5E7EB] rounded-lg skeleton"></div>
                <div className="h-4 w-1/2 bg-[#E5E7EB] rounded-lg skeleton"></div>
              </div>

              {/* Footer row shims */}
              <div className="border-t border-[#E5E7EB] pt-4 mt-2 flex justify-between items-center">
                <div className="h-4 w-28 bg-[#E5E7EB] rounded skeleton"></div>
                <div className="h-3 w-16 bg-[#E5E7EB] rounded skeleton"></div>
              </div>

              {/* Button shim */}
              <div className="h-9 w-full bg-[#E5E7EB] rounded-xl skeleton mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      
      {/* If looking at curriculum details */}
      {selectedCurriculum ? (
        <div className="space-y-6">
          {/* Back Action & Export options */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-[#E5E7EB] p-4 rounded-2xl gap-4 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100 text-[#6B7280] text-xs font-bold rounded-xl transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Browse</span>
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Export JSON */}
              <button
                onClick={() => handleDownloadJSON(selectedCurriculum)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-[#1E1B4B] to-[#312E81] hover:brightness-110 hover:shadow-md text-white text-xs font-bold rounded-xl transition-all duration-200"
              >
                <span>{`{ }`}</span>
                <span>Download JSON</span>
              </button>

              {/* Export PDF */}
              <button
                onClick={() => handleDownloadPDF(selectedCurriculum)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:brightness-110 hover:shadow-md text-white text-xs font-bold rounded-xl transition-all duration-200"
              >
                <span className="text-xs">📄</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Details render */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
            <CurriculumDetail curriculum={selectedCurriculum} />
          </div>

          {/* Comments section */}
          <CommentSection 
            curriculumId={selectedCurriculum.id}
            curriculumTitle={selectedCurriculum.skill}
          />
        </div>
      ) : (
        /* If looking at curriculum lists */
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Browse Curricula</h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Explore syllabus templates created and approved by your faculty at <span className="font-semibold text-[#111827]">{userProfile.college}</span>.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Skill search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-[#9CA3AF]" size={16} />
                <input
                  type="text"
                  placeholder="Search skills (e.g. React)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] text-[#111827] placeholder:text-[#9CA3AF] transition-all font-medium"
                />
              </div>

              {/* Filter by Level */}
              <div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] text-[#111827] font-medium transition-all"
                >
                  <option value="">All Education Levels</option>
                  <option value="Diploma">Diploma</option>
                  <option value="BTech">BTech</option>
                  <option value="Master's">Master's</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>

              {/* Filter by Semesters */}
              <div>
                <select
                  value={semestersFilter}
                  onChange={(e) => setSemestersFilter(e.target.value)}
                  className="w-full px-3 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] text-[#111827] font-medium transition-all"
                >
                  <option value="">All Durations</option>
                  <option value="2">2 Semesters</option>
                  <option value="4">4 Semesters</option>
                  <option value="6">6 Semesters</option>
                  <option value="8">8 Semesters</option>
                </select>
              </div>

            </div>
          </div>

          {/* Curricula Cards Grid */}
          {filteredCurricula.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
              <AlertCircle size={40} className="mx-auto text-[#9CA3AF] mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-[#6B7280]">No published curricula found</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Try resetting search keywords or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCurricula.map((curr) => (
                <CurriculumCard
                  key={curr.id}
                  curriculum={curr}
                  onClick={() => handleViewCurriculum(curr)}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default BrowseCurricula;
