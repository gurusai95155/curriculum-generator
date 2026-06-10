import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCurriculum } from "../../utils/groqApi";
import { useAuth } from "../../hooks/useAuth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { CurriculumDetail } from "../../components/CurriculumDetail";
import { Sparkles, Save, Send, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function GenerateCurriculum() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    skill: "",
    level: "BTech", // Default
    semesters: "4", // Default
    weeklyHours: "",
    industryFocus: ""
  });

  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.skill.trim()) {
      toast.error("Please enter a target skill.");
      return;
    }

    setGenerating(true);
    setGeneratedResult(null);

    try {
      const result = await generateCurriculum({
        skill: formData.skill.trim(),
        level: formData.level,
        semesters: parseInt(formData.semesters, 10),
        weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours, 10) : null,
        industryFocus: formData.industryFocus.trim() || null
      });

      setGeneratedResult(result);
      toast.success("Curriculum generated successfully!");

      // Save to generationHistory Firestore collection in real-time
      if (userProfile) {
        await addDoc(collection(db, "generationHistory"), {
          facultyUid: userProfile.uid,
          college: userProfile.college,
          inputs: {
            skill: formData.skill.trim(),
            level: formData.level,
            semesters: parseInt(formData.semesters, 10),
            weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours, 10) : null,
            industryFocus: formData.industryFocus.trim() || null
          },
          generatedData: result,
          status: "generated",
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate curriculum. Check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToFirestore = async (status) => {
    if (!generatedResult || !userProfile) return;
    setSaving(true);

    try {
      const docData = {
        skill: formData.skill.trim(),
        level: formData.level,
        semesters: parseInt(formData.semesters, 10),
        weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours, 10) : null,
        industryFocus: formData.industryFocus.trim() || "General",
        generatedData: generatedResult,
        publishedBy: userProfile.uid,
        publishedByName: userProfile.name,
        college: userProfile.college,
        status, // 'draft' or 'published'
        createdAt: new Date().toISOString(),
        publishedAt: status === "published" ? new Date().toISOString() : null
      };

      await addDoc(collection(db, "curricula"), docData);
      toast.success(status === "published" ? "Curriculum published to college!" : "Saved as draft successfully.");
      navigate("/faculty/my-curricula");
    } catch (error) {
      console.error("Error saving curriculum:", error);
      toast.error("Failed to save curriculum to database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 fade-in-up max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold flex items-center bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
          <Sparkles className="mr-2 text-[#4F46E5] animate-pulse" size={24} />
          ✨ Generate Curriculum
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Specify target requirements to draft a multi-semester syllabus using Groq LLaMA 3.3.
        </p>
      </div>

      {/* Generation Form */}
      {!generatedResult && (
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(79,70,229,0.08)] p-[32px] border border-[#E5E7EB] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skill */}
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Target Skill or Discipline</label>
              <input
                type="text"
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                disabled={generating}
                placeholder="e.g. Cloud Native Engineering, DevOps, Cybersecurity, UI/UX Design"
                className="w-full px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all font-medium disabled:opacity-60"
                required
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Education Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={generating}
                className="w-full px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] transition-all font-medium disabled:opacity-60"
              >
                <option value="Diploma">Diploma</option>
                <option value="BTech">Bachelor's Degree (BTech/BSc)</option>
                <option value="Master's">Master's Degree (MTech/MSc)</option>
                <option value="Certification">Professional Certification</option>
              </select>
            </div>

            {/* Semesters */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Duration (Semesters)</label>
              <select
                name="semesters"
                value={formData.semesters}
                onChange={handleChange}
                disabled={generating}
                className="w-full px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] transition-all font-medium disabled:opacity-60"
              >
                <option value="2">2 Semesters</option>
                <option value="4">4 Semesters</option>
                <option value="6">6 Semesters</option>
                <option value="8">8 Semesters</option>
              </select>
            </div>

            {/* Weekly Hours (Optional) */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Weekly Workload (Hours) - Optional</label>
              <input
                type="number"
                name="weeklyHours"
                value={formData.weeklyHours}
                onChange={handleChange}
                disabled={generating}
                placeholder="e.g. 15, 20"
                min="1"
                className="w-full px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all font-medium disabled:opacity-60"
              />
            </div>

            {/* Industry Focus (Optional) */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Industry Focus Area - Optional</label>
              <input
                type="text"
                name="industryFocus"
                value={formData.industryFocus}
                onChange={handleChange}
                disabled={generating}
                placeholder="e.g. Fintech, Healthcare IT, E-commerce"
                className="w-full px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all font-medium disabled:opacity-60"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={generating}
            className={`w-full py-4 text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              generating 
                ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] skeleton opacity-90 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 hover:shadow-xl shadow-indigo-600/15"
            }`}
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>🔄 Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Syllabus blueprint</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Generated Result View & Save Action */}
      {generatedResult && (
        <div className="space-y-6">
          {/* Action Header bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
            <div className="flex items-center text-xs text-amber-600 font-bold bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-100/50">
              <AlertTriangle size={15} className="mr-2 shrink-0 animate-bounce" />
              <span>Syllabus successfully draft. Choose saving action below.</span>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setGeneratedResult(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#6B7280] text-xs font-bold rounded-xl transition-all"
              >
                Reset Form
              </button>
              
              <button
                onClick={() => handleSaveToFirestore("draft")}
                disabled={saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/10 transition-all"
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => handleSaveToFirestore("published")}
                disabled={saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all"
              >
                <Send size={14} />
                <span>Publish to College</span>
              </button>
            </div>
          </div>

          {/* Render detail accordion */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
            <CurriculumDetail 
              curriculum={{
                skill: formData.skill.trim(),
                level: formData.level,
                semesters: parseInt(formData.semesters, 10),
                weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours, 10) : null,
                industryFocus: formData.industryFocus.trim() || "General",
                generatedData: generatedResult,
                publishedByName: userProfile.name,
                college: userProfile.college
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default GenerateCurriculum;

