import React from "react";
import { Calendar, User, Clock, BookOpen } from "lucide-react";

export function CurriculumCard({ curriculum, onClick, showStatus = false }) {
  const { skill, level, semesters, weeklyHours, publishedByName, status, createdAt } = curriculum;

  const dateFormatted = createdAt 
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "N/A";

  const getStatusBadge = () => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full"></span>
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full"></span>
        Draft
      </span>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-1 hover:shadow-lg transition-all duration-250 cursor-pointer flex flex-col justify-between group"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"></div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center mt-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-[#4F46E5]">
            {level}
          </span>
          {showStatus && getStatusBadge()}
        </div>

        <h3 className="text-[17px] font-bold text-[#111827] line-clamp-2">
          {skill}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
            {semesters} Semesters
          </span>
          {weeklyHours && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              <Clock size={12} className="mr-1 text-slate-500" />
              {weeklyHours} hrs/wk
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
          <div className="flex items-center text-[13px] text-[#6B7280]">
            <User size={13} className="mr-1.5 text-[#9CA3AF]" />
            <span className="truncate">{publishedByName || "Faculty Member"}</span>
          </div>
          <div className="flex items-center text-[12px] text-[#9CA3AF]">
            <Calendar size={13} className="mr-1.5" />
            <span>{dateFormatted}</span>
          </div>
        </div>
      </div>

      <button className="w-full text-center py-2.5 mt-4 border border-[#4F46E5] text-[#4F46E5] rounded-xl text-xs font-bold transition-all duration-200 group-hover:bg-gradient-to-r group-hover:from-[#4F46E5] group-hover:to-[#7C3AED] group-hover:text-white group-hover:border-transparent">
        View Curriculum &rarr;
      </button>
    </div>
  );
}

export default CurriculumCard;

