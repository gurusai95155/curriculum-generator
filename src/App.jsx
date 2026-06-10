import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Components
import Sidebar from "./components/Sidebar";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Faculty subpages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import GenerateCurriculum from "./pages/faculty/GenerateCurriculum";
import MyCurricula from "./pages/faculty/MyCurricula";
import GenerationHistory from "./pages/faculty/GenerationHistory";
import FacultyComments from "./pages/faculty/FacultyComments";

// Student subpages
import StudentDashboard from "./pages/student/StudentDashboard";
import BrowseCurricula from "./pages/student/BrowseCurricula";
import SageAI from "./pages/student/SageAI";
import SageHistory from "./pages/student/SageHistory";
import MyComments from "./pages/student/MyComments";
import ViewHistory from "./pages/student/ViewHistory";

// Layout components with Sidebar & Role Check
function FacultyLayout() {
  const { currentUser, userProfile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile.role !== "Faculty") {
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300">
        {/* Mobile spacing adjustment for sidebar toggle */}
        <div className="h-12 md:hidden"></div>
        <Outlet />
      </main>
    </div>
  );
}

function StudentLayout() {
  const { currentUser, userProfile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile.role !== "Student") {
    return <Navigate to="/faculty" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300">
        {/* Mobile spacing adjustment for sidebar toggle */}
        <div className="h-12 md:hidden"></div>
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#1E1B4B',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500'
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
              style: { background: '#065F46', color: '#fff', borderRadius: '12px' }
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: { background: '#7F1D1D', color: '#fff', borderRadius: '12px' }
            }
          }} 
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Faculty Routes */}
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="generate" element={<GenerateCurriculum />} />
            <Route path="my-curricula" element={<MyCurricula />} />
            <Route path="generation-history" element={<GenerationHistory />} />
            <Route path="comments" element={<FacultyComments />} />
          </Route>

          {/* Protected Student Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="browse" element={<BrowseCurricula />} />
            <Route path="sage" element={<SageAI />} />
            <Route path="sage-history" element={<Navigate to="/student/sage?tab=history" replace />} />
            <Route path="my-comments" element={<MyComments />} />
            <Route path="view-history" element={<ViewHistory />} />
          </Route>

          {/* Redirect / Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
