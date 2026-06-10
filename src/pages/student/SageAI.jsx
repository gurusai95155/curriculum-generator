import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { querySage } from "../../utils/sageApi";
import SageChat from "../../components/SageChat";
import { 
  Plus, 
  Check,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

export function SageAI() {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected conversation ID from URL
  const chatId = searchParams.get("chat");

  // Tab configurations: "context" or "history"
  const tabParam = searchParams.get("tab") || "context";
  const [sidebarTab, setSidebarTab] = useState("context");
  const [conversations, setConversations] = useState([]);

  // College curricula for contexts
  const [collegeCurricula, setCollegeCurricula] = useState([]);
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState([]);

  // Chat conversation state
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Scroll ref
  const messagesEndRef = useRef(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam === "history" || tabParam === "context") {
      setSidebarTab(tabParam);
    }
  }, [tabParam]);

  // Load past conversation history
  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, "sageHistory"),
      where("studentUid", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setConversations(list);
    }, (error) => {
      console.error("Error fetching sage history:", error);
    });

    return unsubscribe;
  }, [userProfile]);

  const handleTabChange = (tabName) => {
    setSidebarTab(tabName);
    const chat = searchParams.get("chat");
    if (chat) {
      setSearchParams({ chat, tab: tabName });
    } else {
      setSearchParams({ tab: tabName });
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation history?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "sageHistory", id));
      toast.success("Conversation deleted.");
      if (activeChatId === id) {
        handleNewConversation();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
    }
  };

  // Load college curricula for left sidebar contexts
  useEffect(() => {
    if (!userProfile?.college) return;

    const q = query(
      collection(db, "curricula"),
      where("college", "==", userProfile.college),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollegeCurricula(list);
    });

    return unsubscribe;
  }, [userProfile?.college]);

  // Load existing chat if chatId is in URL
  useEffect(() => {
    if (!chatId) {
      // If no chatId in URL, we reset states to fresh chat
      setActiveChatId(null);
      setMessages([]);
      setSelectedCurriculumIds([]);
      return;
    }

    async function loadChat() {
      try {
        const docRef = doc(db, "sageHistory", chatId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setActiveChatId(chatId);
          setMessages(chatData.messages || []);
          setSelectedCurriculumIds(chatData.contextCurriculumIds || []);
        } else {
          toast.error("Conversation not found.");
          setSearchParams({});
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        toast.error("Failed to load conversation.");
      }
    }

    loadChat();
  }, [chatId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleCurriculumSelection = (id) => {
    setSelectedCurriculumIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleNewConversation = () => {
    setSearchParams({});
    setActiveChatId(null);
    setMessages([]);
    setSelectedCurriculumIds([]);
    setUserInput("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !userProfile) return;

    const userQueryText = userInput.trim();
    setUserInput("");

    // Create user message object
    const userMessage = {
      role: "user",
      content: userQueryText,
      timestamp: new Date().toISOString()
    };

    // Append immediately to UI
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map context curricula
      const contextData = collegeCurricula.filter(c => selectedCurriculumIds.includes(c.id));

      // Call API
      const result = await querySage({
        messages: updatedMessages,
        contextCurricula: contextData
      });

      // Construct Assistant message object
      // Sage returns structured JSON: { type: "message"|"roadmap", message, roadmap }
      let assistantContent = "";
      let roadmapData = null;

      if (result.type === "roadmap") {
        assistantContent = result.roadmap.overview || "Here is your integrated learning roadmap:";
        roadmapData = result.roadmap;
      } else {
        assistantContent = result.message || "I'm Sage, your study companion.";
      }

      const assistantMessage = {
        role: "assistant",
        content: assistantContent,
        roadmap: roadmapData,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save/Update in Firestore
      if (activeChatId) {
        // Update existing chat
        const docRef = doc(db, "sageHistory", activeChatId);
        await updateDoc(docRef, {
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new chat session document
        const newChatDoc = {
          studentUid: userProfile.uid,
          college: userProfile.college,
          title: userQueryText.length > 40 ? `${userQueryText.substring(0, 40)}...` : userQueryText,
          topic: userQueryText,
          contextCurriculumIds: selectedCurriculumIds,
          messages: finalMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "sageHistory"), newChatDoc);
        setActiveChatId(docRef.id);
        setSearchParams({ chat: docRef.id });
      }

    } catch (error) {
      console.error("Sage Chat Submission Error:", error);
      toast.error(error.message || "Failed to contact Sage AI. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] fade-in-up max-w-7xl mx-auto">
      
      {/* Left Panel: Select Context Curricula & Chat History */}
      <div className="w-full lg:w-80 bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-[0_1px_3px_rgba(79,70,229,0.08)] flex flex-col justify-between shrink-0 min-h-[500px]">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="border-b border-[#E5E7EB] pb-4 shrink-0">
            <h2 className="text-xl font-extrabold flex items-center bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent gap-2">
              🌿 Sage
            </h2>
            
            {/* Tab switchers */}
            <div className="flex bg-[#F3F4F6] p-1 rounded-xl mt-3 border border-[#E5E7EB]">
              <button
                onClick={() => handleTabChange("context")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all ${
                  sidebarTab === "context"
                    ? "bg-white text-[#06B6D4] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#06B6D4]"
                }`}
              >
                Context
              </button>
              <button
                onClick={() => handleTabChange("history")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all ${
                  sidebarTab === "history"
                    ? "bg-white text-[#06B6D4] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#06B6D4]"
                }`}
              >
                History ({conversations.length})
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {sidebarTab === "context" ? (
              <div className="space-y-3">
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Select one or more core college curricula to inject as training context for Sage.
                </p>
                {/* Context Cards Scroll List */}
                <div className="space-y-2.5">
                  {collegeCurricula.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#9CA3AF] italic bg-[#F9FAFB] rounded-2xl">
                      No published curricula found in your college yet.
                    </div>
                  ) : (
                    collegeCurricula.map((curr) => {
                      const isSelected = selectedCurriculumIds.includes(curr.id);
                      return (
                        <div
                          key={curr.id}
                          onClick={() => toggleCurriculumSelection(curr.id)}
                          className={`border p-3.5 rounded-xl cursor-pointer transition-all duration-200 text-left flex items-start justify-between ${
                            isSelected 
                              ? "border-[#06B6D4] bg-[#E0F7FA] shadow-xs" 
                              : "border-[#E5E7EB] bg-white hover:border-[#06B6D4]"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <h4 className="text-xs font-bold text-[#111827] truncate">{curr.skill}</h4>
                            <p className="text-[11px] text-[#6B7280] mt-1 capitalize">{curr.level} • {curr.semesters} Semesters</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-[#06B6D4] rounded-full text-white flex items-center justify-center mt-0.5 shrink-0 shadow-2xs">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Resume previous roadmaps or consults with Sage.
                </p>
                {/* Past chats list */}
                <div className="space-y-2.5">
                  {conversations.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#9CA3AF] italic bg-[#F9FAFB] rounded-2xl">
                      No previous conversations found.
                    </div>
                  ) : (
                    conversations.map((chat) => {
                      const isActive = activeChatId === chat.id;
                      const dateStr = chat.updatedAt
                        ? new Date(chat.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        : "";
                      return (
                        <div
                          key={chat.id}
                          onClick={() => setSearchParams({ chat: chat.id, tab: "history" })}
                          className={`group border p-3.5 rounded-xl cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                            isActive
                              ? "border-[#06B6D4] bg-[#E0F7FA] shadow-xs"
                              : "border-[#E5E7EB] bg-white hover:border-[#06B6D4]"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 pr-2">
                              <h4 className="text-xs font-bold text-[#111827] truncate">
                                {chat.title || "Study Roadmap"}
                              </h4>
                              <span className="inline-flex items-center text-[10px] text-[#6B7280] mt-1 bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                                {chat.contextCurriculumIds?.length || 0} Contexts
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="text-[#EF4444] opacity-0 group-hover:opacity-100 hover:bg-[#FEF2F2] p-1.5 rounded-lg transition-all shrink-0 duration-150"
                              title="Delete Chat"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#E5E7EB]/50 text-[10px] text-[#9CA3AF]">
                            <span>{chat.messages?.length || 0} turns</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleNewConversation}
          className="mt-6 w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-md shrink-0"
        >
          <Plus size={14} />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Right Panel: Active Chat Container */}
      <SageChat 
        messages={messages}
        loading={loading}
        userInput={userInput}
        setUserInput={setUserInput}
        onSubmit={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />

    </div>
  );
}

export default SageAI;

