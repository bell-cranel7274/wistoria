import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const EnergyMonitor = () => {
  const [energyData, setEnergyData] = useState({});
  const [devices, setDevices] = useState([]);
  const [currentUsage, setCurrentUsage] = useState({});
  const [costs, setCosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setDevices([
        {
          id: 1,
          name: 'HVAC System',
          location: 'Main Unit',
          currentPower: 2850,
          dailyUsage: 42.5,
          weeklyUsage: 298.5,
          monthlyUsage: 1275.2,
          status: 'active',
          efficiency: 85
        },
        {
          id: 2,
          name: 'Home Server Rack',
          location: 'Basement',
          currentPower: 450,
          dailyUsage: 10.8,
          weeklyUsage: 75.6,
          monthlyUsage: 324.0,
          status: 'active',
          efficiency: 92
        },
        {
          id: 3,
          name: 'Kitchen Appliances',
          location: 'Kitchen',
          currentPower: 1200,
          dailyUsage: 8.5,
          weeklyUsage: 59.5,
          monthlyUsage: 255.0,
          status: 'active',
          efficiency: 78
        },
        {
          id: 4,
          name: 'Living Room Electronics',
          location: 'Living Room',
          currentPower: 320,
          dailyUsage: 6.2,
          weeklyUsage: 43.4,
          monthlyUsage: 186.0,
          status: 'active',
          efficiency: 88
        },
        {
          id: 5,
          name: 'Lighting System',
          location: 'Whole House',
          currentPower: 180,
          dailyUsage: 4.8,
          weeklyUsage: 33.6,
          monthlyUsage: 144.0,
          status: 'active',
          efficiency: 95
        },
        {
          id: 6,
          name: 'Water Heater',
          location: 'Utility Room',
          currentPower: 0,
          dailyUsage: 12.5,
          weeklyUsage: 87.5,
          monthlyUsage: 375.0,
          status: 'standby',
          efficiency: 82
        },
        {
          id: 7,
          name: 'Pool Equipment',
          location: 'Backyard',
          currentPower: 750,
          dailyUsage: 9.2,
          weeklyUsage: 64.4,
          monthlyUsage: 276.0,
          status: 'active',
          efficiency: 75
        },
        {
          id: 8,
          name: 'Workshop Tools',
          location: 'Garage',
          currentPower: 0,
          dailyUsage: 2.1,
          weeklyUsage: 14.7,
          monthlyUsage: 63.0,
          status: 'off',
          efficiency: 70
        }
      ]);

      setCurrentUsage({
        totalPower: 5750,
        voltage: 240,
        current: 23.96,
        powerFactor: 0.95,
        frequency: 60.0
      });

      setCosts({
        ratePerKwh: 0.12,
        dailyCost: 11.45,
        weeklyCost: 80.15,
        monthlyCost: 343.50,
        yearlyProjected: 4122.00
      });

      // Generate historical data for charts
      const generateHourlyData = () => {
        const data = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now - i * 3600000);
          data.push({
            time: timestamp.getHours() + ':00',
            usage: Math.random() * 3 + 2, // 2-5 kW base load with variations
            cost: (Math.random() * 3 + 2) * 0.12
          });
        }
        return data;
      };

      const generateDailyData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toLocaleDateString(),
            usage: Math.random() * 20 + 60, // 60-80 kWh per day
            cost: (Math.random() * 20 + 60) * 0.12
          });
        }
        return data;
      };

      setEnergyData({
        hourly: generateHourlyData(),
        daily: generateDailyData()
      });

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time power usage updates
      setCurrentUsage(prev => ({
        ...prev,
        totalPower: Math.max(0, prev.totalPower + (Math.random() - 0.5) * 200),
        current: Math.max(0, prev.current + (Math.random() - 0.5) * 2)
      }));

      setDevices(prev => prev.map(device => ({
        ...device,
        currentPower: device.status === 'active' 
          ? Math.max(0, device.currentPower + (Math.random() - 0.5) * 50)
          : device.currentPower
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'standby': return 'text-yellow-500';
      case 'off': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-500';
    if (efficiency >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatPower = (watts) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(1)}kW`;
    }
    return `${watts}W`;
  };

  const formatEnergy = (kwh) => {
    return `${kwh.toFixed(1)}kWh`;
  };

  const formatCost = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const toggleDevicePower = (deviceId) => {
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        const newStatus = device.status === 'active' ? 'off' : 'active';
        return {
          ...device,
          status: newStatus,
          currentPower: newStatus === 'active' ? device.currentPower : 0
        };
      }
      return device;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading energy monitoring data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Energy Monitor</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
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
              Export Data
            </button>
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Power</h3>
            <p className="text-3xl font-bold text-blue-400">{formatPower(currentUsage.totalPower)}</p>
            <p className="text-sm text-gray-400">{currentUsage.current.toFixed(2)}A @ {currentUsage.voltage}V</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Today's Usage</h3>
            <p className="text-3xl font-bold text-green-400">{formatEnergy(95.3)}</p>
            <p className="text-sm text-gray-400">+8% from yesterday</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Today's Cost</h3>
            <p className="text-3xl font-bold text-yellow-400">{formatCost(costs.dailyCost)}</p>
            <p className="text-sm text-gray-400">${costs.ratePerKwh}/kWh</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Monthly Est.</h3>
            <p className="text-3xl font-bold text-purple-400">{formatCost(costs.monthlyCost)}</p>
            <p className="text-sm text-gray-400">Based on current usage</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Power Factor</h3>
            <p className="text-3xl font-bold text-red-400">{currentUsage.powerFactor}</p>
            <p className="text-sm text-gray-400">{currentUsage.frequency}Hz</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">24-Hour Usage</h2>
            <div className="h-64 flex items-end space-x-2">
              {energyData.hourly && energyData.hourly.map((point, index) => {
                const maxUsage = Math.max(...energyData.hourly.map(p => p.usage));
                const height = (point.usage / maxUsage) * 100;
                
                return (
                  <div
                    key={index}
                    className="bg-blue-500 flex-1 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${point.time}: ${point.usage.toFixed(1)}kW`}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>00:00</span>
              <span>Current Time</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Base Rate ({costs.ratePerKwh}/kWh)</span>
                <span className="font-semibold">{formatCost(8.45)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Peak Hours Surcharge</span>
                <span className="font-semibold">{formatCost(2.20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Distribution Fee</span>
                <span className="font-semibold">{formatCost(0.55)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxes & Fees</span>
                <span className="font-semibold">{formatCost(0.25)}</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Today</span>
                <span className="text-yellow-400">{formatCost(costs.dailyCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Device Energy Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-sm text-gray-400">{device.location}</p>
                  </div>
                  <button
                    onClick={() => toggleDevicePower(device.id)}
                    className={`w-6 h-6 rounded-full ${
                      device.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    } transition-colors`}
                    title={device.status === 'active' ? 'Turn Off' : 'Turn On'}
                  ></button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current:</span>
                    <span className={getStatusColor(device.status)}>
                      {formatPower(device.currentPower)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Today:</span>
                    <span>{formatEnergy(device.dailyUsage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Week:</span>
                    <span>{formatEnergy(device.weeklyUsage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Month:</span>
                    <span>{formatEnergy(device.monthlyUsage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Efficiency:</span>
                    <span className={getEfficiencyColor(device.efficiency)}>
                      {device.efficiency}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Monthly Usage</span>
                    <span>{Math.round((device.monthlyUsage / 400) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((device.monthlyUsage / 400) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                    Details
                  </button>
                  <button className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Tips */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Energy Saving Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-600 bg-opacity-20 border border-green-600 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">💡 Optimize HVAC</h3>
              <p className="text-sm">Your HVAC system uses 45% of total energy. Consider smart scheduling to reduce usage by 15%.</p>
            </div>
            <div className="bg-blue-600 bg-opacity-20 border border-blue-600 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">⚡ Peak Hour Awareness</h3>
              <p className="text-sm">Energy costs 40% more during peak hours (2-8 PM). Schedule high-usage activities outside these times.</p>
            </div>
            <div className="bg-purple-600 bg-opacity-20 border border-purple-600 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">🔋 Standby Power</h3>
              <p className="text-sm">Electronics in standby mode consume 8% of total energy. Use smart plugs to eliminate phantom loads.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
