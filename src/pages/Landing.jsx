import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, GraduationCap, Compass, Layers, ShieldCheck } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background decoration blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] opacity-[0.08] blur-[80px] pointer-events-none -z-10 rounded-full"></div>

      {/* Navbar */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
              🎓 CurrHub
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-[#6B7280] hover:text-[#4F46E5] px-4 py-2 transition-all duration-200"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-6 text-center py-16 md:py-24 flex flex-col items-center justify-center">
        
        {/* LLaMA Badge */}
        <div className="inline-flex items-center space-x-1.5 bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full text-[#6B7280] text-xs font-semibold mb-6">
          <Sparkles size={13} className="text-[#7C3AED]" />
          <span>Outcome-Based GenAI Curriculum Planner</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#111827] tracking-tight max-w-4xl leading-tight">
          Transform Skills into <br className="hidden md:inline"/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]">
            Semester-wise Syllabi
          </span>
        </h1>
        
        <p className="mt-6 text-base md:text-[17px] text-[#6B7280] max-w-2xl leading-relaxed">
          CurrHub leverages generative AI to co-create complete outcome-based curriculum frameworks for faculty and intelligent personalized study companions for students.
        </p>

        {/* CTA Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-md transition-all duration-200"
          >
            Get Started as Faculty
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#4F46E5] border-2 border-[#4F46E5] text-sm font-bold px-8 py-4 rounded-2xl shadow-xs transition-all duration-200"
          >
            Join as Student
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#9CA3AF] font-medium">
          Trusted by students and educators across colleges
        </p>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#F9FAFB] border-y border-[#E5E7EB] py-8 w-full">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">500+</h2>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-1">Curricula Generated</p>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">50+</h2>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-1">Colleges Registered</p>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">1000+</h2>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-1">Active Students</p>
          </div>
        </div>
      </section>

      {/* Why CurrHub? Features Section */}
      <section className="bg-white py-16 md:py-24 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#111827]">Why CurrHub?</h2>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-2">Vibrant outcome-based AI learning framework</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-250 flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center mb-6">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-3">AI-Powered Generation</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Generate highly accurate semester-wise course frameworks, credits mapping, outcomes, and Capstone projects matching any skill in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-250 flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white flex items-center justify-center mb-6">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-3">Semester-wise Structure</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Clean visual mapping of credits, topics, and outcomes across semesters helps institutions standardize education blueprints seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-250 flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#F59E0B] text-white flex items-center justify-center mb-6">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-3">Sage Study Companion</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                A conversational buddy that guides students, provides high-quality YouTube resources, and generates customized semester timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#F9FAFB] border-t border-[#E5E7EB] py-16 md:py-24 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#111827]">How It Works</h2>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-2">Connecting educators and students seamlessly</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Faculty Flow */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs">
              <h3 className="text-lg font-bold text-[#4F46E5] mb-6 flex items-center">
                <span className="w-2.5 h-5 bg-[#4F46E5] rounded-full mr-2.5 inline-block"></span>
                Faculty Flow
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold mr-3.5 shrink-0">1</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Create Blueprint</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Input the target skill set and set parameters like education level and duration.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold mr-3.5 shrink-0">2</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Publish Draft</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Review the structured AI syllabus outline, tweak resources, and publish it.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold mr-3.5 shrink-0">3</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Monitor & Interact</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Track student progress and reply to comments and questions on syllabi.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Student Flow */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs">
              <h3 className="text-lg font-bold text-[#134E4A] mb-6 flex items-center">
                <span className="w-2.5 h-5 bg-[#134E4A] rounded-full mr-2.5 inline-block"></span>
                Student Flow
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F0FDF4] text-[#134E4A] text-xs font-bold mr-3.5 shrink-0">1</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Browse Curricula</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Explore published course guides curated by your college faculty.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F0FDF4] text-[#134E4A] text-xs font-bold mr-3.5 shrink-0">2</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Register & Track</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Enroll in curricula, access resources, and mark courses as completed.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F0FDF4] text-[#134E4A] text-xs font-bold mr-3.5 shrink-0">3</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Consult Sage AI</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">Inject core curricula as training context to generate customized study timelines.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1B4B] text-white py-12 border-t border-white/5 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-extrabold tracking-tight">🎓 CurrHub</span>
            <p className="text-xs text-indigo-200 mt-2">Vibrant outcome-based educational curriculum blueprints.</p>
          </div>
          <div className="text-xs text-indigo-300 font-medium text-center md:text-right">
            &copy; {new Date().getFullYear()} CurrHub. All rights reserved. Built with React, Tailwind CSS, and Groq API.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Landing;
