import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { GraduationCap, Compass, School, Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Faculty", // 'Faculty' or 'Student'
    college: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role, college } = formData;

    if (!name.trim() || !email.trim() || !password.trim() || !college.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role, college);
      toast.success(`Registered successfully as ${role}!`);
      if (role === "Faculty") {
        navigate("/faculty");
      } else {
        navigate("/student");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFaculty = formData.role === "Faculty";

  // Banner gradient
  const leftBannerBg = isFaculty 
    ? "from-[#4F46E5] to-[#7C3AED]" // Primary Gradient
    : "from-[#06B6D4] to-[#3B82F6]"; // Secondary Gradient

  // Submit button gradient
  const btnBg = isFaculty
    ? "from-[#4F46E5] to-[#7C3AED] shadow-[#4F46E5]/10"
    : "from-[#06B6D4] to-[#3B82F6] shadow-[#06B6D4]/10";

  // Underline Link color
  const linkTextColor = isFaculty ? "text-[#4F46E5]" : "text-[#3B82F6]";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden min-h-[600px] fade-in-up">
        
        {/* Left Visual Banner */}
        <div className={`md:w-5/12 bg-gradient-to-br ${leftBannerBg} text-white p-8 md:p-12 flex flex-col justify-between transition-all duration-300`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight">🎓 CurrHub</span>
            </div>
            
            <h2 className="text-3xl font-extrabold leading-tight mt-12">
              Welcome to the <br />Future of Syllabus Design.
            </h2>
            <p className="mt-4 text-xs text-white/80 leading-relaxed font-medium">
              Create and manage college-specific learning paths with powerful, structured LLaMA-based AI assistance.
            </p>
          </div>

          <div className="text-[11px] text-white/60 pt-8 border-t border-white/10 font-bold uppercase tracking-wider">
            Powered by LLaMA 3.3 • Node.js
          </div>
        </div>

        {/* Right Form Container */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111827]">Create Account</h1>
            <p className="text-xs text-[#6B7280] mt-1">Get started by setting up your credentials and role.</p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-[#F3F4F6] p-1 rounded-2xl border border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => handleRoleSelect("Faculty")}
              className={`flex items-center justify-center py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                isFaculty 
                  ? "bg-white text-[#4F46E5] shadow-xs border border-[#E5E7EB]" 
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <GraduationCap size={16} className="mr-1.5" />
              Faculty Member
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("Student")}
              className={`flex items-center justify-center py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                !isFaculty 
                  ? "bg-white text-[#06B6D4] shadow-xs border border-[#E5E7EB]" 
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Compass size={16} className="mr-1.5" />
              Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 text-[#9CA3AF]" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full pl-11 pr-4 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-[#9CA3AF]" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@college.edu"
                  className="w-full pl-11 pr-4 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
            </div>

            {/* College/Organization Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">College / Institution</label>
              <div className="relative">
                <School className="absolute left-4 top-3 text-[#9CA3AF]" size={16} />
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University"
                  className="w-full pl-11 pr-4 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-[#6B7280] mt-1 leading-normal">
                * Must match exactly across students/faculty to share and browse curricula.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-[#9CA3AF]" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-4 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-2 rounded-xl text-xs font-semibold text-white shadow-md bg-gradient-to-r ${btnBg} disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              <span>{loading ? "Registering..." : "Create Account"}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Toggle to login page */}
          <p className="text-center text-xs text-[#6B7280] mt-6 font-medium">
            Already have an account?{" "}
            <Link to="/login" className={`font-bold hover:underline ${linkTextColor}`}>
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
