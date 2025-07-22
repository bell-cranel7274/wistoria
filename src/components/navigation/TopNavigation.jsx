import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Settings, User, Bell, Search } from 'lucide-react';

export const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      name: 'Central Command', 
      path: '/', 
      icon: <Home className="w-5 h-5" />,
      description: 'Main dashboard'
    },
    { 
      name: 'Home Lab', 
      path: '/homelab', 
      icon: <Settings className="w-5 h-5" />,
      description: 'Infrastructure management'
    },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: <User className="w-5 h-5" />,
      description: 'Task management'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/assets/eden-logo.svg" 
                alt="EDEN" 
                className="h-8 w-8 mr-3"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 className="text-xl font-bold text-gray-900">EDEN Central Command</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 transform translate-x-1 -translate-y-1"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300">
                <img 
                  src="/assets/eden-profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/default-profile.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
