import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiHelpCircle,
  FiLogOut,
  FiShield,
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';
import {
  Building2,
  MessageSquare,
  CheckSquare,
  Mail
} from 'lucide-react';
import './AdminLayout.css';
import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Notifications Logic
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
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

    useEffect(() => {
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

            // Navigation Logic for Admin
            switch (notification.type) {
                case 'NEW_ISSUE':
                case 'ISSUE_UPDATE':
                    navigate('/admin/support');
                    break;
                case 'CONTACT_FORM':
                    navigate('/admin/messages');
                    break;
                case 'SYSTEM':
                    if (notification.message.toLowerCase().includes('verification')) {
                        navigate('/admin/verifications');
                    }
                    else if (notification.relatedModel === 'User') {
                         navigate('/admin/users');
                    }
                    break;
                case 'JOB_ALERT': // If admin gets alerts about jobs
                    navigate('/admin/dashboard'); 
                    break;
                case 'COMPANY_UPDATE':
                    navigate('/admin/company-updates');
                    break;
                default:
                    break;
            }
             setShowNotifications(false);
        } catch (err) {
            console.error("Failed to mark read", err);
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

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const navItems = [
        { name: 'Dashboard', icon: <FiGrid />, path: '/admin/dashboard' },
        { name: 'Users', icon: <FiUsers />, path: '/admin/users' },
        { name: 'Employers', icon: <FiBriefcase />, path: '/admin/employers' },
        { name: 'Companies', path: '/admin/companies', icon: <Building2 /> },
        { name: 'Updates', path: '/admin/company-updates', icon: <FiLayers /> },
        { name: 'Verifications', path: '/admin/verifications', icon: <CheckSquare /> },
        { name: 'Messages', path: '/admin/messages', icon: <Mail /> },
        { name: 'Support', path: '/admin/support', icon: <MessageSquare /> }
    ];

    return (
        <div className="admin-container admin-layout">
            {/* Overlay for mobile */}
            {isSidebarOpen && <div className="admin-overlay" onClick={closeSidebar}></div>}

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <FiShield className="admin-logo-icon" />
                    <span>Admin Panel</span>
                    <button className="md:hidden ml-auto text-gray-500" onClick={closeSidebar}>
                        <FiX size={24} />
                    </button>
                </div>
                
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) => 
                                isActive ? 'admin-nav-item active' : 'admin-nav-item'
                            }
                            onClick={closeSidebar}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-search">
                        {/* Add search or other header elements here if needed */}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 -ml-2 text-gray-600" onClick={toggleSidebar}>
                            <FiMenu size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 relative hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                            >
                                <FiBell className="w-6 h-6 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-xs text-[#4169E1] font-bold hover:underline">Mark all read</button>
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
                                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notification.isRead ? 'bg-[#4169E1]' : 'bg-gray-200'}`}></div>
                                                        <div>
                                                            <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <span className="text-xs text-gray-400 mt-1 block">
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

                        <div className="admin-profile-quick">
                            <span className="admin-name">{user?.name || 'Administrator'}</span>
                            <div className="admin-avatar">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`} alt="" />
                                ) : (
                                    (user?.name || 'A').charAt(0)
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
