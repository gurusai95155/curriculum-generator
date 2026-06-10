import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Load user profile from Firestore to determine role
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profile = docSnap.data();
        toast.success(`Welcome back, ${profile.name}!`);
        if (profile.role === "Faculty") {
          navigate("/faculty");
        } else {
          navigate("/student");
        }
      } else {
        toast.error("User profile document not found. Please contact administration.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[500px] fade-in-up">
        
        {/* Left Visual Banner */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">🎓 CurrHub</span>
            </div>
            
            <h2 className="text-3xl font-extrabold leading-tight mt-12">
              Outcome-Based <br />Education, Simplified.
            </h2>
            <p className="mt-4 text-xs text-indigo-100 leading-relaxed font-medium">
              "Education is the most powerful weapon which you can use to change the world."
            </p>
          </div>

          <div className="text-[11px] text-indigo-200/70 pt-8 border-t border-white/10 font-bold uppercase tracking-wider">
            Secure Auth Panel
          </div>
        </div>

        {/* Right Form Container */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111827]">Sign In</h1>
            <p className="text-xs text-[#6B7280] mt-1">Access your personalized dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Address */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-[#9CA3AF]" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@college.edu"
                  className="w-full pl-11 pr-4 py-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-[#9CA3AF]" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 text-[#111827] placeholder:text-[#9CA3AF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#4F46E5]/10 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Toggle to register page */}
          <p className="text-center text-xs text-[#6B7280] mt-8 font-medium">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-[#4F46E5] font-bold hover:underline">
              Register Now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
