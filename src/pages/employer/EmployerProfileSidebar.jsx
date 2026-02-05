import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Building2, Lock, PlayCircle, Users, Activity, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EmployerProfileSidebar = () => {
    const { user } = useAuth();
    const isRecruiter = user?.companyRole === 'Recruiter';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Profile Settings</h3>
            </div>
            <nav className="flex flex-col p-2 space-y-1">
                <NavLink 
                    to="/employer/profile" 
                    end
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <User className="w-5 h-5" />
                    <span>Recruiter Info</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/company" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Building2 className="w-5 h-5" />
                    <span>Company Info</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/why-join-us" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <PlayCircle className="w-5 h-5" />
                    <span>Why Join Us</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/reviews" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Reviews</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/team" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Users className="w-5 h-5" />
                    <span>Team Management</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/followers" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Heart className="w-5 h-5" />
                    <span>Followers</span>
                </NavLink>

                {!isRecruiter && (
                    <NavLink 
                        to="/employer/profile/activity-logs" 
                        className={({ isActive }) => 
                            `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                ? 'bg-blue-50 text-[#4169E1]' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Activity className="w-5 h-5" />
                        <span>Activity Logs</span>
                    </NavLink>
                )}

                <NavLink 
                    to="/employer/profile/tickets" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                    <span>My Tickets</span>
                </NavLink>

                <NavLink 
                    to="/employer/profile/password" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default EmployerProfileSidebar;
