import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const SensorMonitor = () => {
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setSensors([
        {
          id: 1,
          name: 'Living Room Temperature',
          type: 'temperature',
          location: 'Living Room',
          value: 22.5,
          unit: '°C',
          status: 'normal',
          battery: 85,
          lastUpdate: '2024-01-15 14:35'
        },
        {
          id: 2,
          name: 'Basement Humidity',
          type: 'humidity',
          location: 'Basement',
          value: 68,
          unit: '%',
          status: 'warning',
          battery: 42,
          lastUpdate: '2024-01-15 14:34'
        },
        {
          id: 3,
          name: 'Kitchen Motion',
          type: 'motion',
          location: 'Kitchen',
          value: 1,
          unit: 'detected',
          status: 'active',
          battery: 92,
          lastUpdate: '2024-01-15 14:35'
        },
        {
          id: 4,
          name: 'Front Door Contact',
          type: 'contact',
          location: 'Front Door',
          value: 0,
          unit: 'closed',
          status: 'normal',
          battery: 78,
          lastUpdate: '2024-01-15 14:30'
        },
        {
          id: 5,
          name: 'Garage Light Level',
          type: 'light',
          location: 'Garage',
          value: 45,
          unit: 'lux',
          status: 'normal',
          battery: 67,
          lastUpdate: '2024-01-15 14:35'
        },
        {
          id: 6,
          name: 'Water Tank Level',
          type: 'water',
          location: 'Utility Room',
          value: 75,
          unit: '%',
          status: 'normal',
          battery: 89,
          lastUpdate: '2024-01-15 14:33'
        },
        {
          id: 7,
          name: 'Air Quality PM2.5',
          type: 'air_quality',
          location: 'Bedroom',
          value: 12,
          unit: 'μg/m³',
          status: 'good',
          battery: 56,
          lastUpdate: '2024-01-15 14:35'
        },
        {
          id: 8,
          name: 'Outdoor Pressure',
          type: 'pressure',
          location: 'Balcony',
          value: 1013.2,
          unit: 'hPa',
          status: 'normal',
          battery: 73,
          lastUpdate: '2024-01-15 14:35'
        }
      ]);

      setAlerts([
        {
          id: 1,
          sensor: 'Basement Humidity',
          message: 'Humidity level above 65% threshold',
          severity: 'warning',
          timestamp: '2024-01-15 14:20'
        },
        {
          id: 2,
          sensor: 'Basement Humidity',
          message: 'Low battery warning (42%)',
          severity: 'warning',
          timestamp: '2024-01-15 13:45'
        },
        {
          id: 3,
          sensor: 'Kitchen Motion',
          message: 'Motion detected',
          severity: 'info',
          timestamp: '2024-01-15 14:35'
        }
      ]);

      // Generate sample historical data
      const generateHistoricalData = () => {
        const data = {};
        const now = new Date();
        
        [1, 2, 5, 6, 7, 8].forEach(sensorId => {
          data[sensorId] = [];
          for (let i = 0; i < 60; i++) {
            const timestamp = new Date(now - i * 60000); // Every minute
            let value;
            
            switch (sensorId) {
              case 1: // Temperature
                value = 22 + Math.sin(i * 0.1) * 3 + Math.random() * 0.5;
                break;
              case 2: // Humidity
                value = 65 + Math.sin(i * 0.05) * 10 + Math.random() * 2;
                break;
              case 5: // Light
                value = 40 + Math.sin(i * 0.2) * 30 + Math.random() * 5;
                break;
              case 6: // Water level
                value = 75 + Math.sin(i * 0.02) * 5 + Math.random() * 1;
                break;
              case 7: // Air quality
                value = 10 + Math.sin(i * 0.15) * 5 + Math.random() * 2;
                break;
              case 8: // Pressure
                value = 1013 + Math.sin(i * 0.03) * 10 + Math.random() * 1;
                break;
              default:
                value = Math.random() * 100;
            }
            
            data[sensorId].unshift({
              timestamp: timestamp.toISOString(),
              value: Math.round(value * 10) / 10
            });
          }
        });
        
        return data;
      };

      setSensorData(generateHistoricalData());
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time sensor updates
      setSensors(prev => prev.map(sensor => {
        let newValue = sensor.value;
        
        switch (sensor.type) {
          case 'temperature':
            newValue = sensor.value + (Math.random() - 0.5) * 0.5;
            break;
          case 'humidity':
            newValue = Math.max(0, Math.min(100, sensor.value + (Math.random() - 0.5) * 2));
            break;
          case 'motion':
            newValue = Math.random() > 0.95 ? 1 : 0;
            break;
          case 'contact':
            newValue = Math.random() > 0.98 ? (sensor.value === 0 ? 1 : 0) : sensor.value;
            break;
          case 'light':
            newValue = Math.max(0, sensor.value + (Math.random() - 0.5) * 5);
            break;
          case 'water':
            newValue = Math.max(0, Math.min(100, sensor.value + (Math.random() - 0.5) * 1));
            break;
          case 'air_quality':
            newValue = Math.max(0, sensor.value + (Math.random() - 0.5) * 2);
            break;
          case 'pressure':
            newValue = sensor.value + (Math.random() - 0.5) * 1;
            break;
        }
        
        return {
          ...sensor,
          value: Math.round(newValue * 10) / 10,
          lastUpdate: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'motion': return '🚶';
      case 'contact': return '🚪';
      case 'light': return '💡';
      case 'water': return '🌊';
      case 'air_quality': return '🌬️';
      case 'pressure': return '🔽';
      default: return '📊';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'active': return 'text-blue-500';
      case 'good': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'info': return 'border-blue-500 bg-blue-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'critical': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatValue = (sensor) => {
    if (sensor.type === 'motion') {
      return sensor.value === 1 ? 'Detected' : 'Clear';
    }
    if (sensor.type === 'contact') {
      return sensor.value === 1 ? 'Open' : 'Closed';
    }
    return `${sensor.value} ${sensor.unit}`;
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading sensor data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sensor Monitor</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Add Sensor
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Sensors</h3>
            <p className="text-3xl font-bold text-blue-400">{sensors.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Online Sensors</h3>
            <p className="text-3xl font-bold text-green-400">
              {sensors.filter(s => new Date() - new Date(s.lastUpdate.replace(' ', 'T')) < 300000).length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
            <p className="text-3xl font-bold text-yellow-400">{alerts.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Low Battery</h3>
            <p className="text-3xl font-bold text-red-400">
              {sensors.filter(s => s.battery < 20).length}
            </p>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)} text-gray-900`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{alert.sensor}</h3>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-2">{alert.timestamp}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getSensorIcon(sensor.type)}</span>
                  <div>
                    <h3 className="font-semibold">{sensor.name}</h3>
                    <p className="text-sm text-gray-400">{sensor.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${getStatusColor(sensor.status)}`}>
                    ● {sensor.status}
                  </div>
                  <div className={`text-xs ${getBatteryColor(sensor.battery)}`}>
                    🔋 {sensor.battery}%
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {formatValue(sensor)}
                </div>
                <div className="text-sm text-gray-400">
                  Last updated: {sensor.lastUpdate}
                </div>
              </div>

              {/* Mini chart for sensors with historical data */}
              {sensorData[sensor.id] && (
                <div className="mt-4">
                  <div className="h-16 flex items-end space-x-1">
                    {sensorData[sensor.id].slice(-20).map((point, index) => {
                      const maxValue = Math.max(...sensorData[sensor.id].map(p => p.value));
                      const minValue = Math.min(...sensorData[sensor.id].map(p => p.value));
                      const height = ((point.value - minValue) / (maxValue - minValue)) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="bg-blue-500 w-2 rounded-t"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${point.value} ${sensor.unit} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    Last 20 readings
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                  Details
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
