import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Cpu, HardDrive, MemoryStick, Thermometer, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const SystemMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    cpu: {
      usage: 45,
      cores: 8,
      frequency: '3.2 GHz',
      temperature: 65
    },
    memory: {
      total: '32 GB',
      used: '18.5 GB',
      free: '13.5 GB',
      usage: 58
    },
    disk: {
      read: '125 MB/s',
      write: '98 MB/s',
      iops: 1250
    },
    network: {
      download: '150 Mbps',
      upload: '45 Mbps',
      packets: 15420
    },
    system: {
      uptime: '15 days, 7 hours',
      processes: 342,
      loadAverage: [1.2, 1.8, 2.1]
    }
  });

  const [historicalData, setHistoricalData] = useState({
    cpuHistory: [42, 38, 51, 45, 47, 52, 48, 45, 49, 45],
    memoryHistory: [55, 57, 59, 58, 60, 62, 59, 58, 57, 58],
    networkHistory: [120, 135, 142, 155, 148, 152, 145, 150, 148, 150]
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setMetrics(prev => ({
          ...prev,
          cpu: {
            ...prev.cpu,
            usage: Math.max(20, Math.min(80, prev.cpu.usage + (Math.random() - 0.5) * 10)),
            temperature: Math.max(40, Math.min(85, prev.cpu.temperature + (Math.random() - 0.5) * 5))
          },
          memory: {
            ...prev.memory,
            usage: Math.max(30, Math.min(90, prev.memory.usage + (Math.random() - 0.5) * 5))
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getUsageColor = (usage) => {
    if (usage >= 80) return 'text-red-500';
    if (usage >= 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsageBarColor = (usage) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTempColor = (temp) => {
    if (temp >= 80) return 'text-red-500';
    if (temp >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-accent/10 rounded-full"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              System Metrics
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold">CPU Usage</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-2xl font-bold ${getUsageColor(metrics.cpu.usage)}`}>
                  {metrics.cpu.usage}%
                </span>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{metrics.cpu.cores} cores</div>
                  <div>{metrics.cpu.frequency}</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(metrics.cpu.usage)}`}
                  style={{ width: `${metrics.cpu.usage}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4" />
                <span className={getTempColor(metrics.cpu.temperature)}>
                  {metrics.cpu.temperature}°C
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MemoryStick className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold">Memory</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-2xl font-bold ${getUsageColor(metrics.memory.usage)}`}>
                  {metrics.memory.usage}%
                </span>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{metrics.memory.used} used</div>
                  <div>{metrics.memory.total} total</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(metrics.memory.usage)}`}
                  style={{ width: `${metrics.memory.usage}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.memory.free} available
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-6 h-6 text-purple-500" />
              <h3 className="font-semibold">Disk I/O</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Read</div>
                  <div className="font-semibold text-green-500">{metrics.disk.read}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Write</div>
                  <div className="font-semibold text-blue-500">{metrics.disk.write}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">IOPS</div>
                <div className="text-xl font-bold">{metrics.disk.iops}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold">Network</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Download</div>
                  <div className="font-semibold text-green-500">{metrics.network.download}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Upload</div>
                  <div className="font-semibold text-blue-500">{metrics.network.upload}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Packets/s</div>
                <div className="text-xl font-bold">{metrics.network.packets}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">System Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-semibold">{metrics.system.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Processes</span>
                <span className="font-semibold">{metrics.system.processes}</span>
              </div>
              <div className="space-y-2">
                <span className="text-muted-foreground">Load Average</span>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">1min</div>
                    <div className="font-semibold">{metrics.system.loadAverage[0]}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">5min</div>
                    <div className="font-semibold">{metrics.system.loadAverage[1]}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">15min</div>
                    <div className="font-semibold">{metrics.system.loadAverage[2]}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">CPU Usage (Last 10 samples)</span>
                  <span className="text-sm font-semibold">{metrics.cpu.usage}%</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {historicalData.cpuHistory.map((value, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(value / 100) * 100}%`,
                        width: '100%'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <span className="text-sm font-semibold">{metrics.memory.usage}%</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {historicalData.memoryHistory.map((value, index) => (
                    <div
                      key={index}
                      className="bg-green-500 rounded-t"
                      style={{
                        height: `${(value / 100) * 100}%`,
                        width: '100%'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
