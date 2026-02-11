import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api';

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use a ref to keep track of currentChat in socket listeners to avoid stale closures
  const currentChatRef = useRef(currentChat);
  
  // Refs for debouncing and preventing duplicate calls
  const fetchTimeoutRef = useRef(null);
  const lastFetchRef = useRef(0);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // Debounced fetch function to prevent too many requests
  const fetchConversations = useCallback(async (force = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    
    const now = Date.now();
    const minInterval = 2000; // Minimum 2 seconds between fetches
    
    // If not forced and called too recently, debounce
    if (!force && now - lastFetchRef.current < minInterval) {
      // Clear existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Schedule a fetch after the minimum interval
      fetchTimeoutRef.current = setTimeout(() => {
        fetchConversations(true);
      }, minInterval - (now - lastFetchRef.current));
      return;
    }
    
    try {
      isFetchingRef.current = true;
      lastFetchRef.current = now;
      
      // api instance already has baseURL /api and handles Auth header
      const res = await api.get('/messages');
      setConversations(res.data);
      // Calculate total unread
      const totalUnread = res.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching conversations", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Socket.io initialization
      const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api', '');
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      newSocket.emit('join', user._id);

      newSocket.on('messages_read', ({ readerId }) => {
          if (currentChatRef.current && (currentChatRef.current.user._id === readerId || currentChatRef.current.user._id === readerId.toString())) {
              setMessages(prev => prev.map(msg => 
                  (msg.sender === user._id || msg.sender?._id === user._id) ? { ...msg, read: true } : msg
              ));
          }
      });

      newSocket.on('force_logout', (data) => {
          // alert(data.message || 'You have been logged out.');
          logout();
          window.location.href = '/login';
      });

      newSocket.on('receive_message', (message) => {
        // Only process if it's from another user (not self)
        if (message.sender !== user._id) {
          // Check if we're currently viewing this sender's chat
          if (currentChatRef.current && message.sender === currentChatRef.current.user._id) {
             // Append message directly instead of refetching everything to avoid flicker
             setMessages(prev => [...prev, message]);
             
            // Mark as read immediately since we're viewing this chat
            markAsReadQuiet(message.sender);
          }
        }
        // Refresh conversations list (debounced)
        fetchConversations();
      });

      // Initial fetch
      fetchConversations(true);

      return () => {
        newSocket.disconnect();
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    }
  }, [user, fetchConversations]);

  // Polling interval for auto-refresh - increased to 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000); // Refresh every 30 seconds instead of 10
    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  const fetchMessages = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setLoading(false);
    }
  };

  // Quiet version that doesn't trigger extra fetches
  const markAsReadQuiet = async (senderId) => {
      try {
          await api.put(`/messages/read/${senderId}`);
          setConversations(prev => prev.map(c => 
              c.user._id === senderId ? { ...c, unreadCount: 0 } : c
          ));
      } catch (error) {
          console.error("Error marking messages as read", error);
      }
  };

  const markAsRead = async (senderId) => {
      try {
          await api.put(`/messages/read/${senderId}`);
          // Update local state
          setConversations(prev => {
              const updated = prev.map(c => 
                  c.user._id === senderId ? { ...c, unreadCount: 0 } : c
              );
              // Recalculate unread count from updated state
              const totalUnread = updated.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
              setUnreadCount(totalUnread);
              return updated;
          });
      } catch (error) {
          console.error("Error marking messages as read", error);
      }
  };

  const selectChat = (conversation) => {
      if (!conversation) {
          setCurrentChat(null);
          setMessages([]);
          return;
      }
      setCurrentChat(conversation);
      fetchMessages(conversation.user._id);
      if (conversation.unreadCount > 0) {
          markAsRead(conversation.user._id);
      }
  };

  const sendMessage = async (receiverId, content, relatedJob = null) => {
    try {
      const payload = { receiverId, content };
      if (relatedJob) {
          payload.relatedJob = relatedJob;
      }
      const res = await api.post('/messages/send', payload);
      
      // Optimistically add message if it's the current chat
      if (currentChat && currentChat.user._id === receiverId) {
          setMessages((prev) => [...prev, res.data]);
      }
      
      fetchConversations(); // Update list order (will be debounced)
      return res.data;
    } catch (error) {
        console.error("Error sending message", error);
        throw error;
    }
  };
  
  // Expose initiateChat to start a conversation with a specific user (even if no history)
  const initiateChat = (targetUser, jobContext = null) => {
      // Check if conversation already exists
      const existing = conversations.find(c => c.user._id === targetUser._id);
      if (existing) {
          selectChat(existing);
          // If job context is provided, we might want to attach it to the current chat state temporarily
          // so the UI knows to send it with the next message.
          if (jobContext) {
              setCurrentChat(prev => ({ ...prev, jobContext }));
          }
      } else {
          // Create temporary conversation object
          const newConv = { user: targetUser, lastMessage: null, unreadCount: 0, jobContext };
          setCurrentChat(newConv);
          setMessages([]); // Empty start
      }
  };

  const deleteChat = async (userId) => {
      try {
          await api.delete(`/messages/${userId}`);
          setConversations(prev => prev.filter(c => c.user._id !== userId));
          if (currentChat && currentChat.user._id === userId) {
              setMessages([]);
          }
      } catch (error) {
          console.error("Error deleting chat", error);
          throw error;
      }
  };

  const fetchTeamMemberConversations = async (memberId) => {
      try {
          const res = await api.get(`/messages/team/${memberId}/conversations`);
          return res.data;
      } catch (error) {
          console.error("Error fetching team member conversations", error);
          return [];
      }
  };

  const fetchTeamMemberMessages = async (memberId, otherUserId) => {
      try {
          const res = await api.get(`/messages/team/${memberId}/${otherUserId}`);
          return res.data;
      } catch (error) {
          console.error("Error fetching team member messages", error);
          return [];
      }
  };

  const value = {
    socket,
    conversations,
    currentChat,
    messages,
    loading,
    unreadCount,
    selectChat,
    sendMessage,
    initiateChat,
    fetchConversations,
    fetchConversations,
    markAsRead,
    deleteChat,
    fetchTeamMemberConversations,
    fetchTeamMemberMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
