import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wifi, Server, HardDrive, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const NetworkMonitor = () => {
  const navigate = useNavigate();
  const [networkData, setNetworkData] = useState({
    connectedDevices: [
      { name: 'Router', ip: '192.168.1.1', status: 'online', ping: '1ms' },
      { name: 'Pi-hole', ip: '192.168.1.100', status: 'online', ping: '2ms' },
      { name: 'Media Server', ip: '192.168.1.101', status: 'online', ping: '3ms' },
      { name: 'NAS', ip: '192.168.1.102', status: 'warning', ping: '15ms' },
      { name: 'Smart TV', ip: '192.168.1.105', status: 'online', ping: '8ms' },
    ],
    bandwidth: {
      download: '45.2 Mbps',
      upload: '12.8 Mbps',
      latency: '18ms'
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-accent/10 rounded-full"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wifi className="w-6 h-6 text-blue-500" />
            Network Monitor
          </h1>
        </div>

        {/* Network Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Download Speed</h3>
            </div>
            <div className="text-2xl font-bold text-green-500">{networkData.bandwidth.download}</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Upload Speed</h3>
            </div>
            <div className="text-2xl font-bold text-blue-500">{networkData.bandwidth.upload}</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Network Latency</h3>
            </div>
            <div className="text-2xl font-bold text-purple-500">{networkData.bandwidth.latency}</div>
          </Card>
        </div>

        {/* Connected Devices */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Connected Devices ({networkData.connectedDevices.length})
          </h2>
          
          <div className="space-y-4">
            {networkData.connectedDevices.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-4">
                  {getStatusIcon(device.status)}
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">{device.ip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Ping</div>
                    <div className="font-medium">{device.ping}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                    {device.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitor;
