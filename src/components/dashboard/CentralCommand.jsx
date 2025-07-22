import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import MasterNavigation from '../navigation/MasterNavigation';
import { ChatWidget } from '../chat/ChatWidget';
import {
  Activity,
  AlertTriangle,
  CheckSquare,
  Clock,
  Server,
  Wifi,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Database,
  Monitor,
  ChevronRight,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  Camera,
  Lock,
  Globe,
  Thermometer,
  Battery,
  HardDrive
} from 'lucide-react';

const CentralCommand = () => {
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  const [systemStatus, setSystemStatus] = useState({
    uptime: '99.2%',
    activeServices: 18,
    totalServices: 20,
    alerts: 3,
    networkTraffic: '1.2 TB',
    activeUsers: 4,
    lastUpdate: new Date()
  });

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        alerts: Math.max(0, prev.alerts + Math.floor(Math.random() * 3) - 1),
        lastUpdate: new Date()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return !t.completed && dueDate < new Date();
    }).length,
    today: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length
  };

  // Quick action cards
  const quickActions = [
    {
      title: 'Task Manager',
      description: 'Manage your tasks and projects',
      icon: <CheckSquare className="w-8 h-8" />,
      route: '/tasks',
      color: 'from-blue-500 to-blue-600',
      stats: [
        { label: 'Active', value: taskStats.pending },
        { label: 'Due Today', value: taskStats.today }
      ]
    },
    {
      title: 'System Monitor',
      description: 'Monitor infrastructure health',
      icon: <Monitor className="w-8 h-8" />,
      route: '/metrics',
      color: 'from-green-500 to-green-600',
      stats: [
        { label: 'Uptime', value: systemStatus.uptime },
        { label: 'Services', value: `${systemStatus.activeServices}/${systemStatus.totalServices}` }
      ]
    },
    {
      title: 'Network Status',
      description: 'Network monitoring and analysis',
      icon: <Wifi className="w-8 h-8" />,
      route: '/network',
      color: 'from-purple-500 to-purple-600',
      stats: [
        { label: 'Traffic', value: systemStatus.networkTraffic },
        { label: 'Users', value: systemStatus.activeUsers }
      ]
    },
    {
      title: 'Security Center',
      description: 'Security monitoring and controls',
      icon: <Shield className="w-8 h-8" />,
      route: '/firewall',
      color: 'from-red-500 to-red-600',
      stats: [
        { label: 'Alerts', value: systemStatus.alerts },
        { label: 'Status', value: 'Secure' }
      ]
    }
  ];

  // Feature sections
  const featureSections = [
    {
      title: 'Productivity & Management',
      description: 'Task management, notes, and productivity tools',
      icon: <FileText className="w-6 h-6" />,
      items: [
        { name: 'Tasks', route: '/tasks', icon: <CheckSquare className="w-5 h-5" />, description: 'Task management system' },
        { name: 'Notes', route: '/notes', icon: <FileText className="w-5 h-5" />, description: 'Note-taking and documentation' },
        { name: 'Research', route: '/research', icon: <BookOpen className="w-5 h-5" />, description: 'Research notebooks' },
        { name: 'Calendar', route: '/calendar', icon: <Calendar className="w-5 h-5" />, description: 'Schedule management' }
      ]
    },
    {
      title: 'Infrastructure Management',
      description: 'Server, network, and system administration',
      icon: <Server className="w-6 h-6" />,
      items: [
        { name: 'Servers', route: '/servers', icon: <Server className="w-5 h-5" />, description: 'Server management' },
        { name: 'Docker', route: '/docker', icon: <Database className="w-5 h-5" />, description: 'Container orchestration' },
        { name: 'Storage', route: '/storage', icon: <HardDrive className="w-5 h-5" />, description: 'Storage monitoring' },
        { name: 'Network', route: '/network', icon: <Wifi className="w-5 h-5" />, description: 'Network administration' }
      ]
    },
    {
      title: 'Security & Monitoring',
      description: 'Security tools and system monitoring',
      icon: <Shield className="w-6 h-6" />,
      items: [
        { name: 'Firewall', route: '/firewall', icon: <Shield className="w-5 h-5" />, description: 'Firewall management' },
        { name: 'IDS', route: '/ids', icon: <Lock className="w-5 h-5" />, description: 'Intrusion detection' },
        { name: 'VPN', route: '/vpn', icon: <Globe className="w-5 h-5" />, description: 'VPN management' },
        { name: 'Logs', route: '/logs', icon: <FileText className="w-5 h-5" />, description: 'System logs' }
      ]
    },
    {
      title: 'Smart Home & IoT',
      description: 'Home automation and IoT device management',
      icon: <Thermometer className="w-6 h-6" />,
      items: [
        { name: 'Devices', route: '/devices', icon: <Zap className="w-5 h-5" />, description: 'Smart device control' },
        { name: 'Sensors', route: '/sensors', icon: <Thermometer className="w-5 h-5" />, description: 'Environmental monitoring' },
        { name: 'Cameras', route: '/cameras', icon: <Camera className="w-5 h-5" />, description: 'Security cameras' },
        { name: 'Energy', route: '/energy', icon: <Battery className="w-5 h-5" />, description: 'Energy monitoring' }
      ]
    }
  ];

  const handleQuickAction = (route) => {
    navigate(route);
  };

  const getStatusColor = (alerts) => {
    if (alerts === 0) return 'text-green-600';
    if (alerts <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MasterNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome to EDEN Central Command
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Your unified control center for productivity, infrastructure, and home automation
              </p>
            </div>
            <ChatWidget />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}</span>
            <span className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${systemStatus.alerts === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              System Status: {systemStatus.alerts === 0 ? 'Optimal' : 'Needs Attention'}
            </span>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => handleQuickAction(action.route)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${action.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {action.icon}
                  </div>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  {action.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Sections */}
        <div className="space-y-8">
          {featureSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => navigate(item.route)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-md mr-3 transition-colors">
                        {item.icon}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${task.completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="text-sm font-medium text-gray-900">{task.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/tasks')}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Tasks
            </button>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-3">
              {systemStatus.alerts > 0 ? (
                Array.from({ length: Math.min(systemStatus.alerts, 3) }, (_, index) => (
                  <div key={index} className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        System Alert {index + 1}
                      </div>
                      <div className="text-xs text-gray-600">
                        Requires attention - Click to investigate
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-500 mr-3" />
                  <div className="text-sm font-medium text-gray-900">
                    All systems operational
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/alerts')}
              className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralCommand;
