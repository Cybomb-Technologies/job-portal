import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, MessageSquare, BookOpen, User as UserIcon, AlertCircle, Sparkles, Coffee, Lightbulb, X, History, Plus } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const CareerTips = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your AI Career Coach. Ask me anything about your career, resume, or interview prep!", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [remainingChats, setRemainingChats] = useState(10);
    const [error, setError] = useState(null);
    const [showTipsModal, setShowTipsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false); // Mobile history
    const chatContainerRef = useRef(null);

    // History State
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [sidebarTab, setSidebarTab] = useState('history'); // 'tips' or 'history'

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (user) {
            fetchUsage();
            fetchHistory();
        }
    }, [user]);

    const fetchUsage = async () => {
        try {
            const { data } = await api.get('/chat/usage');
            setRemainingChats(data.remainingChats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/chat/history');
            setChatHistory(data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const loadChat = async (chatId) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/chat/${chatId}`);
            // Transform messages to UI format
            const uiMessages = data.messages.map((msg, idx) => ({
                id: idx,
                text: msg.text,
                sender: msg.sender
            }));
            setMessages(uiMessages);
            setCurrentChatId(chatId);
            if (window.innerWidth < 1024) setShowHistoryModal(false); // Close mobile modal
        } catch (err) {
            console.error("Failed to load chat", err);
            setError("Failed to load conversation");
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([{ id: Date.now(), text: "Hi! I'm your AI Career Coach. Ask me anything about your career, resume, or interview prep!", sender: 'ai' }]);
        if (window.innerWidth < 1024) setShowHistoryModal(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || remainingChats <= 0) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/chat', { 
                message: userMessage.text,
                chatId: currentChatId // Send current Chat ID if exists
            });

            const aiMessage = { 
                id: Date.now() + 1, 
                text: data.response, 
                sender: 'ai' 
            };

            setMessages(prev => [...prev, aiMessage]);
            setRemainingChats(data.remainingChats);

            // Update Chat ID if it was a new chat
            if (!currentChatId && data.chatId) {
                setCurrentChatId(data.chatId);
                // Refresh history to show the new item
                fetchHistory();
            }

        } catch (err) {
            console.error(err);
            if(err.response?.status === 429) {
                setError("Daily chat limit reached! You can continue tomorrow.");
                setRemainingChats(0);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const tips = [
        {
            title: "Resume Writing Guide",
            icon: BookOpen,
            color: "bg-blue-50 text-blue-600",
            content: "Keep your resume under 2 pages. Use action verbs like 'Led', 'Created', 'Managed'. Quantify results where possible."
        },
        {
            title: "Interview Preparation",
            icon: MessageSquare,
            color: "bg-purple-50 text-purple-600",
            content: "Research the company thoroughly. Practice the STAR method (Situation, Task, Action, Result) for behavioral questions."
        },
        {
            title: "Salary Negotiation",
            icon: DollarSign, 
            color: "bg-green-50 text-green-600",
            content: "Know your market value. Don't be afraid to ask for more, but be polite and back it up with data."
        },
        {
            title: "Networking Tips",
            icon: UserIcon,
            color: "bg-orange-50 text-orange-600",
            content: "Update your LinkedIn profile properly. Connect with alumni and industry professionals with personalized messages."
        }
    ];

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <Bot className="w-16 h-16 text-[#4169E1]" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Please Login Access Career Tips</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    Sign in to chat with our AI Career Coach and get personalized advice tailored to your profile.
                </p>
                <a href="/login" className="px-8 py-3 bg-[#4169E1] text-white rounded-xl font-bold hover:bg-[#3A5FCD] transition shadow-lg shadow-blue-500/30">
                    Login Now
                </a>
            </div>
        );
    }

    // Sidebar Content Component
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex p-2 bg-gray-100 rounded-xl mb-4 shrink-0">
                <button 
                    onClick={() => setSidebarTab('history')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    History
                </button>
                <button 
                    onClick={() => setSidebarTab('tips')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'tips' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tips
                </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                {sidebarTab === 'history' ? (
                    <div className="space-y-3">
                        <button 
                            onClick={startNewChat}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md mb-4"
                        >
                            <Plus className="w-5 h-5" />
                            New Chat
                        </button>

                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
                        
                        {chatHistory.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No chat history yet.</p>
                        ) : (
                            chatHistory.map((chat) => (
                                <button
                                    key={chat._id}
                                    onClick={() => loadChat(chat._id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-md group ${
                                        currentChatId === chat._id 
                                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                        : 'bg-white border-gray-100 hover:border-blue-100'
                                    }`}
                                >
                                    <h4 className={`font-bold text-sm truncate mb-1 ${currentChatId === chat._id ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}`}>
                                        {chat.title}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        {new Date(chat.createdAt).toLocaleDateString()}
                                    </p>
                                </button>
                            ))
                        )}
                        <p className="text-[10px] text-gray-400 text-center mt-4 bg-gray-50 p-2 rounded-lg">
                            History is auto-deleted after 7 days.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div className="bg-gradient-to-r from-[#4169E1] to-[#3A5FCD] p-6 rounded-2xl text-white shadow-lg mb-4">
                            <h1 className="text-xl font-bold mb-2 flex items-center">
                                Career Tips
                            </h1>
                            <p className="text-blue-100 opacity-90 text-sm">Expert advice to help you land your dream job.</p>
                        </div>
                        {tips.map((tip, index) => (
                            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center mb-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tip.color} mr-3 group-hover:scale-110 transition-transform`}>
                                        <tip.icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm">{tip.title}</h3>
                                </div>
                                <p className="text-gray-600 text-xs leading-relaxed">{tip.content}</p>
                            </div>
                        ))}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <Coffee className="w-10 h-10 mx-auto text-yellow-500 mb-4" />
                            <h3 className="font-bold text-gray-800 mb-2">Need a break?</h3>
                            <p className="text-gray-500 text-sm">Take 5 minutes to relax.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-0 sm:py-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-0 sm:px-4 relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
                    
                    {/* Left Column: Sidebar (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-1 h-full">
                         <SidebarContent />
                    </div>

                    {/* Right Column: Chat (Full width on mobile) */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col bg-white rounded-none sm:rounded-2xl shadow-xl border-x-0 sm:border border-gray-100 overflow-hidden relative h-full">
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center">
                                {/* Mobile Menu Button */}
                                <button 
                                    onClick={() => setShowHistoryModal(true)}
                                    className="lg:hidden mr-3 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                >
                                    <History className="w-5 h-5" />
                                </button>

                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3 border border-blue-100 shrink-0">
                                    <Bot className="w-6 h-6 text-[#4169E1]" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        {currentChatId 
                                            ? chatHistory.find(c => c._id === currentChatId)?.title || 'AI Career Coach' 
                                            : 'AI Career Coach'}
                                    </h3>
                                    <p className="text-xs text-green-500 flex items-center font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={startNewChat}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New
                                </button>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                                    remainingChats > 0 
                                    ? 'bg-blue-50 text-[#4169E1] border-blue-100' 
                                    : 'bg-red-50 text-red-500 border-red-100'
                                }`}>
                                    {remainingChats}/10 Left
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scroll-smooth" ref={chatContainerRef}>
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                     {msg.sender === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 flex-shrink-0 self-end mb-1">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div 
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                                            msg.sender === 'user' 
                                            ? 'bg-[#4169E1] text-white rounded-br-none' 
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                        }`}
                                    >
                                        <div className="prose prose-sm max-w-none force-normal-break">
                                            <ReactMarkdown 
                                                components={{
                                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                    code: ({node, inline, ...props}) => (
                                                        inline 
                                                            ? <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono" {...props} />
                                                            : <code className="block bg-black/10 rounded p-2 text-xs font-mono whitespace-pre-wrap overflow-x-auto my-2" {...props} />
                                                    )
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.sender === 'ai' ? 'AI Coach' : 'You'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 flex-shrink-0 self-end mb-1 animate-pulse">
                                            <Bot className="w-4 h-4" />
                                      </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-2 sm:p-4 bg-white border-t border-gray-100">
                             {error && (
                                <div className="mb-3 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-shake">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSend} className="relative">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={remainingChats > 0 ? "Ask about your resume, interview, or skills..." : "Daily limit reached."}
                                    disabled={loading || remainingChats <= 0}
                                    className="w-full pl-5 pr-14 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]/50 focus:border-[#4169E1] transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400 text-gray-700 font-medium shadow-inner"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim() || loading || remainingChats <= 0}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3A5FCD] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none bg-gradient-to-br from-[#4169E1] to-[#3A5FCD]"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <p className="text-center text-xs text-gray-400 mt-1 sm:mt-3">
                                AI can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Mobile Only) */}
            <button
                onClick={() => setShowHistoryModal(true)}
                className="lg:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-4 bg-gradient-to-r from-[#4169E1] to-[#3A5FCD] text-white rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
                aria-label="View History/Tips"
            >
                <History className="w-6 h-6" />
            </button>

            {/* Sidebar Modal (Mobile Only) */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 h-[600px]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-[#4169E1]">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Career Coach Menu</h3>
                            </div>
                            <button 
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors shadow-sm text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-hidden">
                             <SidebarContent />
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-gray-50/30 rounded-b-3xl shrink-0">
                            <button 
                                onClick={() => setShowHistoryModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Fallback Icon for DollarSign just in case
const DollarSign = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export default CareerTips;
