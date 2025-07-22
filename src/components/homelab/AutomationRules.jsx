import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const AutomationRules = () => {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setRules([
        {
          id: 1,
          name: 'Evening Lights',
          description: 'Turn on living room lights when motion is detected after sunset',
          enabled: true,
          trigger: {
            type: 'sensor',
            sensor: 'motion_living_room',
            condition: 'motion_detected',
            timeConstraint: 'after_sunset'
          },
          actions: [
            { type: 'device', device: 'living_room_lights', action: 'turn_on', value: 80 }
          ],
          lastTriggered: '2024-01-15 19:45',
          executions: 45
        },
        {
          id: 2,
          name: 'Security Mode',
          description: 'Activate security cameras and send alert when door opens during night',
          enabled: true,
          trigger: {
            type: 'sensor',
            sensor: 'front_door_contact',
            condition: 'door_open',
            timeConstraint: '22:00-06:00'
          },
          actions: [
            { type: 'device', device: 'security_cameras', action: 'start_recording' },
            { type: 'notification', service: 'email', message: 'Front door opened during night' }
          ],
          lastTriggered: '2024-01-14 23:30',
          executions: 3
        },
        {
          id: 3,
          name: 'Climate Control',
          description: 'Adjust thermostat based on temperature and occupancy',
          enabled: true,
          trigger: {
            type: 'sensor',
            sensor: 'living_room_temperature',
            condition: 'above_25C',
            timeConstraint: 'when_home'
          },
          actions: [
            { type: 'device', device: 'thermostat', action: 'set_temperature', value: 22 },
            { type: 'device', device: 'ceiling_fan', action: 'turn_on', value: 'medium' }
          ],
          lastTriggered: '2024-01-15 14:20',
          executions: 12
        },
        {
          id: 4,
          name: 'Energy Saving',
          description: 'Turn off all non-essential devices when no motion for 30 minutes',
          enabled: false,
          trigger: {
            type: 'time',
            condition: 'no_motion_30min',
            timeConstraint: 'any'
          },
          actions: [
            { type: 'device', device: 'tv', action: 'turn_off' },
            { type: 'device', device: 'stereo', action: 'turn_off' },
            { type: 'device', device: 'ambient_lights', action: 'turn_off' }
          ],
          lastTriggered: '2024-01-13 22:15',
          executions: 89
        },
        {
          id: 5,
          name: 'Garden Irrigation',
          description: 'Water garden if soil moisture is low and no rain forecast',
          enabled: true,
          trigger: {
            type: 'scheduled',
            schedule: 'daily_6am',
            condition: 'soil_moisture_low'
          },
          actions: [
            { type: 'device', device: 'garden_sprinklers', action: 'run_cycle', value: '15min' },
            { type: 'log', message: 'Garden irrigation cycle started' }
          ],
          lastTriggered: '2024-01-15 06:00',
          executions: 156
        }
      ]);

      setDevices([
        { id: 'living_room_lights', name: 'Living Room Lights', type: 'light' },
        { id: 'security_cameras', name: 'Security Cameras', type: 'camera' },
        { id: 'thermostat', name: 'Main Thermostat', type: 'climate' },
        { id: 'ceiling_fan', name: 'Ceiling Fan', type: 'fan' },
        { id: 'tv', name: 'Living Room TV', type: 'entertainment' },
        { id: 'stereo', name: 'Stereo System', type: 'entertainment' },
        { id: 'ambient_lights', name: 'Ambient Lights', type: 'light' },
        { id: 'garden_sprinklers', name: 'Garden Sprinklers', type: 'irrigation' }
      ]);

      setSensors([
        { id: 'motion_living_room', name: 'Living Room Motion', type: 'motion' },
        { id: 'front_door_contact', name: 'Front Door Contact', type: 'contact' },
        { id: 'living_room_temperature', name: 'Living Room Temperature', type: 'temperature' },
        { id: 'soil_moisture', name: 'Garden Soil Moisture', type: 'moisture' }
      ]);

      setExecutionLog([
        { id: 1, timestamp: '2024-01-15 19:45', rule: 'Evening Lights', status: 'success', message: 'Turned on living room lights (80%)' },
        { id: 2, timestamp: '2024-01-15 14:20', rule: 'Climate Control', status: 'success', message: 'Set thermostat to 22°C, turned on ceiling fan' },
        { id: 3, timestamp: '2024-01-15 06:00', rule: 'Garden Irrigation', status: 'success', message: 'Started 15-minute irrigation cycle' },
        { id: 4, timestamp: '2024-01-14 23:30', rule: 'Security Mode', status: 'success', message: 'Activated cameras, sent notification' },
        { id: 5, timestamp: '2024-01-14 18:22', rule: 'Evening Lights', status: 'failed', message: 'Failed to communicate with living room lights' }
      ]);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const getStatusColor = (enabled) => {
    return enabled ? 'text-green-500' : 'text-gray-500';
  };

  const getTriggerIcon = (type) => {
    switch (type) {
      case 'sensor': return '📡';
      case 'time': return '⏰';
      case 'scheduled': return '📅';
      default: return '⚡';
    }
  };

  const getExecutionStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatTriggerCondition = (trigger) => {
    switch (trigger.type) {
      case 'sensor':
        return `${trigger.sensor} ${trigger.condition} ${trigger.timeConstraint ? `(${trigger.timeConstraint})` : ''}`;
      case 'time':
        return `${trigger.condition} ${trigger.timeConstraint ? `(${trigger.timeConstraint})` : ''}`;
      case 'scheduled':
        return `${trigger.schedule} ${trigger.condition ? `if ${trigger.condition}` : ''}`;
      default:
        return 'Unknown condition';
    }
  };

  const formatActions = (actions) => {
    return actions.map(action => {
      switch (action.type) {
        case 'device':
          return `${action.device}: ${action.action}${action.value ? ` (${action.value})` : ''}`;
        case 'notification':
          return `Send ${action.service}: ${action.message}`;
        case 'log':
          return `Log: ${action.message}`;
        default:
          return 'Unknown action';
      }
    }).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading automation rules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Automation Rules Engine</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Rule
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              Import Rules
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Rules</h3>
            <p className="text-3xl font-bold text-blue-400">{rules.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Rules</h3>
            <p className="text-3xl font-bold text-green-400">
              {rules.filter(r => r.enabled).length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Today's Executions</h3>
            <p className="text-3xl font-bold text-purple-400">
              {executionLog.filter(log => log.timestamp.startsWith('2024-01-15')).length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-yellow-400">96%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Automation Rules */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Automation Rules</h2>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-gray-700 p-5 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTriggerIcon(rule.trigger.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{rule.name}</h3>
                        <p className="text-sm text-gray-400">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm ${getStatusColor(rule.enabled)}`}>
                        ● {rule.enabled ? 'Active' : 'Disabled'}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleRule(rule.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Trigger:</span>
                      <p className="text-white mt-1">{formatTriggerCondition(rule.trigger)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Actions:</span>
                      <p className="text-white mt-1">{formatActions(rule.actions)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Triggered:</span>
                      <p className="text-white mt-1">{rule.lastTriggered}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Executions:</span>
                      <p className="text-white mt-1">{rule.executions} times</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedRule(rule)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors">
                      Test
                    </button>
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Log */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Execution Log</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executionLog.map((log) => (
                <div key={log.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{log.rule}</span>
                    <span className={getExecutionStatusColor(log.status)}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{log.message}</p>
                  <p className="text-gray-400 text-xs">{log.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Available Devices</h2>
            <div className="grid grid-cols-2 gap-3">
              {devices.map((device) => (
                <div key={device.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="font-semibold">{device.name}</div>
                  <div className="text-gray-400 text-xs">{device.type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Available Sensors</h2>
            <div className="grid grid-cols-2 gap-3">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="font-semibold">{sensor.name}</div>
                  <div className="text-gray-400 text-xs">{sensor.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
