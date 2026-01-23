import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'For Job Seekers': [
      { name: 'Search Jobs', path: '/jobs' },
      { name: 'Create Resume', path: '/resume-builder' },
      { name: 'Career Tips', path: '/career-advice' },
      { name: 'Salary Calculator', path: '/salary-calculator' },
    ],
    'For Employers': [
      { name: 'Post a Job', path: '/employers/post-job' },
      { name: 'Search Candidates', path: '/employers/candidates' },
      { name: 'Employer Login', path: '/employers/login' },
      { name: 'Pricing', path: '/pricing' },
    ],
    'Company': [
      { name: 'About Us', path: '/about' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Report Issue', path: '/report-issue' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight font-display">
                Job<span className="text-blue-500">Portal</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Connecting the world's best talent with top-tier companies. 
              Your next career move starts here.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a 
                    key={i} 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-bold text-lg mb-6 font-display">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 block text-sm font-medium"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter & Bottom */}
        <div className="border-t border-slate-800 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-sm text-slate-500 font-medium">
                    © {new Date().getFullYear()} JobPortal Inc. All rights reserved.
                </div>
                <div className="flex items-center gap-8">
                    <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Cookies</a>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;