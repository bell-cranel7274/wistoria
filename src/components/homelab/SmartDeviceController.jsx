import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb, Power, Thermometer, Droplets, Wind, Zap, Settings, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const SmartDeviceController = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: 'Living Room Lights',
      type: 'light',
      status: 'on',
      brightness: 75,
      color: '#FFD700',
      room: 'Living Room',
      lastUpdated: '2024-01-15 10:25:30'
    },
    {
      id: 2,
      name: 'Bedroom AC',
      type: 'thermostat',
      status: 'on',
      temperature: 22,
      targetTemp: 23,
      mode: 'cool',
      room: 'Bedroom',
      lastUpdated: '2024-01-15 10:20:15'
    },
    {
      id: 3,
      name: 'Kitchen Smart Plug',
      type: 'switch',
      status: 'off',
      power: 0,
      room: 'Kitchen',
      lastUpdated: '2024-01-15 09:45:22'
    },
    {
      id: 4,
      name: 'Bathroom Fan',
      type: 'fan',
      status: 'on',
      speed: 60,
      room: 'Bathroom',
      lastUpdated: '2024-01-15 10:30:05'
    },
    {
      id: 5,
      name: 'Garden Sprinkler',
      type: 'irrigation',
      status: 'off',
      schedule: 'Daily 6:00 AM',
      room: 'Garden',
      lastUpdated: '2024-01-15 06:00:00'
    },
    {
      id: 6,
      name: 'Security Camera',
      type: 'camera',
      status: 'on',
      recording: true,
      room: 'Front Door',
      lastUpdated: '2024-01-15 10:30:12'
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [selectedType, setSelectedType] = useState('All Types');

  const rooms = ['All Rooms', ...new Set(devices.map(d => d.room))];
  const deviceTypes = ['All Types', 'light', 'thermostat', 'switch', 'fan', 'irrigation', 'camera'];

  const toggleDevice = (deviceId) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            status: device.status === 'on' ? 'off' : 'on',
            lastUpdated: new Date().toLocaleString('sv-SE')
          }
        : device
    ));
  };

  const updateDeviceSetting = (deviceId, setting, value) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            [setting]: value,
            lastUpdated: new Date().toLocaleString('sv-SE')
          }
        : device
    ));
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'light':
        return <Lightbulb className="w-5 h-5" />;
      case 'thermostat':
        return <Thermometer className="w-5 h-5" />;
      case 'switch':
        return <Power className="w-5 h-5" />;
      case 'fan':
        return <Wind className="w-5 h-5" />;
      case 'irrigation':
        return <Droplets className="w-5 h-5" />;
      case 'camera':
        return <Settings className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'on' ? 'text-green-500' : 'text-gray-500';
  };

  const filteredDevices = devices.filter(device => {
    const roomMatch = selectedRoom === 'All Rooms' || device.room === selectedRoom;
    const typeMatch = selectedType === 'All Types' || device.type === selectedType;
    return roomMatch && typeMatch;
  });

  const getDeviceStats = () => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'on').length;
    const offline = devices.filter(d => d.status === 'off').length;
    const lights = devices.filter(d => d.type === 'light').length;
    
    return { total, online, offline, lights };
  };

  const stats = getDeviceStats();

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
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Smart Device Controller
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
              <Settings className="w-4 h-4" />
              Automation
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add Device
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Devices</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.online}</div>
            <div className="text-sm text-muted-foreground">Online</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.offline}</div>
            <div className="text-sm text-muted-foreground">Offline</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.lights}</div>
            <div className="text-sm text-muted-foreground">Smart Lights</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Room:</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {deviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'All Types' ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card key={device.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={getStatusColor(device.status)}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">{device.room}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleDevice(device.id)}
                  className={`p-2 rounded-full transition-colors ${
                    device.status === 'on' 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Device-specific Controls */}
              {device.type === 'light' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Brightness: {device.brightness}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.brightness}
                      onChange={(e) => updateDeviceSetting(device.id, 'brightness', e.target.value)}
                      className="w-full mt-1"
                      disabled={device.status === 'off'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Color</label>
                    <input
                      type="color"
                      value={device.color}
                      onChange={(e) => updateDeviceSetting(device.id, 'color', e.target.value)}
                      className="w-full h-8 mt-1 rounded border"
                      disabled={device.status === 'off'}
                    />
                  </div>
                </div>
              )}

              {device.type === 'thermostat' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current: {device.temperature}°C</span>
                    <span className="text-sm text-muted-foreground">Mode: {device.mode}</span>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Target: {device.targetTemp}°C</label>
                    <input
                      type="range"
                      min="16"
                      max="30"
                      value={device.targetTemp}
                      onChange={(e) => updateDeviceSetting(device.id, 'targetTemp', e.target.value)}
                      className="w-full mt-1"
                      disabled={device.status === 'off'}
                    />
                  </div>
                </div>
              )}

              {device.type === 'fan' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Speed: {device.speed}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.speed}
                      onChange={(e) => updateDeviceSetting(device.id, 'speed', e.target.value)}
                      className="w-full mt-1"
                      disabled={device.status === 'off'}
                    />
                  </div>
                </div>
              )}

              {device.type === 'switch' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Power Usage:</span>
                    <span className="text-sm font-medium">{device.power}W</span>
                  </div>
                </div>
              )}

              {device.type === 'irrigation' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Schedule:</span>
                    <span className="text-sm font-medium">{device.schedule}</span>
                  </div>
                </div>
              )}

              {device.type === 'camera' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recording:</span>
                    <span className={`text-sm font-medium ${device.recording ? 'text-red-500' : 'text-gray-500'}`}>
                      {device.recording ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                  <button
                    onClick={() => updateDeviceSetting(device.id, 'recording', !device.recording)}
                    className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
                  >
                    {device.recording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              )}

              {/* Last Updated */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last updated: {device.lastUpdated}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground">
              No devices match the current filters. Try adjusting your selection.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
