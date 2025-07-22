import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';
import { TopNavigation } from '../navigation/TopNavigation';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';

const CentralDashboard = () => {
  console.log('CentralDashboard component loaded!');
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  
  const [systemOverview, setSystemOverview] = useState({
    totalServices: 20,
    onlineServices: 19,
    alerts: 7,
    uptime: 99.2,
    lastUpdate: new Date().toLocaleString()
  });

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed && task.priority !== 'low').length,
    overdue: tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return !task.completed && dueDate < new Date();
    }).length
  };

  // Main feature sections
  const mainSections = [
    {
      title: "Task & Productivity Hub",
      description: "Manage tasks, notes, research, and productivity workflows",
      icon: "📋",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      stats: [
        { label: "Active Tasks", value: taskStats.pending, color: "text-blue-600" },
        { label: "Completed", value: taskStats.completed, color: "text-green-600" },
        { label: "Overdue", value: taskStats.overdue, color: "text-red-600" }
      ],
      features: [
        {
          name: "Task Manager",
          description: "Project and personal task management",
          route: "/tasks",
          icon: "✅",
          status: "online"
        },
        {
          name: "Notes System",
          description: "Documentation and quick notes",
          route: "/notes",
          icon: "📝",
          status: "online"
        },
        {
          name: "Research Hub",
          description: "Research notebooks and analysis",
          route: "/research",
          icon: "🔬",
          status: "online"
        },
        {
          name: "Progress Tracking",
          description: "Project progress monitoring",
          route: "/progress-hub",
          icon: "📈",
          status: "online"
        }
      ]
    },
    {
      title: "Home Lab Infrastructure",
      description: "Monitor and manage your home laboratory infrastructure",
      icon: "🏠",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      stats: [
        { label: "Active Services", value: `${systemOverview.onlineServices}/${systemOverview.totalServices}`, color: "text-green-600" },
        { label: "System Health", value: "98.5%", color: "text-green-600" },
        { label: "Active Alerts", value: systemOverview.alerts, color: "text-orange-600" }
      ],
      features: [
        {
          name: "System Monitor",
          description: "CPU, memory, and performance metrics",
          route: "/metrics",
          icon: "⚡",
          status: "online"
        },
        {
          name: "Network Monitor",
          description: "Network traffic and device monitoring",
          route: "/network",
          icon: "🌐",
          status: "online"
        },
        {
          name: "Server Manager",
          description: "Physical and virtual server management",
          route: "/servers",
          icon: "🖥️",
          status: "online"
        },
        {
          name: "Storage Manager",
          description: "Disk usage and storage monitoring",
          route: "/storage",
          icon: "💽",
          status: "online"
        }
      ]
    },
    {
      title: "Security & Monitoring",
      description: "Advanced security monitoring and threat detection",
      icon: "🔒",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      stats: [
        { label: "Threats Blocked", value: "47", color: "text-red-600" },
        { label: "Active Connections", value: "284", color: "text-blue-600" },
        { label: "Security Level", value: "High", color: "text-green-600" }
      ],
      features: [
        {
          name: "Firewall Manager",
          description: "Firewall rules and connection monitoring",
          route: "/firewall",
          icon: "🛡️",
          status: "online"
        },
        {
          name: "Intrusion Detection",
          description: "Security threat detection and analysis",
          route: "/ids",
          icon: "🔍",
          status: "online"
        },
        {
          name: "VPN Manager",
          description: "VPN server and client management",
          route: "/vpn",
          icon: "🔐",
          status: "online"
        },
        {
          name: "Access Logs",
          description: "Access control and audit logs",
          route: "/access",
          icon: "📋",
          status: "online"
        }
      ]
    },
    {
      title: "Smart Home & Automation",
      description: "IoT devices, sensors, and automation control",
      icon: "💡",
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
      stats: [
        { label: "Devices Online", value: "23", color: "text-green-600" },
        { label: "Automation Rules", value: "12", color: "text-blue-600" },
        { label: "Energy Usage", value: "145W", color: "text-orange-600" }
      ],
      features: [
        {
          name: "Smart Devices",
          description: "IoT device control and automation",
          route: "/devices",
          icon: "💡",
          status: "online"
        },
        {
          name: "Sensors Monitor",
          description: "Environmental sensor monitoring",
          route: "/sensors",
          icon: "🌡️",
          status: "online"
        },
        {
          name: "Automation Rules",
          description: "Home automation rule engine",
          route: "/automation",
          icon: "⚙️",
          status: "online"
        },
        {
          name: "Security Cameras",
          description: "Camera feeds and recording",
          route: "/cameras",
          icon: "📹",
          status: "online"
        }
      ]
    }
  ];

  // Quick access tiles for most used features
  const quickAccess = [
    { name: "Tasks", route: "/tasks", icon: "✅", urgent: taskStats.overdue > 0 },
    { name: "System Metrics", route: "/metrics", icon: "⚡", urgent: false },
    { name: "Alerts", route: "/alerts", icon: "🚨", urgent: systemOverview.alerts > 5 },
    { name: "Network", route: "/network", icon: "🌐", urgent: false },
    { name: "Storage", route: "/storage", icon: "💽", urgent: false },
    { name: "Notes", route: "/notes", icon: "📝", urgent: false }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemOverview(prev => ({
        ...prev,
        alerts: Math.max(0, prev.alerts + Math.floor(Math.random() * 3) - 1),
        lastUpdate: new Date().toLocaleString()
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNavigation = (route) => {
    navigate(route);
  };  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <TopNavigation />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 h-screen sticky top-16 overflow-y-auto">
          <EnhancedNavigation />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">EDEN Central Command</h1>
          <p className="text-xl text-gray-600">
            Unified control center for productivity, home lab infrastructure, and automation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {systemOverview.lastUpdate}
          </p>
        </div>

        {/* Quick Access Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccess.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.route)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  item.urgent 
                    ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                {item.urgent && (
                  <div className="text-xs text-red-600 mt-1">Attention needed</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* System Status Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{taskStats.total}</div>
              <div className="text-blue-100">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{systemOverview.onlineServices}/{systemOverview.totalServices}</div>
              <div className="text-blue-100">Services Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{systemOverview.uptime}%</div>
              <div className="text-blue-100">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{systemOverview.alerts}</div>
              <div className="text-blue-100">Active Alerts</div>
            </div>
          </div>
        </div>

        {/* Main Feature Sections */}
        <div className="space-y-8">
          {mainSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={`rounded-lg border-2 p-6 transition-colors ${section.color}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{section.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                </div>
                
                {/* Section Stats */}
                <div className="hidden md:flex space-x-6">
                  {section.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    onClick={() => handleNavigation(feature.route)}
                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{feature.icon}</span>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)}`}></div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        feature.status === 'online' ? 'bg-green-100 text-green-800' :
                        feature.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feature.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.name}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button className="w-full text-sm bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>EDEN Central Command v2.0</p>
          <p className="text-sm">Unified productivity and home lab management platform</p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralDashboard;
