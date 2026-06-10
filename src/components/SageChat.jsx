import React from "react";
import { Send, Sparkles } from "lucide-react";
import { RoadmapTimeline } from "./RoadmapTimeline";

export function SageChat({ 
  messages, 
  loading, 
  userInput, 
  setUserInput, 
  onSubmit, 
  messagesEndRef 
}) {
  return (
    <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-3xl shadow-[0_1px_3px_rgba(79,70,229,0.08)] flex flex-col overflow-hidden min-h-[500px]">
      
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-[#E5E7EB] flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#134E4A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🌿
          </div>
          <div>
            <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2">
              <span className="bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent">Sage</span>
              <span className="flex items-center text-[10px] text-emerald-600 font-semibold gap-1">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block animate-pulse"></span>
                Online
              </span>
            </h3>
            <p className="text-[10px] text-[#6B7280] font-medium">Outcome roadmap & study strategies adviser</p>
          </div>
        </div>
        <div className="text-xs font-bold text-[#9CA3AF]">
          LLaMA 3.3 70B
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-8">
            <span className="text-4xl mb-4">🌿</span>
            <h4 className="text-sm font-bold text-[#111827]">Hi, I'm Sage!</h4>
            <p className="text-xs text-[#6B7280] mt-2 max-w-sm leading-normal">
              Ask me about supplemental learning paths (e.g. "I want to add Docker and DevOps to my schedule") or study guidance. Select curriculum contexts on the left to customize my answers!
            </p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === "user";
            const isRefusal = m.content && m.content.includes("I can only help with learning roadmaps");

            return (
              <div key={idx} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#134E4A] flex items-center justify-center shrink-0 text-sm shadow-sm select-none">
                    🌿
                  </div>
                )}
                <div className={`p-4 shadow-sm ${
                  isUser 
                    ? "max-w-[70%] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-2xl rounded-tr-sm" 
                    : isRefusal
                      ? "max-w-[75%] bg-[#FEF2F2] border border-[#FCA5A5] border-l-4 border-l-[#EF4444] text-[#991B1B] italic rounded-2xl rounded-tl-sm"
                      : "max-w-[75%] bg-white border border-[#E5E7EB] border-l-[3px] border-l-[#06B6D4] text-[#374151] rounded-2xl rounded-tl-sm"
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isUser 
                      ? "text-indigo-200" 
                      : isRefusal 
                        ? "text-red-500" 
                        : "text-[#06B6D4]"
                  }`}>
                    {isUser ? "You" : "Sage 🌿"}
                  </p>
                  
                  {isRefusal && <span className="inline-block mr-1">🚫</span>}
                  <p className="text-xs leading-relaxed break-words whitespace-pre-wrap inline">{m.content}</p>

                  {m.roadmap && (
                    <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                      <RoadmapTimeline roadmap={m.roadmap} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {loading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#134E4A] flex items-center justify-center shrink-0 text-sm shadow-sm select-none">
              🌿
            </div>
            <div className="bg-white border border-[#E5E7EB] border-l-[3px] border-l-[#06B6D4] rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2 shadow-xs">
              <span className="w-1.5 h-1.5 bg-[#06B6D4] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#06B6D4] rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-[#06B6D4] rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="p-4 border-t border-[#E5E7EB] bg-white flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask Sage for roadmap adjustments (e.g. 'How can I learn Git and Python?')..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-3 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] text-[#111827] placeholder:text-[#9CA3AF] font-medium transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || loading}
          className="p-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md transition-all duration-200 shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default SageChat;

