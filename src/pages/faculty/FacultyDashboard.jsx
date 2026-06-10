import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { BookOpen, Sparkles, MessageSquare, History, Award, CheckCircle, FileText, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function FacultyDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalGenerated: 0,
    totalPublished: 0,
    totalComments: 0
  });
  const [recentCurricula, setRecentCurricula] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    async function fetchDashboardData() {
      try {
        const uid = userProfile.uid;
        const collegeName = userProfile.college;

        // 1. Fetch Total Generated from generationHistory
        const genQuery = query(collection(db, "generationHistory"), where("facultyUid", "==", uid));
        const genSnap = await getDocs(genQuery);
        const totalGeneratedVal = genSnap.size;

        // 2. Fetch Total Published from curricula
        const pubQuery = query(
          collection(db, "curricula"),
          where("publishedBy", "==", uid),
          where("status", "==", "published")
        );
        const pubSnap = await getDocs(pubQuery);
        const totalPublishedVal = pubSnap.size;

        // 3. Fetch Comments received
        const curricQuery = query(collection(db, "curricula"), where("publishedBy", "==", uid));
        const curricSnap = await getDocs(curricQuery);
        const facultyCurriculumIds = curricSnap.docs.map(doc => doc.id);

        let totalCommentsVal = 0;
        if (facultyCurriculumIds.length > 0) {
          const commentsQuery = query(collection(db, "comments"), where("college", "==", collegeName));
          const commentsSnap = await getDocs(commentsQuery);
          
          commentsSnap.forEach(doc => {
            const comment = doc.data();
            if (facultyCurriculumIds.includes(comment.curriculumId)) {
              totalCommentsVal++;
            }
          });
        }

        setStats({
          totalGenerated: totalGeneratedVal,
          totalPublished: totalPublishedVal,
          totalComments: totalCommentsVal
        });

        // 4. Fetch Recent Curricula (max 3) - sorted client side to prevent compound index errors
        const recentQuery = query(
          collection(db, "curricula"),
          where("publishedBy", "==", uid)
        );
        const recentSnap = await getDocs(recentQuery);
        const recentList = recentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
        setRecentCurricula(recentList);

        // 5. Fetch all students registered under this college
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

        // 6. Fetch all progress documents under this college
        const progressQuery = query(
          collection(db, "studentProgress"),
          where("college", "==", collegeName)
        );
        const progressSnap = await getDocs(progressQuery);
        const progressData = progressSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group progress records by student
        const mappedStudents = studentsData.map(student => {
          const studentProgress = progressData.filter(p => p.studentUid === student.uid);
          return {
            ...student,
            progress: studentProgress
          };
        });

        setStudentsList(mappedStudents);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up max-w-6xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E5E7EB] rounded-3xl shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
        <div>
          <span className="inline-flex px-3 py-1 bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Faculty Workspace
          </span>
          <h2 className="text-2xl font-bold text-[#111827]">Welcome, {userProfile.name}</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Create educational syllabus blueprints for your organization at <span className="font-semibold text-[#111827]">{userProfile.college}</span>.
          </p>
        </div>
        <Link 
          to="/faculty/generate"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-md transition-all duration-200"
        >
          <Sparkles size={14} />
          <span>New Curriculum</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Generated Card - Card 1 combo (indigo tint) */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-2xl text-[#4F46E5] transition-transform duration-200 group-hover:scale-105">
            <History size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Total Generated</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.totalGenerated}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">AI attempts recorded</p>
          </div>
        </div>

        {/* Total Published Card - Card 2 combo (green tint) */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-2xl text-[#10B981] transition-transform duration-200 group-hover:scale-105">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Total Published</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.totalPublished}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Shared with college</p>
          </div>
        </div>

        {/* Comments Received Card - Card 3 combo (orange tint) */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] rounded-2xl text-[#F59E0B] transition-transform duration-200 group-hover:scale-105">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Comments Received</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.totalComments}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">From active students</p>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Curricula */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#111827] flex items-center">
              <BookOpen className="mr-2 text-[#4F46E5]" size={20} />
              Recent Curricula
            </h3>
            <Link to="/faculty/my-curricula" className="text-xs font-bold text-[#4F46E5] hover:underline">
              View All
            </Link>
          </div>

          {recentCurricula.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
              <FileText size={40} className="mx-auto text-[#9CA3AF] mb-3" />
              <p className="text-sm font-semibold text-[#6B7280]">No curricula created yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1 mb-5">Start by generating your first outline with LLaMA.</p>
              <Link
                to="/faculty/generate"
                className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-95 shadow-sm transition-all"
              >
                Launch Generator
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCurricula.map((curric) => (
                <div 
                  key={curric.id}
                  onClick={() => navigate(`/faculty/my-curricula`)}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md hover:border-[#4F46E5] cursor-pointer flex justify-between items-center transition-all duration-200"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="inline-flex text-[10px] font-bold bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-md mb-2">
                      {curric.level}
                    </span>
                    <h4 className="font-bold text-[#111827] text-sm truncate">{curric.skill}</h4>
                    <div className="flex items-center text-[10px] text-[#6B7280] mt-1.5 space-x-3">
                      <span>{curric.semesters} Semesters</span>
                      <span>•</span>
                      <span>{curric.weeklyHours || "N/A"} Hours/Wk</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      curric.status === "published" 
                        ? "bg-emerald-50 text-[#10B981] border border-emerald-100" 
                        : "bg-amber-50 text-[#F59E0B] border border-amber-100"
                    }`}>
                      {curric.status}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] mt-2 flex items-center font-medium">
                      <Calendar size={10} className="mr-1" />
                      {new Date(curric.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#111827]">Syllabus Guidelines</h3>
          
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-4">
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold mr-3 text-xs shrink-0 mt-0.5">1</span>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Outline Skills Clearly</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Specify precise terms like "Full-Stack React" or "Data Structures with Python" for targeted prompts.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold mr-3 text-xs shrink-0 mt-0.5">2</span>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Select Appropriate Workloads</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Choose BTech, Masters, or Certification options to auto-calibrate depth and weekly credits.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold mr-3 text-xs shrink-0 mt-0.5">3</span>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Publish for Student View</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Keep plans as drafts during editing. Once published, students of your college can instantly browse them and download PDFs.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Student Progress Monitoring Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#111827] flex items-center">
            <Award className="mr-2 text-[#4F46E5]" size={20} />
            Student Progress Tracking
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Monitor real-time syllabus completion statistics for all college students registered in your institution.
          </p>
        </div>

        {studentsList.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#9CA3AF] bg-slate-50/50 rounded-2xl border border-dashed border-[#E5E7EB]">
            No registered students found in your university.
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E5E7EB]">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Curriculum Enrolled</th>
                    <th className="px-6 py-4">Completed Modules</th>
                    <th className="px-6 py-4">Completion Progress</th>
                    <th className="px-6 py-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-xs">
                  {studentsList.flatMap((student, sIdx) => {
                    const rowBg = sIdx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white";
                    
                    if (!student.progress || student.progress.length === 0) {
                      return [
                        <tr key={student.uid} className={`${rowBg} hover:bg-[#F9FAFB] transition-colors`}>
                          <td className="px-6 py-4 font-bold text-[#111827]">{student.name}</td>
                          <td className="px-6 py-4 text-[#9CA3AF] italic font-medium">No curricula started yet</td>
                          <td className="px-6 py-4 text-[#9CA3AF] font-medium">0 / 0</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-[#6B7280] border border-slate-200">
                              Inactive
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-[#9CA3AF] font-medium">N/A</td>
                        </tr>
                      ];
                    }

                    return student.progress.map((prog, idx) => {
                      const completedCount = prog.completedCourses?.length || 0;
                      const totalCount = prog.totalCourses || 1;
                      const percentage = Math.round((completedCount / totalCount) * 100);
                      const lastSync = prog.updatedAt 
                        ? new Date(prog.updatedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "N/A";

                      return (
                        <tr key={`${student.uid}_${prog.id || idx}`} className={`${rowBg} hover:bg-[#F9FAFB] transition-colors`}>
                          <td className="px-6 py-4 font-bold text-[#111827]">
                            {idx === 0 ? student.name : ""}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#374151]">{prog.curriculumTitle}</td>
                          <td className="px-6 py-4 font-medium text-[#6B7280]">
                            {completedCount} / {totalCount} Courses
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-[#4F46E5]">{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-[#9CA3AF] font-medium">{lastSync}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default FacultyDashboard;
