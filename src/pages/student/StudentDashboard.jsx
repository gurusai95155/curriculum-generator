import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { BookOpen, Sparkles, MessageSquare, Compass, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function StudentDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    collegeCurricula: 0,
    sageConversations: 0,
    commentsPosted: 0
  });
  const [featuredCurricula, setFeaturedCurricula] = useState([]);
  const [enrolledCurricula, setEnrolledCurricula] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    async function fetchStudentStats() {
      try {
        const uid = userProfile.uid;
        const college = userProfile.college;

        // 1. Curricula available from their college
        const currQuery = query(
          collection(db, "curricula"), 
          where("college", "==", college),
          where("status", "==", "published")
        );
        const currSnap = await getDocs(currQuery);
        const collegeCurriculaCount = currSnap.size;

        // 2. Sage conversations started
        const sageQuery = query(collection(db, "sageHistory"), where("studentUid", "==", uid));
        const sageSnap = await getDocs(sageQuery);
        const sageCount = sageSnap.size;

        // 3. Comments posted
        const commentsQuery = query(collection(db, "comments"), where("studentUid", "==", uid));
        const commentsSnap = await getDocs(commentsQuery);
        const commentsCount = commentsSnap.size;

        setStats({
          collegeCurricula: collegeCurriculaCount,
          sageConversations: sageCount,
          commentsPosted: commentsCount
        });

        // 4. Featured/Recent curricula (max 2) - sorted client side to prevent compound index errors
        const featuredQuery = query(
          collection(db, "curricula"),
          where("college", "==", college),
          where("status", "==", "published")
        );
        const featuredSnap = await getDocs(featuredQuery);
        const featuredList = featuredSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 2);
        setFeaturedCurricula(featuredList);

        // 5. Fetch Enrolled Curricula
        const enrollQuery = query(
          collection(db, "studentProgress"),
          where("studentUid", "==", uid)
        );
        const enrollSnap = await getDocs(enrollQuery);
        const enrollList = enrollSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setEnrolledCurricula(enrollList);

      } catch (error) {
        console.error("Error loading student dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentStats();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06B6D4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E5E7EB] rounded-3xl shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
        <div>
          <span className="inline-flex px-3 py-1 bg-[#EFF6FF] border border-[#DBEAFE] text-[#3B82F6] text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Student Space
          </span>
          <h2 className="text-2xl font-bold text-[#111827]">Hello, {userProfile.name}</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Browse syllabi approved by <span className="font-semibold text-[#111827]">{userProfile.college}</span> and design roadmaps with Sage.
          </p>
        </div>
        <Link 
          to="/student/sage"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-md transition-all duration-200"
        >
          <Sparkles size={14} />
          <span>Consult Sage AI</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Curricula available - Indigo tint */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-2xl text-[#4F46E5] transition-transform duration-200 group-hover:scale-105">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Syllabi Available</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.collegeCurricula}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Published by faculty</p>
          </div>
        </div>

        {/* Sage conversations - Cyan tint */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-2xl text-[#06B6D4] transition-transform duration-200 group-hover:scale-105">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Sage AI Chats</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.sageConversations}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Custom study companions</p>
          </div>
        </div>

        {/* Comments posted - Orange tint */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center space-x-5 group">
          <div className="p-4 bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] rounded-2xl text-[#F59E0B] transition-transform duration-200 group-hover:scale-105">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Comments Posted</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.commentsPosted}</h3>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Discussions participated in</p>
          </div>
        </div>

      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main area: Enrolled and Featured curricula */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Enrolled Curricula */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#111827] flex items-center">
              <Award className="mr-2 text-[#06B6D4]" size={20} />
              Your Enrolled Curricula
            </h3>

            {enrolledCurricula.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
                <BookOpen size={40} className="mx-auto text-[#9CA3AF] mb-3" />
                <p className="text-sm font-semibold text-[#6B7280]">Not enrolled in any curricula yet</p>
                <p className="text-xs text-[#9CA3AF] mt-1 mb-5">
                  Browse curricula published by your faculty, choose one, and click 'Start Curriculum' to register and begin tracking progress.
                </p>
                <Link
                  to="/student/browse"
                  className="inline-flex bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Browse Syllabi
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {enrolledCurricula.map((prog) => {
                  const completedCount = prog.completedCourses?.length || 0;
                  const totalCount = prog.totalCourses || 1;
                  const percentage = Math.round((completedCount / totalCount) * 100);

                  return (
                    <div 
                      key={prog.id}
                      onClick={() => navigate(`/student/browse?view=${prog.curriculumId}`)}
                      className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md hover:border-[#06B6D4] cursor-pointer flex flex-col justify-between transition-all duration-200 group"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="inline-flex text-[10px] font-bold bg-[#E0F7FA] text-[#006064] px-2 py-0.5 rounded-md">
                            Enrolled
                          </span>
                          <span className="text-[11px] font-bold text-[#6B7280]">
                            {completedCount} / {totalCount} Modules
                          </span>
                        </div>
                        <h4 className="font-bold text-[#111827] text-sm truncate group-hover:text-[#06B6D4] transition-colors">
                          {prog.curriculumTitle}
                        </h4>
                      </div>
                      
                      <div className="mt-5 space-y-2">
                        <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                          <span>Completion</span>
                          <span className="font-bold text-[#06B6D4]">{percentage}%</span>
                        </div>
                        <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Featured/Recent Curricula */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#111827] flex items-center">
                <Compass className="mr-2 text-[#06B6D4]" size={20} />
                Recent Curricula
              </h3>
              <Link to="/student/browse" className="text-xs font-bold text-[#06B6D4] hover:underline">
                Browse All
              </Link>
            </div>

            {featuredCurricula.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(79,70,229,0.08)]">
                <BookOpen size={40} className="mx-auto text-[#9CA3AF] mb-3" />
                <p className="text-sm font-semibold text-[#6B7280]">No curricula published yet</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Syllabi published by your college faculty will show up here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredCurricula.map((curr) => (
                  <div 
                    key={curr.id}
                    onClick={() => navigate(`/student/browse?view=${curr.id}`)}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] hover:-translate-y-0.5 hover:shadow-md hover:border-[#06B6D4] cursor-pointer flex flex-col justify-between transition-all duration-200 group"
                  >
                    <div>
                      <span className="inline-flex text-[10px] font-bold bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-md mb-3">
                        {curr.level}
                      </span>
                      <h4 className="font-bold text-[#111827] text-sm truncate group-hover:text-[#06B6D4] transition-colors">{curr.skill}</h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 truncate">By: {curr.publishedByName || "Faculty"}</p>
                    </div>
                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                      <span>{curr.semesters} Semesters</span>
                      <span className="text-[#06B6D4] font-bold group-hover:translate-x-1 transition-transform">Study &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right side area: Quick Helper Box */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#111827]">Meet Sage AI 🌿</h3>
          <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#E5E7EB] rounded-3xl p-6 shadow-[0_1px_3px_rgba(79,70,229,0.08)] space-y-4">
            <p className="text-xs text-[#374151] leading-relaxed">
              Sage is your academic companion. If you want to learn extra topics like **Docker, Kubernetes, or AWS** alongside your core college curriculum:
            </p>
            <ol className="list-decimal pl-4 space-y-2 text-xs text-[#6B7280] font-medium">
              <li>Navigate to **Sage AI** sidebar.</li>
              <li>Select your current published curriculum context cards.</li>
              <li>Type your learning goal in natural language.</li>
              <li>Get a personalized vertical timeline mapping extra topics to semesters!</li>
            </ol>
            <Link
              to="/student/sage"
              className="inline-flex items-center text-xs font-bold text-[#06B6D4] hover:text-[#3B82F6] hover:underline pt-2"
            >
              Start chatting with Sage &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
