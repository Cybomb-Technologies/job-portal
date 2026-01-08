import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Search, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Career Tips', path: '/career-tips' },
  ];

  const employerNavItems = [
    { name: 'Dashboard', path: '/employer/dashboard' },
    { name: 'Post Job', path: '/employer/post-job' },
    { name: 'My Jobs', path: '/employer/my-jobs' },
  ];

  const currentNavItems = user?.role === 'Employer' ? employerNavItems : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user?.role === 'Employer' ? "/employer/dashboard" : "/"} className="flex items-center space-x-2 users-button">
            <div className="w-8 h-8 bg-[#4169E1] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `font-medium transition-colors hover:text-[#4169E1] ${
                    isActive ? 'text-[#4169E1]' : 'text-black'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

{/* Search Bar Removed */}

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                 <Link to="/profile" className="text-black hover:text-[#4169E1]">
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={() => {
                      logout();
                      window.location.href = '/';
                  }}
                  className="px-6 py-2 border-2 border-[#4169E1] text-[#4169E1] rounded-lg font-medium hover:bg-[#4169E1] hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 border-2 border-[#4169E1] text-[#4169E1] rounded-lg font-medium hover:bg-[#4169E1] hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-[#3A5FCD]"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
{/* Mobile Search Toggle Removed */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:text-[#4169E1]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

{/* Mobile Search Content Removed */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {currentNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `font-medium py-2 ${
                      isActive ? 'text-[#4169E1]' : 'text-black'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                {user ? (
                   <button
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="block w-full text-center py-2 border border-[#4169E1] text-[#4169E1] rounded-lg font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                  <Link
                    to="/login"
                    className="block text-center py-2 border border-[#4169E1] text-[#4169E1] rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-center py-2 bg-[#4169E1] text-white rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                  </>
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