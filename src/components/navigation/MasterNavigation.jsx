import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Server, 
  Settings, 
  Bell, 
  Search, 
  User,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  MessageCircle
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';

export const MasterNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTaskContext();

  const navigationSections = [
    {
      id: 'dashboard',
      name: 'Central Command',
      path: '/',
      icon: <Home className="w-5 h-5" />,
      description: 'Main control center'
    },
    {
      id: 'tasks',
      name: 'Productivity',
      path: '/tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      description: 'Task and project management'
    },
    {
      id: 'homelab',
      name: 'Home Lab',
      path: '/homelab',
      icon: <Server className="w-5 h-5" />,
      description: 'Infrastructure management'
    }
  ];

  const isActiveSection = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">EDEN</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div className="flex items-center justify-center space-x-1">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavigation(section.path)}                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveSection(section.path)
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  }`}
                  title={section.description}
                >
                  {section.icon}
                  <span className="ml-2">{section.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/10">
              <Search className="w-5 h-5" />
            </button>
            
            {/* AI Chat */}
            <button 
              onClick={() => handleNavigation('/chat')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/10"
              title="AI Assistant"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/10 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/10 transition-colors"
              >                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border">
                  <img 
                    src="/assets/eden-profile.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-muted items-center justify-center text-muted-foreground text-sm font-medium hidden">
                    E
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>              {/* Profile Dropdown */}
              {isProfileMenuOpen && (                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-20">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground">EDEN Admin</p>
                    <p className="text-xs text-muted-foreground">System Administrator</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent/10">
                    Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent/10">
                    Preferences
                  </button><button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Theme toggle clicked, current darkMode:', darkMode);
                      toggleTheme();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent/10 flex items-center cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-4 h-4 mr-2" />
                        Light Theme
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Dark Theme
                      </>
                    )}
                  </button>
                  <hr className="my-1" />                  <button className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-muted/20">
            {navigationSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavigation(section.path)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveSection(section.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                {section.icon}
                <span className="ml-3">{section.name}</span>
              </button>
            ))}
            
            {/* AI Chat for mobile */}
            <button
              onClick={() => handleNavigation('/chat')}
              className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === '/chat'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="ml-3">AI Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}      {/* Overlay for profile menu */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default MasterNavigation;
