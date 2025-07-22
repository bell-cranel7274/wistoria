import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, ArrowRight, Database, Server, Cloud, 
  Cpu, HardDrive, Wifi, Shield, Activity,
  Play, Pause, RotateCcw, Settings, Zap,
  TrendingUp, BarChart2, Monitor, AlertTriangle
} from 'lucide-react';

const FlowView = () => {
  const [selectedFlow, setSelectedFlow] = useState('data');
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(2);
  const [flowMetrics, setFlowMetrics] = useState({});
  const canvasRef = useRef();

  // Flow templates and configurations
  const flowTypes = {
    data: {
      title: "Data Flow Pipeline",
      description: "End-to-end data processing and storage workflows",
      color: "bg-blue-500",
      icon: <Database className="w-5 h-5" />
    },
    network: {
      title: "Network Traffic Flow",
      description: "Real-time network packet routing and load balancing",
      color: "bg-green-500", 
      icon: <Wifi className="w-5 h-5" />
    },
    processing: {
      title: "Processing Workflow",
      description: "CPU and memory resource allocation chains",
      color: "bg-purple-500",
      icon: <Cpu className="w-5 h-5" />
    },
    security: {
      title: "Security Pipeline",
      description: "Authentication, authorization, and threat detection",
      color: "bg-red-500",
      icon: <Shield className="w-5 h-5" />
    }
  };

  // Data flow configurations
  const dataFlows = {
    data: [
      {
        id: 'input',
        name: 'Data Ingestion',
        type: 'source',
        position: { x: 50, y: 200 },
        connections: ['processing'],
        metrics: { throughput: '2.4 GB/s', latency: '12ms' },
        status: 'active'
      },
      {
        id: 'processing',
        name: 'ETL Processing',
        type: 'processor',
        position: { x: 250, y: 200 },
        connections: ['storage', 'cache'],
        metrics: { cpu: '45%', memory: '67%' },
        status: 'active'
      },
      {
        id: 'cache',
        name: 'Redis Cache',
        type: 'storage',
        position: { x: 450, y: 120 },
        connections: ['api'],
        metrics: { hits: '94%', size: '2.1GB' },
        status: 'active'
      },
      {
        id: 'storage',
        name: 'Data Warehouse',
        type: 'storage',
        position: { x: 450, y: 280 },
        connections: ['api'],
        metrics: { used: '847GB', free: '153GB' },
        status: 'active'
      },
      {
        id: 'api',
        name: 'REST API',
        type: 'service',
        position: { x: 650, y: 200 },
        connections: ['dashboard'],
        metrics: { requests: '1.2K/min', uptime: '99.9%' },
        status: 'active'
      },
      {
        id: 'dashboard',
        name: 'Analytics Dashboard',
        type: 'output',
        position: { x: 850, y: 200 },
        connections: [],
        metrics: { users: '24', load: 'low' },
        status: 'active'
      }
    ],
    network: [
      {
        id: 'internet',
        name: 'Internet Gateway',
        type: 'source',
        position: { x: 50, y: 200 },
        connections: ['firewall'],
        metrics: { bandwidth: '1Gbps', utilization: '23%' },
        status: 'active'
      },
      {
        id: 'firewall',
        name: 'pfSense Firewall',
        type: 'security',
        position: { x: 200, y: 200 },
        connections: ['router'],
        metrics: { blocked: '47', allowed: '1.2K' },
        status: 'active'
      },
      {
        id: 'router',
        name: 'Core Router',
        type: 'processor',
        position: { x: 350, y: 200 },
        connections: ['switch1', 'switch2'],
        metrics: { packets: '2.4M/s', latency: '1ms' },
        status: 'active'
      },
      {
        id: 'switch1',
        name: 'Main Switch',
        type: 'processor',
        position: { x: 500, y: 120 },
        connections: ['servers'],
        metrics: { ports: '24/48', load: '34%' },
        status: 'active'
      },
      {
        id: 'switch2',
        name: 'IoT Switch', 
        type: 'processor',
        position: { x: 500, y: 280 },
        connections: ['iot'],
        metrics: { devices: '67', power: '12W' },
        status: 'warning'
      },
      {
        id: 'servers',
        name: 'Server Farm',
        type: 'output',
        position: { x: 650, y: 120 },
        connections: [],
        metrics: { active: '4/6', load: 'medium' },
        status: 'active'
      },
      {
        id: 'iot',
        name: 'IoT Devices',
        type: 'output',
        position: { x: 650, y: 280 },
        connections: [],
        metrics: { online: '62/67', battery: 'good' },
        status: 'warning'
      }
    ],
    processing: [
      {
        id: 'scheduler',
        name: 'Task Scheduler',
        type: 'source',
        position: { x: 50, y: 200 },
        connections: ['queue'],
        metrics: { jobs: '156', pending: '12' },
        status: 'active'
      },
      {
        id: 'queue',
        name: 'Job Queue',
        type: 'processor',
        position: { x: 200, y: 200 },
        connections: ['worker1', 'worker2', 'worker3'],
        metrics: { size: '45', rate: '23/min' },
        status: 'active'
      },
      {
        id: 'worker1',
        name: 'Worker Node 1',
        type: 'processor',
        position: { x: 400, y: 100 },
        connections: ['results'],
        metrics: { cpu: '78%', jobs: '8' },
        status: 'active'
      },
      {
        id: 'worker2',
        name: 'Worker Node 2',
        type: 'processor',
        position: { x: 400, y: 200 },
        connections: ['results'],
        metrics: { cpu: '45%', jobs: '5' },
        status: 'active'
      },
      {
        id: 'worker3',
        name: 'Worker Node 3',
        type: 'processor',
        position: { x: 400, y: 300 },
        connections: ['results'],
        metrics: { cpu: '92%', jobs: '12' },
        status: 'warning'
      },
      {
        id: 'results',
        name: 'Results Store',
        type: 'storage',
        position: { x: 600, y: 200 },
        connections: ['monitor'],
        metrics: { completed: '2.4K', failed: '23' },
        status: 'active'
      },
      {
        id: 'monitor',
        name: 'Process Monitor',
        type: 'output',
        position: { x: 750, y: 200 },
        connections: [],
        metrics: { alerts: '3', uptime: '99.1%' },
        status: 'active'
      }
    ],
    security: [
      {
        id: 'request',
        name: 'Incoming Request',
        type: 'source',
        position: { x: 50, y: 200 },
        connections: ['waf'],
        metrics: { requests: '124/min', suspicious: '3' },
        status: 'active'
      },
      {
        id: 'waf',
        name: 'Web App Firewall',
        type: 'security',
        position: { x: 200, y: 200 },
        connections: ['auth'],
        metrics: { blocked: '12', passed: '112' },
        status: 'active'
      },
      {
        id: 'auth',
        name: 'Authentication',
        type: 'security',
        position: { x: 350, y: 200 },
        connections: ['authz'],
        metrics: { success: '98%', failed: '7' },
        status: 'active'
      },
      {
        id: 'authz',
        name: 'Authorization',
        type: 'security',
        position: { x: 500, y: 200 },
        connections: ['app'],
        metrics: { granted: '89%', denied: '13' },
        status: 'active'
      },
      {
        id: 'app',
        name: 'Application',
        type: 'service',
        position: { x: 650, y: 200 },
        connections: ['audit'],
        metrics: { response: '45ms', errors: '0.1%' },
        status: 'active'
      },
      {
        id: 'audit',
        name: 'Audit Logger',
        type: 'output',
        position: { x: 800, y: 200 },
        connections: [],
        metrics: { events: '2.1K', storage: '45MB' },
        status: 'active'
      }
    ]
  };

  // Generate flow metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const flows = dataFlows[selectedFlow];
      const newMetrics = {};
      
      flows.forEach(node => {
        newMetrics[node.id] = {
          ...node.metrics,
          timestamp: Date.now(),
          active: Math.random() > 0.1, // 90% uptime simulation
          load: Math.random() * 100
        };
      });
      
      setFlowMetrics(newMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedFlow]);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'source': return <Database className="w-4 h-4" />;
      case 'processor': return <Cpu className="w-4 h-4" />;
      case 'storage': return <HardDrive className="w-4 h-4" />;
      case 'service': return <Server className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'output': return <Monitor className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type, status) => {
    const baseColors = {
      source: 'bg-blue-500',
      processor: 'bg-green-500', 
      storage: 'bg-yellow-500',
      service: 'bg-purple-500',
      security: 'bg-red-500',
      output: 'bg-gray-500'
    };
    
    if (status === 'warning') return 'bg-orange-500';
    if (status === 'error') return 'bg-red-600';
    return baseColors[type] || 'bg-gray-500';
  };

  const FlowSelector = () => (
    <div className="flex space-x-2 mb-6">
      {Object.entries(flowTypes).map(([key, flow]) => (
        <button
          key={key}
          onClick={() => setSelectedFlow(key)}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            selectedFlow === key 
              ? `${flow.color} text-white shadow-lg` 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {flow.icon}
          <span className="hidden md:inline">{flow.title}</span>
        </button>
      ))}
    </div>
  );

  const ControlPanel = () => (
    <div className="bg-white rounded-lg p-4 shadow-md mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`p-2 rounded-lg ${isAnimating ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Speed:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium">{animationSpeed}x</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
          <button
            onClick={() => setFlowMetrics({})}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const FlowDiagram = () => {
    const flows = dataFlows[selectedFlow];
    const currentFlow = flowTypes[selectedFlow];

    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            {currentFlow.icon}
            <span className="ml-2">{currentFlow.title}</span>
          </h3>
          <span className="text-sm text-gray-600">{currentFlow.description}</span>
        </div>
        
        <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            {/* Draw connections */}
            {flows.map(node => 
              node.connections.map(targetId => {
                const target = flows.find(f => f.id === targetId);
                if (!target) return null;
                
                const startX = node.position.x + 60;
                const startY = node.position.y + 30;
                const endX = target.position.x;
                const endY = target.position.y + 30;
                
                return (
                  <g key={`${node.id}-${targetId}`}>
                    {/* Connection line */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#6B7280"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className={isAnimating ? 'animate-pulse' : ''}
                    />
                    {/* Animated flow indicators */}
                    {isAnimating && (
                      <circle
                        r="3"
                        fill="#3B82F6"
                        className="animate-ping"
                      >
                        <animateMotion
                          dur={`${3 / animationSpeed}s`}
                          repeatCount="indefinite"
                          path={`M${startX},${startY} L${endX},${endY}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })
            )}
            
            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
              </marker>
            </defs>
          </svg>
          
          {/* Flow nodes */}
          {flows.map(node => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
            >
              <div className={`
                ${getNodeColor(node.type, node.status)} 
                text-white rounded-lg p-3 shadow-lg min-w-32 text-center
                ${isAnimating ? 'animate-pulse' : ''}
                hover:scale-105 transition-transform cursor-pointer
              `}>
                <div className="flex items-center justify-center mb-1">
                  {getNodeIcon(node.type)}
                  <span className="ml-1 text-xs font-semibold">{node.name}</span>
                </div>
                <div className="text-xs opacity-90">
                  {Object.entries(node.metrics).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
                {node.status === 'warning' && (
                  <AlertTriangle className="w-3 h-3 absolute -top-1 -right-1 text-orange-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MetricsPanel = () => {
    const flows = dataFlows[selectedFlow];
    const activeNodes = flows.filter(node => flowMetrics[node.id]?.active !== false);
    const totalNodes = flows.length;
    const healthScore = Math.round((activeNodes.length / totalNodes) * 100);

    return (
      <div className="space-y-4">
        {/* Flow Health */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-green-500" />
            Flow Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Nodes</span>
              <span className="font-semibold">{activeNodes.length}/{totalNodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className={`font-semibold ${
                healthScore >= 90 ? 'text-green-600' : 
                healthScore >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthScore}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Flow Type</span>
              <span className="font-semibold capitalize">{selectedFlow}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Performance
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Throughput</span>
              <span className="text-sm font-medium text-green-600">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Latency</span>
              <span className="text-sm font-medium text-blue-600">Low</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-green-600">0.1%</span>
            </div>
          </div>
        </div>

        {/* Flow Legend */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-3">Legend</h3>
          <div className="space-y-2">
            {[
              { type: 'source', label: 'Data Source', color: 'bg-blue-500' },
              { type: 'processor', label: 'Processor', color: 'bg-green-500' },
              { type: 'storage', label: 'Storage', color: 'bg-yellow-500' },
              { type: 'service', label: 'Service', color: 'bg-purple-500' },
              { type: 'security', label: 'Security', color: 'bg-red-500' },
              { type: 'output', label: 'Output', color: 'bg-gray-500' }
            ].map(item => (
              <div key={item.type} className="flex items-center space-x-2">
                <div className={`w-4 h-4 ${item.color} rounded`}></div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <GitBranch className="mr-3 text-blue-600" />
            Workflow Flows
          </h1>
          <p className="text-gray-600 mt-1">Real-time system workflow and process flow visualization</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Monitoring</span>
        </div>
      </div>

      {/* Flow Type Selector */}
      <FlowSelector />

      {/* Control Panel */}
      <ControlPanel />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FlowDiagram />
        </div>
        <div>
          <MetricsPanel />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Flow Engine Active</span>
            </div>
          </div>
          <div className="text-sm">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowView;
