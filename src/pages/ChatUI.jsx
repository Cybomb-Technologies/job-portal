import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Send, Search, MessageSquare, Briefcase, User as UserIcon, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api';

const ChatUI = () => {
    const { 
        conversations, 
        currentChat, 
        selectChat, 
        messages, 
        sendMessage,
        loading,
        deleteChat,
        fetchTeamMemberConversations,
        fetchTeamMemberMessages
    } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const prevMessagesLengthRef = useRef(0);
    const location = useLocation();
    const navigate = useNavigate();

    // Team Chat State
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'team'
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [teamConversations, setTeamConversations] = useState([]);
    const [teamMessages, setTeamMessages] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(false);

    // Verify Admin Status
    const isCompanyAdmin = user?.role === 'Employer' && user?.companyRole === 'Admin';

    // specific useEffect to handle navigation from notification
    useEffect(() => {
        if (location.state?.userId && conversations.length > 0) {
            const targetConv = conversations.find(c => c.user._id === location.state.userId);
            if (targetConv) {
                selectChat(targetConv);
                // Clear the state so it doesn't re-trigger
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, conversations]);

    // Fetch Team Members
    useEffect(() => {
        if (viewMode === 'team' && isCompanyAdmin) {
            const fetchMembers = async () => {
                try {
                    setLoadingTeam(true);
                    const res = await api.get('/team/members');
                    setTeamMembers(res.data);
                } catch (error) {
                    console.error("Failed to fetch team members", error);
                } finally {
                    setLoadingTeam(false);
                }
            };
            fetchMembers();
        }
    }, [viewMode, isCompanyAdmin]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        selectChat(null);
        setSelectedMember(null);
        setTeamConversations([]);
        setTeamMessages([]);
    };

    // Handle fetching team member conversations
    useEffect(() => {
        if (selectedMember) {
            const loadMemberChats = async () => {
                setLoadingTeam(true);
                 // We need to fetch conversations for this member
                 // Use the context method we added
                const chats = await fetchTeamMemberConversations(selectedMember.user._id);
                setTeamConversations(chats);
                setLoadingTeam(false);
            };
            loadMemberChats();
        }
    }, [selectedMember, fetchTeamMemberConversations]);

    // We need a state for activeTeamChat
    const [activeTeamChat, setActiveTeamChat] = useState(null);

    const onSelectTeamChat = async (conv) => {
        setActiveTeamChat(conv);
        setLoadingTeam(true);
        // Ensure we fetch messages between the selected member and the other user in the conversation
        const msgs = await fetchTeamMemberMessages(selectedMember.user._id, conv.user._id);
        setTeamMessages(msgs);
        setLoadingTeam(false);
    };

    const handleTeamMemberSelect = (member) => {
        setSelectedMember(member);
        setActiveTeamChat(null); // Reset active chat when switching members
        setTeamConversations([]); // Clear previous conversations while loading
    };

    const handleBackToTeamList = () => {
        setSelectedMember(null);
        setActiveTeamChat(null);
    };


    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    };

    // Scroll handlers
    useEffect(() => {
        if (shouldScrollToBottom) {
            scrollToBottom();
            setShouldScrollToBottom(false);
        }
    }, [shouldScrollToBottom]);

    useEffect(() => {
        if ((currentChat || (viewMode === 'team' && selectedMember)) && !loading && (messages.length > 0 || teamMessages.length > 0)) {
            scrollToBottom();
        }
    }, [currentChat, loading, selectedMember, viewMode]);

    useEffect(() => {
        const msgs = viewMode === 'my' ? messages : teamMessages;
        if (msgs.length > prevMessagesLengthRef.current && msgs.length > 0) {
            scrollToBottom();
        }
        prevMessagesLengthRef.current = msgs.length;
    }, [messages.length, teamMessages.length, viewMode]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        try {
            // Check for job context
            const relatedJob = currentChat.jobContext;
            await sendMessage(currentChat.user._id, newMessage, relatedJob);
            
            // Clear context after sending so it doesn't attach to every message
            if (relatedJob) {
                // We need to update the currentChat object in context or locally to remove jobContext
                // Since currentChat comes from context, modifying it here locally won't persist to context directly 
                // but sendMessage optimistically updates messages. 
                // We should ideally clear it in context or just rely on the fact that we used it.
                // A simple hack is to delete it from the object reference if it's mutable, 
                // or we need a way to clear it via context.
                delete currentChat.jobContext; 
            }

            setNewMessage('');
            setShouldScrollToBottom(true);
            // Reset textarea height
            const textarea = document.querySelector('textarea');
            if (textarea) textarea.style.height = 'auto';
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    const handleDeleteChat = async () => {
        if (!currentChat) return;
        
        Swal.fire({
            title: 'Delete Conversation?',
            text: "This will clear the chat history for you. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteChat(currentChat.user._id);
                    Swal.fire(
                        'Deleted!',
                        'Your conversation has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error("Failed to delete chat", error);
                    Swal.fire(
                        'Error!',
                        'Failed to delete conversation.',
                        'error'
                    );
                }
            }
        });
    };
    
    // Filter conversations
    const filteredConversations = conversations.filter(c => 
        c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.user.companyName && c.user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Prevent body scroll when chat UI is mounted
    useEffect(() => {
        // Store original overflow
        const originalOverflow = document.body.style.overflow;
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        // Scroll to top of page
        window.scrollTo(0, 0);
        
        return () => {
            // Restore on unmount
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Helper to format image URL
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${cleanPath}`;
    };

    const handleProfileClick = (targetUser) => {
        if (!user) return;
        
        if (user.role === 'Job Seeker' && targetUser.role === 'Employer') {
            const companyId = targetUser.companyId?._id || targetUser.companyId;
            if (companyId) {
                navigate(`/company/${companyId}`);
            } else {
                 // Fallback if no company linked
                navigate(`/company/${targetUser._id}`);
            }
        } else if (user.role === 'Employer' && targetUser.role === 'Job Seeker') {
            const slug = targetUser.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') + '-' + targetUser._id.slice(-4);
            navigate(`/employer/candidates/${slug}`);
        }
    };

    return (
        <div className="fixed top-20 sm:top-20 left-0 right-0 bottom-0 flex bg-gray-50 border-t border-gray-200 z-40">
            {/* Sidebar */}
            <div className={`w-full sm:w-72 md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${currentChat || activeTeamChat ? 'hidden sm:flex' : 'flex'}`}>
                <div className="p-3 sm:p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {viewMode === 'my' ? 'Messages' : 'Team Chats'}
                        </h2>
                        {isCompanyAdmin && (
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => handleViewModeChange('my')}
                                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${viewMode === 'my' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    My Chats
                                </button>
                                <button 
                                    onClick={() => handleViewModeChange('team')}
                                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${viewMode === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Team
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Search or Back Button */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder={viewMode === 'team' ? "Search team members..." : "Search chats..."}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {viewMode === 'my' ? (
                        filteredConversations.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center text-gray-500">
                                <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm sm:text-base">No conversations yet</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const companyName = conv.user.companyId?.name || conv.user.companyName;
                                const companyLogo = conv.user.companyId?.profilePicture;

                                return (
                                <div 
                                    key={conv.user._id}
                                    onClick={() => selectChat(conv)}
                                    className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 ${currentChat?.user._id === conv.user._id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="relative flex-shrink-0">
                                             {(user?.role === 'Job Seeker' && conv.user.role === 'Employer' && companyLogo) || conv.user.profilePicture ? (
                                                <img 
                                                    src={getImageUrl((user?.role === 'Job Seeker' && conv.user.role === 'Employer' && companyLogo) ? companyLogo : conv.user.profilePicture)} 
                                                    alt={conv.user.name} 
                                                    className="w-11 sm:w-12 h-11 sm:h-12 rounded-full object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div 
                                                className="w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg border border-blue-200 hover:opacity-80 transition-opacity"
                                                style={{ display: ((user?.role === 'Job Seeker' && conv.user.role === 'Employer' && companyLogo) || conv.user.profilePicture) ? 'none' : 'flex' }}
                                            >
                                                {companyName ? companyName.charAt(0) : conv.user.name.charAt(0)}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-white">{conv.unreadCount}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors">
                                                    {conv.user.name}
                                                    {user?.role === 'Job Seeker' && conv.user.role === 'Employer' && companyName && <span className="text-gray-500 font-normal ml-1 hidden xs:inline">• {companyName}</span>}
                                                </h3>
                                                {conv.lastMessage && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                <span className="block truncate text-gray-500">
                                                    {conv.lastMessage ? (
                                                        (conv.lastMessage.sender === user?._id ? 'You: ' : '') + conv.lastMessage.content
                                                    ) : (
                                                        <span className="italic">Start a conversation</span>
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )
                    ) : (
                        // TEAM VIEW
                        selectedMember ? (
                            // Show Member's Conversations
                            loadingTeam ? (
                                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                            ) : teamConversations.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No conversations found for {selectedMember.user.name}</p>
                                </div>
                            ) : (
                                teamConversations.map((conv) => (
                                    <div 
                                        key={conv.user._id}
                                        onClick={() => onSelectTeamChat(conv)}
                                        className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 ${activeTeamChat?.user._id === conv.user._id ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="relative flex-shrink-0">
                                                {conv.user.profilePicture ? (
                                                    <img src={getImageUrl(conv.user.profilePicture)} alt={conv.user.name} className="w-11 sm:w-12 h-11 sm:h-12 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                                                        {conv.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.user.name}</h3>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    <span className="block truncate text-gray-500">
                                                        {conv.lastMessage ? (
                                                            (conv.lastMessage.sender === selectedMember.user._id ? `${selectedMember.user.name}: ` : 'Job Seeker: ') + conv.lastMessage.content
                                                        ) : (
                                                            <span className="italic">No messages</span>
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            // Show Team Members List
                            loadingTeam ? (
                                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                            ) : teamMembers.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No team members found</p>
                                </div>
                            ) : (
                                teamMembers.filter(m => m.user && m.user.name && m.user.name.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
                                    <div 
                                        key={member.user._id}
                                        onClick={() => handleTeamMemberSelect(member)}
                                        className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="relative flex-shrink-0">
                                                {member.user.profilePicture ? (
                                                    <img src={getImageUrl(member.user.profilePicture)} alt={member.user.name} className="w-11 sm:w-12 h-11 sm:h-12 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                                                        {member.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.user.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{member.role}</p>
                                                <p className="text-xs text-blue-500 mt-1">Click to view chats</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        )
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-white min-w-0 ${!(currentChat || activeTeamChat) ? 'hidden sm:flex' : 'flex'}`}>
                {/* Standard Chat View */}
                {viewMode === 'my' && currentChat && (
                    <>
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-2 sm:gap-3 shadow-sm z-10 bg-white">
                            <button 
                                onClick={() => selectChat(null)} 
                                className="sm:hidden p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full text-gray-600 transition-colors flex-shrink-0"
                            >
                                ←
                            </button>
                             <div className="cursor-pointer" onClick={() => handleProfileClick(currentChat.user)}>
                                {(() => {
                                    const companyLogo = currentChat.user.companyId?.profilePicture;
                                    const companyName = currentChat.user.companyId?.name || currentChat.user.companyName;
                                    const showCompany = user?.role === 'Job Seeker' && currentChat.user.role === 'Employer';
                                    const imgSrc = (showCompany && companyLogo) ? companyLogo : currentChat.user.profilePicture;
                                    
                                    return (
                                        <>
                                            {imgSrc ? (
                                                <img 
                                                    src={getImageUrl(imgSrc)} 
                                                    alt={currentChat.user.name} 
                                                    className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition-opacity flex-shrink-0"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div 
                                                className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm sm:text-base border border-blue-200 hover:opacity-80 transition-opacity flex-shrink-0"
                                                style={{ display: imgSrc ? 'none' : 'flex' }}
                                            >
                                                {companyName ? companyName.charAt(0) : currentChat.user.name.charAt(0)}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="cursor-pointer min-w-0 flex-1" onClick={() => handleProfileClick(currentChat.user)}>
                                <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                                   {(() => {
                                        const companyName = currentChat.user.companyId?.name || currentChat.user.companyName;
                                        if (user?.role === 'Job Seeker' && currentChat.user.role === 'Employer') {
                                           return (
                                               <span className="flex flex-wrap items-baseline gap-x-2">
                                                   <span className="truncate">{currentChat.user.name}</span>
                                                   {companyName && <span className="text-gray-500 font-normal text-xs sm:text-sm hidden xs:inline">• {companyName}</span>}
                                               </span>
                                           );
                                        }
                                        return currentChat.user.name;
                                   })()}
                                </h3>
                            </div>
                            
                            <button 
                                onClick={handleDeleteChat}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                title="Delete Conversation"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 overscroll-contain">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                                    <MessageSquare className="w-12 sm:w-16 h-12 sm:h-16 mb-3 sm:mb-4 opacity-30" />
                                    <p className="text-sm sm:text-base text-center">No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender === user?._id;
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {/* Job Tag */}
                                            {msg.relatedJob && (
                                                <div 
                                                    onClick={() => navigate(`/job/${msg.relatedJob.slug}`)}
                                                    className={`mb-1 max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                                                        isMe 
                                                            ? 'bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 mr-1' 
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 ml-1'
                                                    }`}
                                                >
                                                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">Regarding: <span className="font-bold underline">{msg.relatedJob.title}</span></span>
                                                </div>
                                            )}
                                            
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                                                <div 
                                                    className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base ${
                                                        isMe 
                                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                                    }`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        {isMe && (
                                                            msg.read ? (
                                                                <CheckCheck className="w-3 h-3 text-white" />
                                                            ) : (
                                                                <Check className="w-3 h-3 text-blue-200 opacity-70" />
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 sm:p-4 pb-5 sm:pb-6 bg-white border-t border-gray-200">
                            <div className="flex gap-2 items-end">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm min-w-0 resize-none overflow-hidden"
                                    rows="1"
                                    style={{ minHeight: '44px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto'; 
                                        e.target.style.height = (e.target.scrollHeight) + 'px';
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0 mb-[1px]"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Team Chat View (Read Only) */}
                {viewMode === 'team' && activeTeamChat && (
                    <>
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-2 sm:gap-3 shadow-sm z-10 bg-white">
                            <button 
                                onClick={() => setActiveTeamChat(null)} 
                                className="sm:hidden p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full text-gray-600 transition-colors flex-shrink-0"
                            >
                                ←
                            </button>
                             <div className="cursor-pointer" onClick={() => handleProfileClick(activeTeamChat.user)}>
                                {activeTeamChat.user.profilePicture ? (
                                    <img 
                                        src={getImageUrl(activeTeamChat.user.profilePicture)} 
                                        alt={activeTeamChat.user.name} 
                                        className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm sm:text-base border border-blue-200">
                                        {activeTeamChat.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="cursor-pointer min-w-0 flex-1" onClick={() => handleProfileClick(activeTeamChat.user)}>
                                <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                                   {activeTeamChat.user.name}
                                </h3>
                                <p className="text-xs text-gray-500">Chat with {selectedMember?.user.name}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 overscroll-contain">
                             {loadingTeam ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : teamMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                                    <MessageSquare className="w-12 sm:w-16 h-12 sm:h-16 mb-3 sm:mb-4 opacity-30" />
                                    <p className="text-sm sm:text-base text-center">No messages in this conversation.</p>
                                </div>
                            ) : (
                                teamMessages.map((msg, idx) => {
                                    // Identify sender: is it the team member (selectedMember) or the job seeker?
                                    const isTeamMember = msg.sender === selectedMember.user._id || msg.sender?._id === selectedMember.user._id;
                                    
                                    // Use distinct styles. Maybe Team member on right (blue) but different shade? 
                                    // Or Keep standard: "My" (viewer's company) -> Right.
                                    // Since admin is viewing their team member's chat, the team member is part of "us".
                                    // So Team Member messages -> Right. Job Seeker/External -> Left.
                                    
                                    return (
                                        <div key={idx} className={`flex ${isTeamMember ? 'justify-end' : 'justify-start'}`}>
                                            <div 
                                                className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base ${
                                                    isTeamMember 
                                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                                }`}
                                            >
                                                <p className="text-[10px] mb-1 opacity-75 font-semibold">
                                                    {isTeamMember ? selectedMember.user.name : activeTeamChat.user.name}
                                                </p>
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isTeamMember ? 'text-indigo-200' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {isTeamMember && (
                                                        msg.read ? (
                                                            <CheckCheck className="w-3 h-3 text-white" />
                                                        ) : (
                                                            <Check className="w-3 h-3 text-indigo-200 opacity-70" />
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Read-Only Notice */}
                        <div className="p-3 bg-gray-100 border-t border-gray-200 text-center text-xs text-gray-500">
                             Viewing as Admin (Read Only)
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!(currentChat || activeTeamChat) && (
                    <div className="hidden sm:flex flex-col items-center justify-center h-full text-gray-400 p-4">
                        <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center">Select a conversation</h3>
                        <p className="text-gray-500 max-w-sm text-center text-sm sm:text-base">Choose a contact from the left sidebar to start chatting or check your messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ChatUI;
