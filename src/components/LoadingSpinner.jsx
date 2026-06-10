import React from "react";

export function LoadingSpinner({ message = "Generating your curriculum..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Animated Gradient Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-[#F3F4F6]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#4F46E5] border-r-[#7C3AED] animate-spin"></div>
        {/* Inner pulsing dot */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] animate-pulse"></div>
      </div>
      <p className="mt-4 text-[15px] font-semibold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent animate-pulse tracking-wide font-sans">
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
