import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Briefcase, Lock, HelpCircle } from 'lucide-react';

const ProfileSidebar = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Account</h3>
            </div>
            <nav className="flex flex-col p-2 space-y-1">
                <NavLink 
                    to="/profile" 
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
                    <span>Profile Details</span>
                </NavLink>

                <NavLink 
                    to="/profile/applications" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Briefcase className="w-5 h-5" />
                    <span>Applied Jobs</span>
                </NavLink>

                <NavLink 
                    to="/profile/tickets" 
                    className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-[#4169E1]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>My Tickets</span>
                </NavLink>

                <NavLink 
                    to="/profile/password" 
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

export default ProfileSidebar;
