import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  History, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  Eye,
  Menu,
  X,
  School
} from "lucide-react";

export function Sidebar() {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!userProfile) return null;

  const isFaculty = userProfile.role === "Faculty";

  // Category Icon Colors: 📊 cyan, ✨ yellow, 📋 white, 🕐 gray, 💬 pink
  const facultyLinks = [
    { label: "Dashboard", path: "/faculty", icon: LayoutDashboard, iconColor: "text-cyan-400" },
    { label: "Generate Curriculum", path: "/faculty/generate", icon: PlusCircle, iconColor: "text-amber-400" },
    { label: "My Curricula", path: "/faculty/my-curricula", icon: BookOpen, iconColor: "text-slate-100" },
    { label: "Generation History", path: "/faculty/generation-history", icon: History, iconColor: "text-slate-400" },
    { label: "Comments", path: "/faculty/comments", icon: MessageSquare, iconColor: "text-pink-400" }
  ];

  const studentLinks = [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard, iconColor: "text-cyan-400" },
    { label: "Browse Curricula", path: "/student/browse", icon: BookOpen, iconColor: "text-slate-100" },
    { label: "Sage AI", path: "/student/sage", icon: Sparkles, iconColor: "text-amber-400" },
    { label: "My Comments", path: "/student/my-comments", icon: MessageSquare, iconColor: "text-pink-400" },
    { label: "View History", path: "/student/view-history", icon: Eye, iconColor: "text-slate-400" }
  ];

  const links = isFaculty ? facultyLinks : studentLinks;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Background configurations
  // Faculty Sidebar: #1E1B4B (deep indigo), Student Sidebar: #134E4A (deep teal)
  const sidebarBg = isFaculty ? "bg-[#1E1B4B]" : "bg-[#134E4A]";
  const subtitle = isFaculty ? "Faculty Portal" : "Student Portal";
  const subtitleColor = isFaculty ? "text-indigo-200" : "text-teal-200";
  const collegeBadgeBg = isFaculty ? "bg-indigo-900/60 text-indigo-200 border-indigo-800/40" : "bg-teal-900/60 text-teal-200 border-teal-800/40";
  const avatarBg = isFaculty ? "bg-indigo-950 border-indigo-800 text-indigo-200" : "bg-teal-950 border-teal-800 text-teal-200";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 border rounded-lg shadow-lg md:hidden transition-all duration-200 ${
          isFaculty ? "text-white bg-[#1E1B4B] border-indigo-900/50" : "text-white bg-[#134E4A] border-teal-900/50"
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 ${sidebarBg} border-r border-white/5 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo */}
        <div className="flex flex-col px-6 py-5 border-b border-white/5">
          <Link to="/" className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
              CurrHub
            </span>
          </Link>
          <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 ${subtitleColor}`}>
            {subtitle}
          </span>
        </div>

        {/* User Info / College Badge */}
        <div className="p-4 mx-4 my-4 bg-white/5 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border font-bold text-sm shrink-0 ${avatarBg}`}>
              {userProfile.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{userProfile.name}</p>
              <p className={`text-[10px] font-bold capitalize tracking-wide ${subtitleColor}`}>{userProfile.role}</p>
            </div>
          </div>
          <div className="flex items-center mt-3 pt-3 border-t border-white/5 text-xs text-white/70 font-semibold truncate">
            <School size={13} className="mr-1.5 shrink-0 text-white/50" />
            <span className={`truncate px-2.5 py-0.5 rounded-full border text-[10px] font-black ${collegeBadgeBg}`}>
              {userProfile.college}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 group ${
                  isActive 
                    ? "bg-white/15 border-l-[3px] border-white text-white font-bold" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon 
                  size={18} 
                  className={`mr-3 shrink-0 transition-transform duration-250 group-hover:scale-105 ${
                    isActive ? "text-white" : link.iconColor || "text-white/60 group-hover:text-white"
                  }`} 
                />
                <span className="flex-1 truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-white/70 rounded-xl hover:bg-white/10 hover:text-rose-400 transition-all duration-200 group"
          >
            <LogOut size={18} className="mr-3 shrink-0 text-white/50 group-hover:text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
