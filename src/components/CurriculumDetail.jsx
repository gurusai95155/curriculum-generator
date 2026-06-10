import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Award, 
  Layers, 
  Clock, 
  GraduationCap, 
  Tag,
  CheckCircle2,
  FolderKanban,
  ExternalLink,
  Link as LinkIcon,
  Trophy
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { exportCurriculumJSON, exportCurriculumPDF } from "../utils/curriculumExport";
import toast from "react-hot-toast";

export function CurriculumDetail({ curriculum }) {
  const { skill, level, semesters, weeklyHours, industryFocus, generatedData, publishedByName, college } = curriculum;
  const [expandedSemesters, setExpandedSemesters] = useState({ 1: true }); // Default expand semester 1

  const { userProfile } = useAuth();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [hasProgressDoc, setHasProgressDoc] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Faculty analytics states
  const [facultyStats, setFacultyStats] = useState({
    totalStudents: 0,
    startedStudents: 0,
    activeStudents: 0,
    averageMilestones: 0,
    studentsProgress: []
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const data = generatedData || {};
  const semestersList = data.semestersData || [];
  const capstone = data.capstoneProject;

  const totalCourses = semestersList.reduce((acc, sem) => acc + (sem.courses?.length || 0), 0);

  // Load progress if user is student and curriculum has an ID
  useEffect(() => {
    if (!curriculum.id || !userProfile || userProfile.role !== "Student") return;

    async function loadProgress() {
      setLoadingProgress(true);
      try {
        const docRef = doc(db, "studentProgress", `${userProfile.uid}_${curriculum.id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompletedCourses(docSnap.data().completedCourses || []);
          setHasProgressDoc(true);
        } else {
          setCompletedCourses([]);
          setHasProgressDoc(false);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
      } finally {
        setLoadingProgress(false);
      }
    }

    loadProgress();
  }, [curriculum.id, userProfile]);

  // Load analytics if user is faculty and curriculum has an ID
  useEffect(() => {
    if (!curriculum.id || !userProfile || userProfile.role !== "Faculty") return;

    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      try {
        const collegeName = userProfile.college;

        // 1. Fetch all students registered under this college
        const studentsQuery = query(
          collection(db, "users"),
          where("college", "==", collegeName),
          where("role", "==", "Student")
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentsData = studentsSnap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        // 2. Fetch studentProgress logs specifically for THIS curriculum in this college
        const progressQuery = query(
          collection(db, "studentProgress"),
          where("college", "==", collegeName),
          where("curriculumId", "==", curriculum.id)
        );
        const progressSnap = await getDocs(progressQuery);
        const progressData = progressSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Compute metrics
        const total = studentsData.length;
        const started = progressData.length; // Students who started / enrolled
        const active = progressData.filter(p => p.completedCourses?.length > 0).length;

        let avgSum = 0;
        progressData.forEach(p => {
          const completed = p.completedCourses?.length || 0;
          const totalC = p.totalCourses || 1;
          avgSum += (completed / totalC);
        });
        const avgPct = started > 0 ? Math.round((avgSum / started) * 100) : 0;

        // Combine user profile + progress
        const combined = studentsData.map(student => {
          const prog = progressData.find(p => p.studentUid === student.uid);
          return {
            uid: student.uid,
            name: student.name,
            enrolled: !!prog,
            completedCount: prog?.completedCourses?.length || 0,
            totalCount: prog?.totalCourses || totalCourses,
            updatedAt: prog?.updatedAt || null
          };
        });

        setFacultyStats({
          totalStudents: total,
          startedStudents: started,
          activeStudents: active,
          averageMilestones: avgPct,
          studentsProgress: combined
        });

      } catch (err) {
        console.error("Error loading curriculum analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, [curriculum.id, userProfile, totalCourses]);

  const handleStartCurriculum = async () => {
    if (!curriculum.id || !userProfile) return;
    try {
      await setDoc(doc(db, "studentProgress", `${userProfile.uid}_${curriculum.id}`), {
        studentUid: userProfile.uid,
        studentName: userProfile.name,
        college: userProfile.college,
        curriculumId: curriculum.id,
        curriculumTitle: skill,
        completedCourses: [],
        totalCourses: totalCourses,
        updatedAt: new Date().toISOString()
      });
      setCompletedCourses([]);
      setHasProgressDoc(true);
      toast.success("Curriculum started! You can now track your course milestones.");
    } catch (err) {
      console.error("Error starting curriculum:", err);
      toast.error("Failed to start curriculum.");
    }
  };

  const toggleCourseCompletion = async (courseCode) => {
    if (!curriculum.id || !userProfile || !hasProgressDoc) return;

    let newCompleted;
    if (completedCourses.includes(courseCode)) {
      newCompleted = completedCourses.filter(c => c !== courseCode);
    } else {
      newCompleted = [...completedCourses, courseCode];
    }

    setCompletedCourses(newCompleted);

    try {
      await setDoc(doc(db, "studentProgress", `${userProfile.uid}_${curriculum.id}`), {
        studentUid: userProfile.uid,
        studentName: userProfile.name,
        college: userProfile.college,
        curriculumId: curriculum.id,
        curriculumTitle: skill,
        completedCourses: newCompleted,
        totalCourses: totalCourses,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Progress saved!");
    } catch (err) {
      console.error("Error toggling progress:", err);
      toast.error("Failed to save progress.");
    }
  };

  const handleDownloadJSON = (e) => {
    if (e) e.stopPropagation();
    try {
      exportCurriculumJSON(curriculum);
      toast.success("JSON downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download JSON");
      console.error("JSON download error:", error);
    }
  };

  const handleDownloadPDF = (e) => {
    if (e) e.stopPropagation();
    try {
      exportCurriculumPDF(curriculum);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF export error:", error);
    }
  };

  const toggleSemester = (semNum) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semNum]: !prev[semNum]
    }));
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Faculty Student Analytics Dashboard */}
      {userProfile?.role === "Faculty" && curriculum.id && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#E5E7EB] pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#111827] flex items-center">
                <Layers className="mr-2 text-[#4F46E5]" size={18} />
                Syllabus Enrollment & Progress Analytics
              </h3>
              <p className="text-[10px] text-[#6B7280] mt-1">
                Visual metrics and tracker details for students enrolled in this curriculum.
              </p>
            </div>
            <span className="mt-2 sm:mt-0 px-2.5 py-0.5 bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {skill}
            </span>
          </div>

          {loadingAnalytics ? (
            <div className="py-10 text-center text-xs text-[#9CA3AF] italic">
              Loading analytics logs...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Enrolled Ratio Card */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Enrollment Rate</p>
                  <div className="flex justify-between items-baseline mt-2">
                    <h4 className="text-2xl font-black text-[#111827]">
                      {facultyStats.startedStudents} <span className="text-xs font-normal text-[#9CA3AF]">/ {facultyStats.totalStudents} Students</span>
                    </h4>
                    <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded">
                      {facultyStats.totalStudents > 0 ? Math.round((facultyStats.startedStudents / facultyStats.totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  {/* Progress bar representing enrollment */}
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-1.5 rounded-full transition-all"
                      style={{ width: `${facultyStats.totalStudents > 0 ? (facultyStats.startedStudents / facultyStats.totalStudents) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Average Milestone Completion Card */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Milestone Completion Average</p>
                  <div className="flex justify-between items-baseline mt-2">
                    <h4 className="text-2xl font-black text-[#111827]">
                      {facultyStats.averageMilestones}% <span className="text-xs font-normal text-[#9CA3AF]">Average</span>
                    </h4>
                    <span className="text-xs font-bold text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded">
                      Progress
                    </span>
                  </div>
                  {/* Progress bar representing milestone average */}
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-[#10B981] h-1.5 rounded-full transition-all"
                      style={{ width: `${facultyStats.averageMilestones}%` }}
                    ></div>
                  </div>
                </div>

                {/* Active Rate Card */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Active Learner Ratio</p>
                  <div className="flex justify-between items-baseline mt-2">
                    <h4 className="text-2xl font-black text-[#111827]">
                      {facultyStats.activeStudents} <span className="text-xs font-normal text-[#9CA3AF]">Active</span>
                    </h4>
                    <span className="text-xs font-bold text-[#F59E0B] bg-[#FEF3C7] px-2 py-0.5 rounded">
                      Completed &ge; 1
                    </span>
                  </div>
                  {/* Progress bar representing active ratio */}
                  <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-[#F59E0B] h-1.5 rounded-full transition-all"
                      style={{ width: `${facultyStats.startedStudents > 0 ? (facultyStats.activeStudents / facultyStats.startedStudents) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Student progress details list */}
              <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden mt-4">
                <div className="bg-[#F9FAFB] px-4 py-3 border-b border-[#E5E7EB] flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Student Progress Directory</span>
                  <span className="text-[10px] font-semibold text-[#6B7280]">Total Enrolled: {facultyStats.startedStudents}</span>
                </div>
                <div className="divide-y divide-[#E5E7EB] max-h-[300px] overflow-y-auto">
                  {facultyStats.studentsProgress.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#9CA3AF] italic">
                      No students are currently registered in your university.
                    </div>
                  ) : (
                    facultyStats.studentsProgress.map((student) => {
                      const percentage = Math.round((student.completedCount / student.totalCount) * 100);
                      const lastUpdateStr = student.updatedAt 
                        ? new Date(student.updatedAt).toLocaleDateString() 
                        : "N/A";

                      return (
                        <div key={student.uid} className="px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-[#111827] flex items-center">
                              {student.name}
                              {!student.enrolled && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-[#F3F4F6] text-[#6B7280] font-bold border border-[#E5E7EB]">
                                  Not Enrolled
                                </span>
                              )}
                              {student.enrolled && student.completedCount === student.totalCount && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-[#D1FAE5] text-[#065F46] font-bold border border-emerald-100">
                                  Completed
                                </span>
                              )}
                              {student.enrolled && student.completedCount < student.totalCount && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-[#EEF2FF] text-[#4F46E5] font-bold border border-[#E0E7FF]">
                                  In Progress
                                </span>
                              )}
                            </h5>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">Last Sync: {lastUpdateStr}</p>
                          </div>
                          
                          {student.enrolled ? (
                            <div className="flex items-center space-x-3 shrink-0">
                              <div className="w-24 bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    student.completedCount === student.totalCount ? "bg-[#10B981]" : "bg-[#4F46E5]"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-extrabold text-[#6B7280] shrink-0">
                                {student.completedCount} / {student.totalCount} ({percentage}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#9CA3AF] font-semibold shrink-0">Not Enrolled</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        {/* Soft decorative blob */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 text-indigo-200">
              <Award size={14} />
              <span>{level} Curriculum</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{skill}</h2>
            {industryFocus && (
              <p className="text-indigo-200 text-sm mt-1">
                Aligned with Focus: <span className="font-semibold text-white">{industryFocus}</span>
              </p>
            )}
          </div>
          <div className="text-left md:text-right text-indigo-200 text-sm flex flex-col items-start md:items-end gap-3 shrink-0">
            <div>
              <p>Institution: <strong className="text-white">{college || "N/A"}</strong></p>
              <p>Author: <strong className="text-white">{publishedByName || "Faculty"}</strong></p>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              {/* JSON button */}
              <button
                onClick={handleDownloadJSON}
                className="bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:brightness-110 hover:shadow flex items-center space-x-1"
                title="Download Syllabus Outline JSON"
              >
                <span>{`{ }`}</span>
                <span>JSON</span>
              </button>
              {/* PDF button */}
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:brightness-110 hover:shadow flex items-center space-x-1"
                title="Download Syllabus PDF Report"
              >
                <span className="text-xs">📄</span>
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-white">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Duration</p>
              <p className="text-lg font-bold">{semesters} Semesters</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-white">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Weekly Hours</p>
              <p className="text-lg font-bold">{weeklyHours || "N/A"} hrs</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-white">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Total Courses</p>
              <p className="text-lg font-bold">
                {totalCourses} Courses
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Format</p>
              <p className="text-lg font-bold">Outcome-Based</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Progress Tracker / Enrollment Overlay */}
      {userProfile?.role === "Student" && curriculum.id && (
        <div className="bg-teal-50 border border-teal-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          {hasProgressDoc ? (
            <>
              <div>
                <h4 className="text-sm font-bold text-teal-800">Your Learning Progress</h4>
                <p className="text-xs text-teal-600 mt-1">
                  Mark course modules as completed to update your curriculum milestones.
                </p>
              </div>
              <div className="flex items-center space-x-3.5 w-full md:w-auto shrink-0">
                <div className="w-full md:w-48 bg-teal-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${totalCourses > 0 ? (completedCourses.length / totalCourses) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-teal-800">
                  {completedCourses.length} / {totalCourses} Completed ({totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0}%)
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-extrabold text-teal-800">Ready to start this curriculum?</h4>
                <p className="text-xs text-teal-600 mt-1">
                  Enroll in this learning path to unlock milestone tracking and record completions.
                </p>
              </div>
              <button
                onClick={handleStartCurriculum}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 uppercase tracking-wider"
              >
                Start Curriculum
              </button>
            </>
          )}
        </div>
      )}

      {/* Semesters Accordion */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#111827] flex items-center">
          <BookOpen className="mr-2.5 text-[#4F46E5]" size={22} />
          Semester-wise Syllabi
        </h3>

        {semestersList.map((sem) => {
          const semNum = sem.semesterNumber;
          const isExpanded = !!expandedSemesters[semNum];
          const courses = sem.courses || [];

          return (
            <div key={semNum} className="border border-[#E5E7EB] bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              {/* Semester Header Toggle */}
              <button
                onClick={() => toggleSemester(semNum)}
                className="w-full flex justify-between items-center px-6 py-5 bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF] hover:opacity-95 transition-all duration-200 text-left"
              >
                <div>
                  <h4 className="text-lg font-bold text-[#111827] flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold rounded-full shadow-sm">
                      {semNum}
                    </span>
                    Semester {semNum}
                  </h4>
                  <p className="text-xs text-[#6B7280] font-medium ml-10">
                    {courses.length} courses proposed
                  </p>
                </div>
                <div className="p-2 rounded-full bg-white border border-[#E5E7EB] shadow-sm text-[#6B7280]">
                  <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </button>

              {/* Collapsible content */}
              {isExpanded && (
                <div className="p-6 border-t border-[#E5E7EB] space-y-6">
                  {courses.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] italic">No courses specified for this semester.</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {courses.map((course, idx) => {
                        const code = course.courseCode || `CS-${100 + semNum * 10 + idx}`;
                        const isCompleted = completedCourses.includes(code);
                        
                        return (
                          <div key={idx} className="bg-white border-l-4 border-[#4F46E5] border border-y-[#E5E7EB] border-r-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                            <div>
                              {/* Course Header */}
                              <div className="flex justify-between items-start mb-3 gap-2">
                                <span className="text-xs font-mono font-bold bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded">
                                  {code}
                                </span>
                                <div className="flex space-x-2 text-xs font-medium">
                                  <span className="bg-[#D1FAE5] text-[#065F46] px-2 py-0.5 rounded-full font-bold">{course.credits} Credits</span>
                                  <span className="text-[#9CA3AF]">•</span>
                                  <span className="text-[#6B7280]">{course.weeklyHours} Hrs/Wk</span>
                                </div>
                              </div>
                              <h5 className="font-bold text-[#111827] text-base mb-2">
                                {course.courseName}
                              </h5>
                              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                                {course.description}
                              </p>

                              {/* Topics */}
                              {course.topics && course.topics.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-xs font-semibold text-[#9CA3AF] flex items-center mb-2">
                                    <Tag size={12} className="mr-1" /> Key Topics
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {course.topics.map((topic, tIdx) => (
                                      <span key={tIdx} className="text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full shadow-2xs">
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              {/* Learning Outcomes */}
                              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                <div className="pt-3 border-t border-[#F3F4F6]">
                                  <span className="text-xs font-semibold text-[#9CA3AF] flex items-center mb-2">
                                    <CheckCircle2 size={12} className="mr-1 text-[#4F46E5]" /> Learning Outcomes
                                  </span>
                                  <ul className="space-y-1">
                                    {course.learningOutcomes.map((outcome, oIdx) => (
                                      <li key={oIdx} className="text-xs text-[#6B7280] flex items-start">
                                        <span className="mr-1.5 text-[#10B981] font-bold">✓</span>
                                        <span className="line-clamp-2">{outcome}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Learning Resources */}
                              {course.learningResources && course.learningResources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
                                  <span className="text-xs font-semibold text-[#9CA3AF] flex items-center mb-2">
                                    <LinkIcon size={12} className="mr-1 text-[#06B6D4]" /> Study Resources
                                  </span>
                                  <div className="space-y-1.5">
                                    {course.learningResources.map((res, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-[#006064] hover:text-[#004d40] flex items-center hover:underline bg-[#E0F7FA] p-2 rounded-xl border border-[#B2EBF2] transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="bg-[#B2EBF2] text-[#006064] text-[9px] px-1.5 py-0.5 rounded font-black mr-2 uppercase tracking-wide">
                                          {res.type || "Link"}
                                        </span>
                                        <span className="truncate flex-1">{res.title}</span>
                                        <ExternalLink size={10} className="ml-1 opacity-70 shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Student Course Completion Button */}
                              {userProfile?.role === "Student" && curriculum.id && (
                                <button
                                  disabled={!hasProgressDoc}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCourseCompletion(code);
                                  }}
                                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-1.5 ${
                                    !hasProgressDoc
                                      ? "bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed"
                                      : isCompleted 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50" 
                                        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-slate-50/85"
                                  }`}
                                >
                                  <CheckCircle2 size={13} className={isCompleted ? "text-emerald-600" : "text-[#9CA3AF]"} />
                                  <span>
                                    {!hasProgressDoc 
                                      ? "Enroll to track completion" 
                                      : isCompleted 
                                        ? "Course Completed" 
                                        : "Mark as Completed"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Capstone Project Section */}
      {capstone && (
        <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border-l-4 border-[#10B981] border border-y-[#E5E7EB] border-r-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-2 bg-emerald-100 w-fit px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 text-[#065F46]">
            <Trophy size={14} className="text-[#10B981]" />
            <span>🏆 Capstone Project Blueprint</span>
          </div>
          <h4 className="text-lg md:text-xl font-bold text-[#111827] mb-2">
            {capstone.title || "Capstone Project"}
          </h4>
          <p className="text-sm text-[#374151] leading-relaxed mb-6">
            {capstone.description}
          </p>

          {capstone.deliverables && capstone.deliverables.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-[#065F46] uppercase tracking-wider mb-3">Key Deliverables</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {capstone.deliverables.map((deliv, dIdx) => (
                  <div key={dIdx} className="flex items-start bg-white border border-[#E5E7EB] p-3.5 rounded-xl shadow-2xs">
                    <CheckCircle2 size={16} className="text-[#10B981] mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-xs text-[#374151] font-medium">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CurriculumDetail;

