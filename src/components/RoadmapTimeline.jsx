import React from "react";
import { 
  Calendar, 
  GitMerge, 
  Info, 
  Lightbulb, 
  Sparkles 
} from "lucide-react";

export function RoadmapTimeline({ roadmap }) {
  if (!roadmap) return null;

  const { 
    roadmapTitle, 
    overview, 
    weeklyPlan = [], 
    integrationPoints = [], 
    estimatedDuration, 
    tips = [] 
  } = roadmap;

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center space-x-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles size={14} className="animate-spin-slow" />
          <span>Custom Study Roadmap</span>
        </div>
        <h3 className="text-xl md:text-2xl font-black">{roadmapTitle}</h3>
        <p className="text-indigo-50 mt-2 text-sm leading-relaxed max-w-3xl">{overview}</p>
        
        <div className="flex items-center mt-6 pt-4 border-t border-white/10 text-xs font-bold bg-white/5 w-fit px-4 py-2 rounded-xl">
          <Calendar size={14} className="mr-2 text-indigo-200" />
          <span>Estimated Duration: <span className="text-white bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] px-2.5 py-1 rounded-full ml-1.5 shadow-sm">{estimatedDuration}</span></span>
        </div>
      </div>

      {/* Grid: Timeline and Sidebar details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Timeline */}
        <div className="xl:col-span-2 space-y-6">
          <h4 className="text-lg font-bold text-[#111827] flex items-center mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3B82F6] mr-2.5 text-sm font-bold">1</span>
            Weekly Roadmap Plan
          </h4>

          {/* Timeline Wrapper */}
          <div className="relative border-l-2 border-dashed border-[#4F46E5] ml-5 pl-8 space-y-8">
            {weeklyPlan.map((plan, index) => (
              <div key={index} className="relative group">
                
                {/* Timeline node dot (gradient circle with week index number) */}
                <div className="absolute -left-[49px] top-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs border-4 border-white shadow-md z-10 transition-transform duration-200 group-hover:scale-110">
                  {index + 1}
                </div>

                {/* Week Card */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md hover:border-[#06B6D4] transition-all duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-[#E0F7FA] text-[#006064] border border-[#B2EBF2]">
                      {plan.week}
                    </span>
                  </div>
                  <h5 className="font-bold text-[#111827] text-sm mb-3">
                    Focus: {plan.focus}
                  </h5>

                  {/* Tasks */}
                  {plan.tasks && plan.tasks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Milestones & Tasks</p>
                      <ul className="space-y-2">
                        {plan.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start text-xs text-[#374151]">
                            <input 
                              type="checkbox" 
                              checked 
                              disabled 
                              className="rounded text-[#06B6D4] focus:ring-[#06B6D4] h-3.5 w-3.5 mr-2.5 mt-0.5 accent-[#06B6D4] cursor-not-allowed shrink-0" 
                            />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resources */}
                  {plan.resources && plan.resources.length > 0 && (
                    <div className="pt-3 border-t border-[#E5E7EB]">
                      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Recommended Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.resources.map((resource, rIdx) => (
                          <div key={rIdx} className="flex items-center text-xs font-semibold text-[#4F46E5] hover:text-[#7C3AED] hover:underline cursor-pointer bg-[#EEF2FF] border border-[#E0E7FF] px-2.5 py-1 rounded-lg transition-colors">
                            <Info size={11} className="mr-1.5 text-[#4F46E5] shrink-0" />
                            <span>{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar (Integration & Tips) */}
        <div className="space-y-6">
          {/* Curriculum Integration Box */}
          {integrationPoints && integrationPoints.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#006064] flex items-center mb-4 uppercase tracking-wider">
                <GitMerge size={16} className="mr-2 text-[#06B6D4]" />
                Integration Points
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                How this extra roadmap integrates with your current college curriculum courses:
              </p>
              <div className="space-y-3">
                {integrationPoints.map((ip, index) => (
                  <div key={index} className="bg-[#E0F7FA] border border-[#B2EBF2] rounded-2xl p-4 space-y-1.5 hover:shadow-xs transition-shadow">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                        Sem {ip.semesterNumber}
                      </span>
                      <span className="text-xs font-bold text-[#111827] truncate max-w-[150px]">
                        {ip.courseName}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed italic">
                      &ldquo;{ip.connection}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Tips Box */}
          {tips && tips.length > 0 && (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#F59E0B] flex items-center mb-4 uppercase tracking-wider">
                <Lightbulb size={16} className="mr-2 text-[#F59E0B]" />
                Study Guidance & Tips
              </h4>
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-xs text-[#78350F] font-medium">
                    <span className="mr-2 text-[#F59E0B] font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoadmapTimeline;
