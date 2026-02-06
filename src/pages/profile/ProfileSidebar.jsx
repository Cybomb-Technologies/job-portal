import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Briefcase, HelpCircle, Building, Bookmark, Settings } from 'lucide-react';

const ProfileSidebar = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Account</h3>
            </div>
            <nav className="flex flex-col p-2 space-y-1">
                <NavLink 
                    to="/profile" 
                    end
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <User className="w-5 h-5" />
                    <span>Profile Details</span>
                </NavLink>

                <NavLink 
                    to="/profile/applications" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <Briefcase className="w-5 h-5" />
                    <span>Applied Jobs</span>
                </NavLink>

                <NavLink 
                    to="/profile/saved-jobs" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <Bookmark className="w-5 h-5" />
                    <span>Saved Jobs</span>
                </NavLink>

                <NavLink 
                    to="/profile/tickets" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>My Tickets</span>
                </NavLink>

                <NavLink 
                    to="/profile/following" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <Building className="w-5 h-5" />
                    <span>Following Companies</span>
                </NavLink>

                <NavLink 
                    to="/profile/settings" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4169E1]' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`
                    }
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default ProfileSidebar;
