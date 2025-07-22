import React, { useState, useEffect } from 'react';
import MasterNavigation from '../navigation/MasterNavigation';
import HomeLabSidebar from '../navigation/HomeLabSidebar';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Activity, 
  Shield, 
  HardDrive, 
  Wifi, 
  Database, 
  Monitor, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  Home,
  Camera,
  Thermometer,
  Power,
  Globe,
  Lock,
  Search,
  FileText,
  Settings,
  RefreshCw,
  Play,
  Pause,
  ChevronRight,
  Eye,
  MoreVertical,
  GitBranch
} from 'lucide-react';

const HomeLabDashboard = () => {
  console.log('HomeLabDashboard component loaded!');
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemOverview, setSystemOverview] = useState({
    totalServices: 20,
    onlineServices: 19,
    alerts: 7,
    uptime: 99.2,
    lastUpdate: new Date().toLocaleString(),
    cpuUsage: 23,
    memoryUsage: 67,
    networkLoad: 45,
    powerConsumption: 145
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Home lab feature categories with modern icons and enhanced data
  const homeLabSections = [    {
      category: "System Monitoring",
      description: "Real-time monitoring of system performance, resources, and health metrics",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-400/30 dark:to-cyan-400/30 border-blue-300 dark:border-blue-500 hover:from-blue-500/30 hover:to-cyan-500/30 dark:hover:from-blue-400/40 dark:hover:to-cyan-400/40",
      services: [
        {
          name: "System Metrics",
          description: "CPU, Memory, Disk I/O monitoring with real-time graphs",
          route: "/metrics",
          status: "online",
          icon: <Activity className="w-5 h-5" />,
          metrics: { cpu: "23%", memory: "67%", load: "Low" }
        },
        {
          name: "Uptime Monitor",
          description: "Service availability tracking with SLA monitoring",
          route: "/uptime",
          status: "online",
          icon: <Clock className="w-5 h-5" />,
          metrics: { uptime: "99.2%", incidents: "2", sla: "Met" }
        },
        {
          name: "Log Viewer",
          description: "Centralized log aggregation with search and analytics",
          route: "/logs",
          status: "online",
          icon: <FileText className="w-5 h-5" />,
          metrics: { logs: "2.4K", errors: "12", warnings: "45" }
        },        {
          name: "Alert Manager",
          description: "Intelligent alert notifications with escalation rules",
          route: "/alerts",
          status: "warning",
          icon: <AlertTriangle className="w-5 h-5" />,
          metrics: { active: "7", resolved: "23", muted: "3" }
        },
        {
          name: "Visualization Hub",
          description: "Advanced charts, graphs, and workflow visualizations",
          route: "/homelab/visualizations",
          status: "online",
          icon: <BarChart3 className="w-5 h-5" />,
          metrics: { charts: "12", graphs: "8", flows: "4" }
        }
      ]
    },    {
      category: "Network & Security",
      description: "Comprehensive network monitoring, security analysis, and access control",
      icon: <Shield className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-400/30 dark:to-green-400/30 border-emerald-300 dark:border-emerald-500 hover:from-emerald-500/30 hover:to-green-500/30 dark:hover:from-emerald-400/40 dark:hover:to-green-400/40",
      services: [
        {
          name: "Network Monitor",
          description: "Network traffic analysis and device discovery",
          route: "/network",
          status: "online",
          icon: <Wifi className="w-5 h-5" />,
          metrics: { devices: "24", bandwidth: "847MB", latency: "12ms" }
        },
        {
          name: "Firewall Manager",
          description: "Advanced firewall rules with traffic analysis",
          route: "/firewall",
          status: "online",
          icon: <Shield className="w-5 h-5" />,
          metrics: { rules: "156", blocked: "2.3K", allowed: "45.2K" }
        },
        {
          name: "Intrusion Detection",
          description: "Real-time threat detection and incident response",
          route: "/ids",
          status: "online",
          icon: <Search className="w-5 h-5" />,
          metrics: { threats: "0", scans: "134", clean: "Yes" }
        },
        {
          name: "VPN Manager",
          description: "Secure remote access with user management",
          route: "/vpn",
          status: "online",
          icon: <Lock className="w-5 h-5" />,
          metrics: { connections: "3", users: "8", data: "1.2GB" }
        },
        {
          name: "Access Log Viewer",
          description: "Comprehensive audit trails and access analytics",
          route: "/access",
          status: "online",
          icon: <Eye className="w-5 h-5" />,
          metrics: { logins: "45", failed: "2", sessions: "12" }
        }
      ]
    },    {
      category: "Infrastructure Management",
      description: "Server orchestration, container management, and service deployment",
      icon: <Server className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500/20 to-violet-500/20 dark:from-purple-400/30 dark:to-violet-400/30 border-purple-300 dark:border-purple-500 hover:from-purple-500/30 hover:to-violet-500/30 dark:hover:from-purple-400/40 dark:hover:to-violet-400/40",
      services: [
        {
          name: "Server Manager",
          description: "Multi-server management with health monitoring",
          route: "/servers",
          status: "online",
          icon: <Server className="w-5 h-5" />,
          metrics: { servers: "4", load: "Medium", temp: "45°C" }
        },
        {
          name: "Docker Manager",
          description: "Container orchestration with Kubernetes integration",
          route: "/docker",
          status: "online",
          icon: <Database className="w-5 h-5" />,
          metrics: { containers: "23", images: "15", volumes: "8" }
        },
        {
          name: "Storage Manager",
          description: "Intelligent storage monitoring with RAID management",
          route: "/storage",
          status: "online",
          icon: <HardDrive className="w-5 h-5" />,
          metrics: { used: "2.4TB", free: "1.6TB", health: "Good" }
        },
        {
          name: "Pi-hole Manager",
          description: "DNS filtering with advanced blocking statistics",
          route: "/pihole",
          status: "offline",
          icon: <Globe className="w-5 h-5" />,
          metrics: { blocked: "0", queries: "0", uptime: "0%" }
        }
      ]
    },    {
      category: "Media & File Services",
      description: "Centralized media streaming and file sharing with backup solutions",
      icon: <Monitor className="w-8 h-8" />,
      color: "bg-gradient-to-br from-orange-500/20 to-amber-500/20 dark:from-orange-400/30 dark:to-amber-400/30 border-orange-300 dark:border-orange-500 hover:from-orange-500/30 hover:to-amber-500/30 dark:hover:from-orange-400/40 dark:hover:to-amber-400/40",
      services: [
        {
          name: "Media Server",
          description: "4K media streaming with transcoding capabilities",
          route: "/media",
          status: "online",
          icon: <Play className="w-5 h-5" />,
          metrics: { movies: "1.2K", shows: "150", users: "6" }
        },
        {
          name: "File Server Manager",
          description: "Multi-protocol file sharing with version control",
          route: "/files",
          status: "online",
          icon: <Database className="w-5 h-5" />,
          metrics: { shares: "8", users: "12", sync: "Active" }
        }
      ]
    },    {
      category: "Home Automation",
      description: "Smart home ecosystem with advanced automation and energy management",
      icon: <Home className="w-8 h-8" />,
      color: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-400/30 dark:to-orange-400/30 border-yellow-300 dark:border-yellow-500 hover:from-yellow-500/30 hover:to-orange-500/30 dark:hover:from-yellow-400/40 dark:hover:to-orange-400/40",
      services: [
        {
          name: "Smart Device Controller",
          description: "Unified IoT device management with scene control",
          route: "/devices",
          status: "online",
          icon: <Zap className="w-5 h-5" />,
          metrics: { devices: "34", scenes: "12", automations: "8" }
        },
        {
          name: "Sensor Monitor",
          description: "Environmental monitoring with predictive analytics",
          route: "/sensors",
          status: "online",
          icon: <Thermometer className="w-5 h-5" />,
          metrics: { temp: "22°C", humidity: "45%", air: "Good" }
        },
        {
          name: "Automation Rules",
          description: "Advanced rule engine with machine learning",
          route: "/automation",
          status: "online",
          icon: <Settings className="w-5 h-5" />,
          metrics: { rules: "23", triggered: "156", success: "98%" }
        },
        {
          name: "Energy Monitor",
          description: "Real-time power consumption with cost analysis",
          route: "/energy",
          status: "warning",
          icon: <Power className="w-5 h-5" />,
          metrics: { power: "145W", cost: "$2.34", trend: "↓" }
        },
        {
          name: "Security Cameras",
          description: "HD surveillance with motion detection and alerts",
          route: "/cameras",
          status: "online",
          icon: <Camera className="w-5 h-5" />,
          metrics: { cameras: "8", recording: "6", motion: "2" }
        }
      ]
    }
  ];  // Enhanced quick stats with real-time data and trends
  const quickStats = [
    {
      title: "System Health",
      value: "98.5%",
      description: "Overall performance",
      icon: <Activity className="w-5 h-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/20 dark:bg-emerald-400/30",
      trend: "+2.1%",
      trendUp: true
    },
    {
      title: "Active Services",
      value: `${systemOverview.onlineServices}/${systemOverview.totalServices}`,
      description: "Currently running",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/20 dark:bg-blue-400/30",
      trend: "Stable",
      trendUp: null
    },
    {
      title: "Storage Used",
      value: "2.4TB",
      description: "Of 4TB capacity",
      icon: <HardDrive className="w-5 h-5" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/20 dark:bg-purple-400/30",      trend: "+12GB",
      trendUp: false
    },
    {
      title: "Network Traffic",
      value: "847 GB",
      description: "This month",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/20 dark:bg-orange-400/30",
      trend: "+15%",
      trendUp: true
    },
    {
      title: "Power Usage",
      value: `${systemOverview.powerConsumption}W`,
      description: "Current draw",
      icon: <Zap className="w-5 h-5" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/20 dark:bg-yellow-400/30",
      trend: "-8W",
      trendUp: true
    },
    {
      title: "Active Alerts",
      value: systemOverview.alerts,
      description: "Need attention",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: systemOverview.alerts > 5 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400",
      bgColor: systemOverview.alerts > 5 ? "bg-red-500/20 dark:bg-red-400/30" : "bg-amber-500/20 dark:bg-amber-400/30",
      trend: systemOverview.alerts > 0 ? "Review" : "Clean",
      trendUp: systemOverview.alerts === 0
    }
  ];
  // Simulate real-time updates with more realistic data
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemOverview(prev => ({
        ...prev,
        alerts: Math.max(0, prev.alerts + Math.floor(Math.random() * 3) - 1),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
        networkLoad: Math.max(10, Math.min(80, prev.networkLoad + Math.floor(Math.random() * 8) - 4)),
        powerConsumption: Math.max(120, Math.min(200, prev.powerConsumption + Math.floor(Math.random() * 6) - 3)),
        lastUpdate: new Date().toLocaleString()
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-accent';
      case 'warning': return 'bg-warning';
      case 'offline': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'online': return 'bg-accent/10 text-accent border-accent/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'offline': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleServiceClick = (route) => {
    navigate(route);
  };  return (
    <div className="min-h-screen bg-background">
      <MasterNavigation />
      
      <div className="flex">
        <HomeLabSidebar />
        
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Modern Header with Live Time */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Home Lab Command Center</h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive infrastructure monitoring and management platform
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-foreground">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString()}
                </div>
                <div className="flex items-center justify-end mt-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Last system update: {systemOverview.lastUpdate}
            </div>
          </div>

          {/* Enhanced Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  {stat.trend && (
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      stat.trendUp === true ? 'bg-accent/10 text-accent' :
                      stat.trendUp === false ? 'bg-destructive/10 text-destructive' :
                      'bg-muted/10 text-muted-foreground'
                    }`}>
                      {stat.trend}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>          {/* System Status Banner with Real-time Metrics */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 border border-slate-600 dark:border-slate-700 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3 flex items-center">
                  <CheckCircle className="w-8 h-8 mr-3 text-emerald-400" />
                  System Status: Operational
                </h2>
                <p className="text-slate-200 text-lg mb-4">
                  All critical services are running normally. 
                  {systemOverview.alerts > 0 && ` ${systemOverview.alerts} alerts require attention.`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-600/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-500/30">
                    <div className="text-sm text-slate-300">CPU Usage</div>
                    <div className="text-xl font-bold text-blue-400">{systemOverview.cpuUsage}%</div>
                  </div>
                  <div className="bg-slate-600/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-500/30">
                    <div className="text-sm text-slate-300">Memory</div>
                    <div className="text-xl font-bold text-purple-400">{systemOverview.memoryUsage}%</div>
                  </div>                  <div className="bg-slate-600/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-500/30">
                    <div className="text-sm text-slate-300">Network</div>
                    <div className="text-xl font-bold text-orange-400">{systemOverview.networkLoad}%</div>
                  </div>
                  <div className="bg-slate-600/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-500/30">
                    <div className="text-sm text-slate-300">Power</div>
                    <div className="text-xl font-bold text-yellow-400">{systemOverview.powerConsumption}W</div>
                  </div>
                </div>              </div>
              <div className="text-center ml-8">
                <div className="text-5xl font-bold mb-2 text-emerald-400">{systemOverview.uptime}%</div>
                <div className="text-slate-200 text-lg">System Uptime</div>
                <div className="mt-4">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </div>
              </div>
            </div>
          </div>{/* Featured Visualization Hub Call-to-Action */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-cyan-400/20 rounded-xl border-2 border-blue-300/50 dark:border-blue-500/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mr-6">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Visualization Hub
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      Comprehensive charts, network graphs, and workflow visualizations
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm">
                      <span className="flex items-center text-blue-600 dark:text-blue-400">
                        <Activity className="w-4 h-4 mr-1" />
                        Real-time Charts
                      </span>
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <GitBranch className="w-4 h-4 mr-1" />
                        Network Topology
                      </span>
                      <span className="flex items-center text-purple-600 dark:text-purple-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Process Flows
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => handleServiceClick('/homelab/visualizations')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-lg">View All Charts</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="mt-2 text-sm text-muted-foreground">
                    12 Charts • 8 Graphs • 4 Flows
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Service Categories */}
          <div className="space-y-8">
            {homeLabSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={`rounded-xl border-2 p-6 transition-all duration-300 ${section.color} shadow-sm hover:shadow-md`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-card rounded-xl shadow-sm mr-4">
                      <div className="text-primary">
                        {section.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">{section.category}</h2>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {section.services.length} services
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.services.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      onClick={() => handleServiceClick(service.route)}
                      className="bg-card rounded-xl shadow-sm border border-border p-5 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105 hover:border-primary/50 group"
                    >
                      {/* Service Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                            <div className="text-primary">
                              {service.icon}
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} shadow-sm`}></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusBadgeColor(service.status)}`}>
                            {service.status.toUpperCase()}
                          </span>
                          <MoreVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      {/* Service Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      {/* Service Metrics */}
                      {service.metrics && (
                        <div className="mb-4 p-3 bg-muted/20 rounded-lg">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {Object.entries(service.metrics).map(([key, value], idx) => (
                              <div key={idx} className="text-center">
                                <div className="font-medium text-muted-foreground capitalize">{key}</div>
                                <div className="font-bold text-foreground">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}                      {/* Action Button */}
                      <div className="pt-3 border-t border-border/50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceClick(service.route);
                          }}
                          className="w-full text-sm bg-primary text-primary-foreground py-2.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 group-hover:shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Open Dashboard</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>          {/* Enhanced Productivity & Management Tools */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/30 dark:to-purple-400/30 border-indigo-300 dark:border-indigo-500 hover:from-indigo-500/30 hover:to-purple-500/30 dark:hover:from-indigo-400/40 dark:hover:to-purple-400/40 rounded-xl border-2 p-6 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-card rounded-xl shadow-sm mr-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Productivity & Management Suite</h2>
                    <p className="text-muted-foreground">Integrated task management, documentation, and productivity tools</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  4 tools
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Task Manager",
                    description: "Advanced project and personal task management with analytics",
                    route: "/tasks",
                    icon: <CheckCircle className="w-5 h-5" />,
                    metrics: { tasks: "23", completed: "89%", overdue: "2" }
                  },
                  {
                    name: "Notes System",
                    description: "Structured documentation with rich text and collaboration",
                    route: "/notes",
                    icon: <FileText className="w-5 h-5" />,
                    metrics: { notes: "156", categories: "8", recent: "12" }
                  },
                  {
                    name: "Research Hub",
                    description: "Advanced research tools with data analysis capabilities",
                    route: "/research",
                    icon: <Search className="w-5 h-5" />,
                    metrics: { projects: "7", papers: "45", insights: "23" }
                  },
                  {
                    name: "Progress Hub",
                    description: "Comprehensive project tracking with milestone management",
                    route: "/progress-hub",
                    icon: <TrendingUp className="w-5 h-5" />,
                    metrics: { projects: "12", milestones: "34", completion: "76%" }
                  }
                ].map((tool, index) => (
                  <div
                    key={index}
                    onClick={() => handleServiceClick(tool.route)}
                    className="bg-card rounded-xl shadow-sm border border-border p-5 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105 hover:border-primary/50 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <div className="text-primary">
                            {tool.icon}
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-accent shadow-sm"></div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium border bg-accent/10 text-accent border-accent/20">
                        ONLINE
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    {/* Tool Metrics */}
                    <div className="mb-4 p-3 bg-muted/20 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(tool.metrics).map(([key, value], idx) => (
                          <div key={idx} className="text-center">
                            <div className="font-medium text-muted-foreground capitalize">{key}</div>
                            <div className="font-bold text-foreground">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                      <div className="pt-3 border-t border-border/50">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(tool.route);
                        }}
                        className="w-full text-sm bg-primary text-primary-foreground py-2.5 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 group-hover:shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Open Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Modern Footer */}
          <div className="mt-12 text-center">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full mr-3">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">EDEN Home Lab Management System</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Version 2.1 - Comprehensive home laboratory infrastructure and productivity management platform
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-accent" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-1 text-primary" />
                  <span>Real-time</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-secondary" />
                  <span>Monitored</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLabDashboard;
