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
  FiBell
} from 'react-icons/fi';
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
        const socket = io('http://localhost:8000');

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

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark read");
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
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: <FiGrid />, path: '/admin/dashboard' },
        { name: 'Users', icon: <FiUsers />, path: '/admin/users' },
        { name: 'Employers', icon: <FiBriefcase />, path: '/admin/employers' },
        { name: 'Companies', icon: <FiLayers />, path: '/admin/companies' },
        { name: 'Support', icon: <FiHelpCircle />, path: '/admin/support' },
    ];

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <FiShield className="admin-logo-icon" />
                    <span>Admin Panel</span>
                </div>
                
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) => 
                                isActive ? 'admin-nav-item active' : 'admin-nav-item'
                            }
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
                                                    onClick={() => markAsRead(notification._id)}
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
                                    <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:8000${user.profilePicture}`} alt="" />
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
