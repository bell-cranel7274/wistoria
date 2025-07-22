import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  // Existing icons
  LayoutGrid,
  StickyNote,
  BookOpen,
  Video,
  Bell,
  BarChart,
  Plus,
  // Home Lab icons
  Wifi,
  Server,
  Container,
  HardDrive,
  Shield,
  Film,
  Folder,
  Key,
  Activity,
  FileText,
  AlertTriangle,
  Clock,
  Lightbulb,
  Thermometer,
  Settings,
  Zap,
  Camera,
  Lock,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    taskManager: true,
    infrastructure: false,
    services: false,
    monitoring: false,
    homeAutomation: false,
    security: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const navigationSections = [
    {
      id: 'taskManager',
      title: 'Task Manager',
      icon: <LayoutGrid className="w-4 h-4" />,
      items: [
        { name: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" />, path: '/', description: 'Main task dashboard' },
        { name: 'Notes', icon: <StickyNote className="w-4 h-4" />, path: '/notes', description: 'Quick notes and documentation' },
        { name: 'Research', icon: <BookOpen className="w-4 h-4" />, path: '/research', description: 'Research notebook' },
        { name: 'Progress Hub', icon: <Video className="w-4 h-4" />, path: '/progress-hub', description: 'Progress tracking' },
        { name: 'Alarms', icon: <Bell className="w-4 h-4" />, path: '/alarm', description: 'Notification system' },
        { name: 'Analytics', icon: <BarChart className="w-4 h-4" />, path: '/chart', description: 'Task analytics and charts' }
      ]
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      icon: <Server className="w-4 h-4" />,
      items: [
        { name: 'Network Monitor', icon: <Wifi className="w-4 h-4" />, path: '/network', description: 'Network devices and bandwidth monitoring' },
        { name: 'Server Status', icon: <Server className="w-4 h-4" />, path: '/servers', description: 'Server management and monitoring' },
        { name: 'Docker Containers', icon: <Container className="w-4 h-4" />, path: '/docker', description: 'Container orchestration and management' },
        { name: 'Storage', icon: <HardDrive className="w-4 h-4" />, path: '/storage', description: 'Disk usage and storage management' }
      ]
    },
    {
      id: 'services',
      title: 'Services',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { name: 'Pi-hole', icon: <Shield className="w-4 h-4" />, path: '/pihole', description: 'DNS filtering and ad blocking' },
        { name: 'Media Server', icon: <Film className="w-4 h-4" />, path: '/media', description: 'Plex/Jellyfin media management' },
        { name: 'File Server', icon: <Folder className="w-4 h-4" />, path: '/files', description: 'Network file sharing and management' },
        { name: 'VPN', icon: <Key className="w-4 h-4" />, path: '/vpn', description: 'VPN server configuration and status' }
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      icon: <Activity className="w-4 h-4" />,
      items: [
        { name: 'System Metrics', icon: <Activity className="w-4 h-4" />, path: '/metrics', description: 'CPU, memory, and performance metrics' },
        { name: 'Logs', icon: <FileText className="w-4 h-4" />, path: '/logs', description: 'System and application logs' },
        { name: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, path: '/alerts', description: 'System alerts and notifications' },
        { name: 'Uptime', icon: <Clock className="w-4 h-4" />, path: '/uptime', description: 'Service uptime monitoring' }
      ]
    },
    {
      id: 'homeAutomation',
      title: 'Home Automation',
      icon: <Lightbulb className="w-4 h-4" />,
      items: [
        { name: 'Smart Devices', icon: <Lightbulb className="w-4 h-4" />, path: '/devices', description: 'Smart home device control' },
        { name: 'Sensors', icon: <Thermometer className="w-4 h-4" />, path: '/sensors', description: 'Temperature and environmental sensors' },
        { name: 'Automation Rules', icon: <Settings className="w-4 h-4" />, path: '/automation', description: 'Home automation rules and scenes' },
        { name: 'Energy Monitor', icon: <Zap className="w-4 h-4" />, path: '/energy', description: 'Power consumption monitoring' }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        { name: 'Cameras', icon: <Camera className="w-4 h-4" />, path: '/cameras', description: 'Security camera feeds and recordings' },
        { name: 'Access Logs', icon: <Lock className="w-4 h-4" />, path: '/access', description: 'System access and authentication logs' },
        { name: 'Firewall', icon: <Shield className="w-4 h-4" />, path: '/firewall', description: 'Network firewall configuration' },
        { name: 'Intrusion Detection', icon: <Search className="w-4 h-4" />, path: '/ids', description: 'Network intrusion detection system' }
      ]
    }
  ];

  const quickActions = [
    { name: '🔄 Restart Services', action: () => console.log('Restart services') },
    { name: '🧹 Clear Logs', action: () => console.log('Clear logs') },
    { name: '📊 System Report', action: () => console.log('Generate report') },
    { name: '🔒 Security Scan', action: () => console.log('Security scan') }
  ];

  return (
    <div className="w-64 h-full bg-card/50 backdrop-blur-sm border-r border-border">
      <div className="p-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 p-4 mb-6 bg-background rounded-lg border border-border">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
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
          <div>
            <div className="font-semibold">EDEN</div>
            <div className="text-xs text-muted-foreground">Home Lab Manager</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-2 mb-6">
          {navigationSections.map((section) => (
            <div key={section.id} className="space-y-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                      }`}
                      title={item.description}
                    >
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full ml-auto opacity-75" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h4>
          <div className="space-y-1">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full text-left p-2 text-xs bg-background border border-border hover:border-primary hover:bg-accent/5 rounded-md transition-all duration-200"
              >
                {action.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service Status Indicators */}
        <div className="mt-6 p-3 bg-background rounded-lg border border-border">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Pi-hole</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Docker</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Media Server</span>
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>VPN</span>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNavigation;
