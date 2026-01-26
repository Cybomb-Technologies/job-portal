import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, Briefcase, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notifications State
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const desktopNotificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        const isDesktopOutside = desktopNotificationRef.current && !desktopNotificationRef.current.contains(event.target);
        const isMobileOutside = mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target);

        if (isDesktopOutside && isMobileOutside) {
            setShowNotifications(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    if (user) {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    }
  };

  React.useEffect(() => {
    fetchNotifications();

    // Socket.io Connection
    const socket = io(import.meta.env.VITE_SERVER_URL);

    if (user) {
        socket.emit('join', user._id);
        if (user.role === 'Admin') {
            socket.emit('join', 'admin-room');
        }
    }

    socket.on('notification', (data) => {
        // Play notification sound
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));

        // Show Toast
        Swal.fire({
            icon: 'info',
            title: data.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        // Refresh list
        fetchNotifications();
    });

    return () => {
        socket.disconnect();
    };
  }, [user]);

  const handleNotificationClick = async (notification) => {
      try {
          if (!notification.isRead) {
              await api.put(`/notifications/${notification._id}/read`);
              setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
          }

          // Navigation Logic
          switch (notification.type) {
              case 'SYSTEM':
                  if (notification.message.toLowerCase().includes('verification')) {
                      navigate('/employer/verification');
                  }
                  break;
              case 'NEW_APPLICATION':
                  navigate('/employer/my-jobs');
                  break;
              case 'JOB_ALERT':
                  navigate(`/job/${notification.relatedId}`); // Assuming relatedId is jobId
                  break;
              default:
                  // Default navigation if needed
                  break;
          }
          
          setShowNotifications(false);
      } catch (err) {
          console.error("Failed to mark read", err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || 'Failed to mark notification as read',
            toast: true,
            position: 'top-end',
            timer: 3000
          });
      }
  };

  const markAllRead = async () => {
      try {
          await api.put('/notifications/read-all');
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
      } catch (err) {
          console.error("Failed to mark all read");
      }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Career Tips', path: '/career-tips' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const employerNavItems = [
    { name: 'Dashboard', path: '/employer/dashboard' },
    { name: 'Post Job', path: '/employer/post-job' },
    { name: 'My Jobs', path: '/employer/my-jobs' },
    { name: 'Find Candidates', path: '/employer/candidates' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Verification', path: '/employer/verification' },
  ];

  const currentNavItems = user?.role === 'Employer' ? employerNavItems : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={user?.role === 'Employer' ? "/employer/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300 group-hover:scale-105">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight font-display">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

{/* Search Bar Removed */}

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {user ? (
              <>
                 {/* Notification Bell */}
                 <div className="relative" ref={desktopNotificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 relative hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-105 hover:text-blue-600 text-gray-500"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-fadeIn">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                                <h3 className="font-bold text-gray-900 font-display">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 text-sm font-medium">No new notifications</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification._id} 
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-blue-50/20' : ''}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 transition-all ${!notification.isRead ? 'bg-blue-500 scale-100' : 'bg-gray-200 scale-75'}`}></div>
                                                <div>
                                                    <p className={`text-sm transition-colors ${!notification.isRead ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-1.5 block font-medium">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 <Link to={user.role === 'Employer' ? "/employer/profile" : "/profile"} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 shadow-inner">
                    <User className="w-5 h-5" />
                  </div>
                </Link>
                <button
                  onClick={() => {
                      logout();
                      window.location.href = '/';
                  }}
                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all hover:shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-gray-600 font-bold hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-7 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-4">
            {user && (
                 <div className="relative" ref={mobileNotificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 relative hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell className="w-6 h-6 text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    {/* Mobile Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-14 w-[85vw] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 font-display">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-blue-600 font-bold hover:underline">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification._id} 
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notification.isRead ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 text-left">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-1 block text-left">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

{/* Mobile Search Content Removed */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {currentNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `font-bold py-3 px-4 rounded-xl ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              <div className="pt-6 mt-2 border-t border-gray-100 space-y-4 px-2">
                {user ? (
                   <>
                    <NavLink
                        to={user.role === 'Employer' ? "/employer/profile" : "/profile"}
                        className="flex items-center justify-center gap-2 w-full text-center py-3 text-gray-700 font-bold hover:text-blue-600 bg-gray-50 rounded-xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <User className="w-5 h-5" /> My Profile
                    </NavLink>

                    
                     <button
                        onClick={() => {
                        logout();
                        window.location.href = '/';
                        }}
                        className="block w-full text-center py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50"
                    >
                        Logout
                    </button>
                   </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    className="block text-center py-3 border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-center py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;