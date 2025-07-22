import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Server,
  Monitor,
  Wifi,
  Shield,
  Database,
  HardDrive,
  Activity,
  AlertTriangle,
  Globe,
  Lock,
  FileText,
  Container,
  Zap,
  Camera,
  Thermometer,
  Battery,
  Settings,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Home,
  Eye,
  CheckCircle,
  Clock,
  Power,
  Cpu,
  BarChart3
} from 'lucide-react';

export const HomeLabSidebar = ({ onAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'Infrastructure': true,
    'Network & Security': true,
    'Smart Home & IoT': false,
    'Monitoring & Logs': false,
    'Media & Files': false
  });
  const [systemStats, setSystemStats] = useState({
    uptime: 99.2,
    services: { online: 18, total: 20 },
    alerts: 3,
    activeUsers: 4,
    cpuUsage: 23,
    memoryUsage: 67,
    networkLoad: 45
  });

  const isActive = (path) => location.pathname === path;

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        alerts: Math.max(0, prev.alerts + Math.floor(Math.random() * 3) - 1),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
        networkLoad: Math.max(10, Math.min(80, prev.networkLoad + Math.floor(Math.random() * 8) - 4))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  const menuItems = [
    {
      section: 'Infrastructure',
      icon: <Server className="w-4 h-4" />,
      badge: `${systemStats.services.online}/${systemStats.services.total}`,
      badgeColor: systemStats.services.online === systemStats.services.total ? 'green' : 'orange',
      items: [
        { 
          name: 'Overview', 
          path: '/homelab', 
          icon: <Home className="w-4 h-4" />,
          description: 'System dashboard and quick stats',
          badge: systemStats.alerts > 0 ? systemStats.alerts.toString() : null,
          badgeColor: 'red'
        },
        { 
          name: 'Servers', 
          path: '/servers', 
          icon: <Server className="w-4 h-4" />,
          description: 'Physical and virtual servers',
          badge: 'ONLINE',
          badgeColor: 'green'
        },
        { 
          name: 'Docker', 
          path: '/docker', 
          icon: <Container className="w-4 h-4" />,
          description: 'Container management',
          badge: '12',
          badgeColor: 'blue'
        },
        { 
          name: 'Storage', 
          path: '/storage', 
          icon: <HardDrive className="w-4 h-4" />,
          description: 'Disk usage and backups',
          badge: '78%',
          badgeColor: 'yellow'
        },
        { 
          name: 'System Metrics', 
          path: '/metrics', 
          icon: <Activity className="w-4 h-4" />,
          description: 'Performance monitoring',
          badge: `${systemStats.cpuUsage}%`,
          badgeColor: systemStats.cpuUsage > 80 ? 'red' : systemStats.cpuUsage > 60 ? 'yellow' : 'green'
        }
      ]
    },
    {
      section: 'Network & Security',
      icon: <Shield className="w-4 h-4" />,
      badge: 'SECURE',
      badgeColor: 'green',
      items: [
        { 
          name: 'Network Monitor', 
          path: '/network', 
          icon: <Wifi className="w-4 h-4" />,
          description: 'Traffic and bandwidth monitoring',
          badge: `${systemStats.networkLoad}%`,
          badgeColor: 'blue'
        },
        { 
          name: 'Firewall', 
          path: '/firewall', 
          icon: <Shield className="w-4 h-4" />,
          description: 'Security rules and policies',
          badge: 'ACTIVE',
          badgeColor: 'green'
        },
        { 
          name: 'VPN Manager', 
          path: '/vpn', 
          icon: <Globe className="w-4 h-4" />,
          description: 'Remote access management',
          badge: '3',
          badgeColor: 'purple'
        },
        { 
          name: 'Intrusion Detection', 
          path: '/ids', 
          icon: <Lock className="w-4 h-4" />,
          description: 'Security threat monitoring',
          badge: 'OK',
          badgeColor: 'green'
        },
        { 
          name: 'Pi-hole', 
          path: '/pihole', 
          icon: <Database className="w-4 h-4" />,
          description: 'DNS filtering and ad blocking',
          badge: 'RUNNING',
          badgeColor: 'green'
        }
      ]
    },
    {
      section: 'Smart Home & IoT',
      icon: <Zap className="w-4 h-4" />,
      badge: '24',
      badgeColor: 'purple',
      items: [
        { 
          name: 'Smart Devices', 
          path: '/devices', 
          icon: <Zap className="w-4 h-4" />,
          description: 'IoT device management',
          badge: '24',
          badgeColor: 'purple'
        },
        { 
          name: 'Sensors', 
          path: '/sensors', 
          icon: <Thermometer className="w-4 h-4" />,
          description: 'Environmental monitoring',
          badge: '8',
          badgeColor: 'blue'
        },
        { 
          name: 'Security Cameras', 
          path: '/cameras', 
          icon: <Camera className="w-4 h-4" />,
          description: 'Video surveillance system',
          badge: 'REC',
          badgeColor: 'red'
        },
        { 
          name: 'Energy Monitor', 
          path: '/energy', 
          icon: <Battery className="w-4 h-4" />,
          description: 'Power consumption tracking',
          badge: '2.4kW',
          badgeColor: 'orange'
        },
        { 
          name: 'Automation', 
          path: '/automation', 
          icon: <Settings className="w-4 h-4" />,
          description: 'Smart home automation rules',
          badge: '15',
          badgeColor: 'indigo'
        }
      ]
    },    {
      section: 'Monitoring & Logs',
      icon: <Eye className="w-4 h-4" />,
      badge: systemStats.alerts.toString(),
      badgeColor: systemStats.alerts > 0 ? 'red' : 'green',
      items: [
        { 
          name: 'Visualization Hub', 
          path: '/homelab/visualizations', 
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Charts, graphs & flow diagrams',
          badge: 'NEW',
          badgeColor: 'purple'
        },
        { 
          name: 'System Logs', 
          path: '/logs', 
          icon: <FileText className="w-4 h-4" />,
          description: 'Application and system logs',
          badge: 'LIVE',
          badgeColor: 'green'
        },
        { 
          name: 'Access Logs', 
          path: '/access', 
          icon: <Users className="w-4 h-4" />,
          description: 'User access monitoring',
          badge: systemStats.activeUsers.toString(),
          badgeColor: 'blue'
        },
        { 
          name: 'Alerts', 
          path: '/alerts', 
          icon: <AlertTriangle className="w-4 h-4" />,
          description: 'System alerts and notifications',
          badge: systemStats.alerts > 0 ? systemStats.alerts.toString() : null,
          badgeColor: 'red'
        },
        { 
          name: 'Uptime Monitor', 
          path: '/uptime', 
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Service availability tracking',
          badge: `${systemStats.uptime}%`,
          badgeColor: 'green'
        }
      ]
    },
    {
      section: 'Media & Files',
      icon: <Monitor className="w-4 h-4" />,
      badge: 'ONLINE',
      badgeColor: 'green',
      items: [
        { 
          name: 'Media Server', 
          path: '/media', 
          icon: <Monitor className="w-4 h-4" />,
          description: 'Streaming and media management',
          badge: 'PLEX',
          badgeColor: 'orange'
        },
        { 
          name: 'File Server', 
          path: '/files', 
          icon: <HardDrive className="w-4 h-4" />,
          description: 'Network attached storage',
          badge: 'NAS',
          badgeColor: 'blue'
        }
      ]    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onAction) onAction();
  };

  const getBadgeColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="w-64 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto shadow-sm">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Home Lab</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Control Center</p>
            </div>
          </div>
          
          {/* Quick Status Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{systemStats.services.online}/{systemStats.services.total}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Services</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{systemStats.cpuUsage}%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">CPU</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <AlertTriangle className={`w-3 h-3 ${systemStats.alerts > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{systemStats.alerts}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alerts</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Sections */}
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.section)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-md group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900 dark:group-hover:to-indigo-900 transition-all duration-200">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.section}
                  </h3>
                  {section.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(section.badgeColor)}`}>
                      {section.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 transition-transform duration-200">
                {expandedSections[section.section] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
            
            {/* Section Items */}
            {expandedSections[section.section] && (
              <div className="mt-2 space-y-1 pl-2">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-md transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(item.badgeColor)}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Enhanced System Status */}
        <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">System Status</h4>
          </div>
          
          <div className="space-y-3">
            {/* Uptime */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Uptime</span>
              </div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">{systemStats.uptime}%</span>
            </div>
            
            {/* Services */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Services</span>
              </div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{systemStats.services.online}/{systemStats.services.total}</span>
            </div>
            
            {/* CPU Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">CPU</span>
              </div>
              <span className={`text-xs font-medium ${
                systemStats.cpuUsage > 80 ? 'text-red-600 dark:text-red-400' : 
                systemStats.cpuUsage > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {systemStats.cpuUsage}%
              </span>
            </div>
            
            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Power className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Memory</span>
              </div>
              <span className={`text-xs font-medium ${
                systemStats.memoryUsage > 90 ? 'text-red-600 dark:text-red-400' : 
                systemStats.memoryUsage > 75 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {systemStats.memoryUsage}%
              </span>
            </div>
            
            {/* Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-3 h-3 ${systemStats.alerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-700 dark:text-gray-300">Alerts</span>
              </div>
              <span className={`text-xs font-medium ${
                systemStats.alerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {systemStats.alerts}
              </span>
            </div>
            
            {/* Active Users */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Users</span>
              </div>
              <span className="text-xs font-medium text-teal-700 dark:text-teal-300">{systemStats.activeUsers}</span>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLabSidebar;
