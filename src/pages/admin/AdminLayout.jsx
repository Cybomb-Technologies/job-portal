import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiGrid, 
  FiUsers, 
  FiBriefcase, 
  FiLayers, 
  FiHelpCircle, 
  FiLogOut,
  FiShield
} from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

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
                </header>
                
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
