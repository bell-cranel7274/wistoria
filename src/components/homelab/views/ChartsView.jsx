import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Server, HardDrive, 
  Wifi, Zap, Thermometer, Clock, BarChart3 
} from 'lucide-react';

const ChartsView = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data generators
  const generateTimeSeriesData = (hours = 24, metric = 'cpu') => {
    return Array.from({ length: hours }, (_, i) => {
      const time = new Date(Date.now() - (hours - i) * 3600000);
      const baseValue = metric === 'cpu' ? 45 : metric === 'memory' ? 60 : 30;
      const noise = Math.random() * 20 - 10;
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.getTime(),
        [metric]: Math.max(0, Math.min(100, baseValue + noise)),
        temperature: Math.random() * 15 + 45,
        network: Math.random() * 100,
        power: Math.random() * 50 + 100
      };
    });
  };

  const [systemMetrics, setSystemMetrics] = useState(generateTimeSeriesData(24));
  const [serverStats, setServerStats] = useState([
    { name: 'Proxmox', cpu: 23, memory: 67, disk: 45, status: 'online' },
    { name: 'TrueNAS', cpu: 12, memory: 34, disk: 78, status: 'online' },
    { name: 'Pi-hole', cpu: 5, memory: 15, disk: 23, status: 'online' },
    { name: 'Home Assistant', cpu: 18, memory: 28, disk: 34, status: 'online' },
    { name: 'Plex', cpu: 45, memory: 56, disk: 67, status: 'warning' },
    { name: 'Grafana', cpu: 8, memory: 22, disk: 12, status: 'online' }
  ]);

  const serviceDistribution = [
    { name: 'Running', value: 18, color: '#10B981' },
    { name: 'Warning', value: 3, color: '#F59E0B' },
    { name: 'Offline', value: 1, color: '#EF4444' },
    { name: 'Maintenance', value: 2, color: '#6B7280' }
  ];

  const networkTraffic = generateTimeSeriesData(24, 'network');
  const powerConsumption = generateTimeSeriesData(168, 'power'); // 7 days

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          cpu: Math.random() * 20 + 35,
          memory: Math.random() * 30 + 50,
          temperature: Math.random() * 15 + 45,
          network: Math.random() * 100,
          power: Math.random() * 50 + 100
        };
        return [...prev.slice(1), newPoint];
      });
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const MetricCard = ({ title, value, unit, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Current Reading</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
          <div className="flex items-center mt-1">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(1)}${entry.dataKey === 'temperature' ? '°C' : '%'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 text-blue-600" />
            Homelab Analytics
          </h1>
          <p className="text-gray-600 mt-1">Real-time system metrics and performance analytics</p>
        </div>
        <div className="flex space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={5}>5s Refresh</option>
            <option value={30}>30s Refresh</option>
            <option value={60}>1m Refresh</option>
            <option value={300}>5m Refresh</option>
          </select>
        </div>
      </div>      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="CPU Usage" 
          value={systemMetrics.length > 0 && systemMetrics[systemMetrics.length - 1]?.cpu ? systemMetrics[systemMetrics.length - 1].cpu.toFixed(1) : '--'} 
          unit="%" 
          change={2.3}
          icon={Activity}
          color="bg-blue-500"
        />
        <MetricCard 
          title="Memory Usage" 
          value={systemMetrics.length > 0 && systemMetrics[systemMetrics.length - 1]?.memory ? systemMetrics[systemMetrics.length - 1].memory.toFixed(1) : '--'} 
          unit="%" 
          change={-1.2}
          icon={Server}
          color="bg-green-500"
        />
        <MetricCard 
          title="Temperature" 
          value={systemMetrics.length > 0 && systemMetrics[systemMetrics.length - 1]?.temperature ? systemMetrics[systemMetrics.length - 1].temperature.toFixed(1) : '--'} 
          unit="°C" 
          change={0.5}
          icon={Thermometer}
          color="bg-orange-500"
        />
        <MetricCard 
          title="Power Usage" 
          value={systemMetrics.length > 0 && systemMetrics[systemMetrics.length - 1]?.power ? systemMetrics[systemMetrics.length - 1].power.toFixed(0) : '--'} 
          unit="W" 
          change={-3.1}
          icon={Zap}
          color="bg-purple-500"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance Over Time */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={systemMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Service Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Service Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Server Resource Usage */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Server Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serverStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpu" fill="#3B82F6" name="CPU %" />
              <Bar dataKey="memory" fill="#10B981" name="Memory %" />
              <Bar dataKey="disk" fill="#F59E0B" name="Disk %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Network Traffic */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Network Traffic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={networkTraffic}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="network" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { subject: 'CPU', A: 75, B: 85, fullMark: 100 },
              { subject: 'Memory', A: 60, B: 70, fullMark: 100 },
              { subject: 'Disk I/O', A: 45, B: 55, fullMark: 100 },
              { subject: 'Network', A: 80, B: 75, fullMark: 100 },
              { subject: 'Temp', A: 65, B: 60, fullMark: 100 },
              { subject: 'Power', A: 70, B: 68, fullMark: 100 }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Average" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Power Consumption Trend */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">7-Day Power Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerConsumption.filter((_, i) => i % 4 === 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="power" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Clock className="w-5 h-5" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <div className="text-sm">
              Refresh: {refreshInterval}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
