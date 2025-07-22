# Home Assistant Integration Guide

Integrate Home Assistant with your homelab dashboard for comprehensive smart home monitoring and control.

## Overview

This guide covers integrating Home Assistant to monitor and control:
- Smart devices and sensors throughout your home
- Energy consumption and environmental monitoring
- Automation status and trigger management
- Security system integration and alerts
- Climate control and lighting management

## Prerequisites

- Home Assistant 2023.1+ with Supervisor or Core installation
- Long-lived access token for API authentication
- Network connectivity from dashboard to Home Assistant
- HTTPS recommended for secure communication

## Home Assistant API Setup

### 1. Create Long-Lived Access Token

```bash
# In Home Assistant UI:
# Profile > Security > Long-lived access tokens
# Create token for "Homelab Dashboard" integration
```

### 2. Enable Advanced Mode (Optional)

```bash
# Profile > Advanced Mode (toggle on)
# This enables access to additional features and entities
```

### 3. Test API Access

```bash
# Test authentication
curl -X GET \
  -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN" \
  -H "Content-Type: application/json" \
  http://your-homeassistant:8123/api/
```

## Home Assistant API Implementation

```javascript
// services/homeAssistantApi.js
class HomeAssistantAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.token = config.token;
        this.websocket = null;
        this.messageId = 1;
        this.subscribers = new Map();
    }

    async getStates() {
        try {
            const response = await this.makeRequest('/api/states');
            return response.map(state => ({
                entity_id: state.entity_id,
                state: state.state,
                attributes: state.attributes,
                last_changed: new Date(state.last_changed),
                last_updated: new Date(state.last_updated),
                context: state.context
            }));
        } catch (error) {
            console.error('Failed to fetch Home Assistant states:', error);
            return [];
        }
    }

    async getState(entityId) {
        try {
            const response = await this.makeRequest(`/api/states/${entityId}`);
            return {
                entity_id: response.entity_id,
                state: response.state,
                attributes: response.attributes,
                last_changed: new Date(response.last_changed),
                last_updated: new Date(response.last_updated)
            };
        } catch (error) {
            console.error(`Failed to fetch state for ${entityId}:`, error);
            return null;
        }
    }

    async getServices() {
        try {
            const response = await this.makeRequest('/api/services');
            return Object.entries(response).map(([domain, services]) => ({
                domain,
                services: Object.entries(services).map(([service, details]) => ({
                    service,
                    description: details.description,
                    fields: details.fields || {}
                }))
            }));
        } catch (error) {
            console.error('Failed to fetch services:', error);
            return [];
        }
    }

    async getConfig() {
        try {
            const response = await this.makeRequest('/api/config');
            return {
                location_name: response.location_name,
                latitude: response.latitude,
                longitude: response.longitude,
                elevation: response.elevation,
                unit_system: response.unit_system,
                time_zone: response.time_zone,
                components: response.components,
                version: response.version,
                config_dir: response.config_dir,
                whitelist_external_dirs: response.whitelist_external_dirs,
                safe_mode: response.safe_mode
            };
        } catch (error) {
            console.error('Failed to fetch config:', error);
            return null;
        }
    }

    async callService(domain, service, entityId = null, serviceData = {}) {
        try {
            const data = {
                ...serviceData
            };

            if (entityId) {
                data.entity_id = entityId;
            }

            const response = await this.makeRequest(`/api/services/${domain}/${service}`, 'POST', data);
            return response;
        } catch (error) {
            console.error(`Failed to call service ${domain}.${service}:`, error);
            throw error;
        }
    }

    async getHistory(entityId, startTime, endTime = null) {
        try {
            const start = startTime.toISOString();
            const end = endTime ? endTime.toISOString() : new Date().toISOString();
            
            const response = await this.makeRequest(
                `/api/history/period/${start}?filter_entity_id=${entityId}&end_time=${end}`
            );

            return response.flat().map(item => ({
                entity_id: item.entity_id,
                state: item.state,
                attributes: item.attributes,
                last_changed: new Date(item.last_changed),
                last_updated: new Date(item.last_updated)
            }));
        } catch (error) {
            console.error(`Failed to fetch history for ${entityId}:`, error);
            return [];
        }
    }

    async getEvents(eventType = null, startTime = null) {
        try {
            let url = '/api/events';
            if (eventType) {
                url += `/${eventType}`;
            }

            const response = await this.makeRequest(url);
            return response.map(event => ({
                event_type: event.event_type,
                data: event.data,
                origin: event.origin,
                time_fired: new Date(event.time_fired),
                context: event.context
            }));
        } catch (error) {
            console.error('Failed to fetch events:', error);
            return [];
        }
    }

    async getLogbook(startTime, endTime = null, entityId = null) {
        try {
            const start = startTime.toISOString();
            let url = `/api/logbook/${start}`;
            
            const params = new URLSearchParams();
            if (endTime) {
                params.append('end_time', endTime.toISOString());
            }
            if (entityId) {
                params.append('entity', entityId);
            }

            if (params.toString()) {
                url += `?${params}`;
            }

            const response = await this.makeRequest(url);
            return response.map(entry => ({
                when: new Date(entry.when),
                name: entry.name,
                message: entry.message,
                domain: entry.domain,
                entity_id: entry.entity_id
            }));
        } catch (error) {
            console.error('Failed to fetch logbook:', error);
            return [];
        }
    }

    // Utility methods for common device types
    async getLights() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('light.'))
            .map(light => ({
                ...light,
                is_on: light.state === 'on',
                brightness: light.attributes.brightness || null,
                color: light.attributes.rgb_color || null,
                color_temp: light.attributes.color_temp || null
            }));
    }

    async getSwitches() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('switch.'))
            .map(switch_entity => ({
                ...switch_entity,
                is_on: switch_entity.state === 'on'
            }));
    }

    async getSensors() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('sensor.'))
            .map(sensor => ({
                ...sensor,
                numeric_value: isNaN(parseFloat(sensor.state)) ? null : parseFloat(sensor.state),
                unit_of_measurement: sensor.attributes.unit_of_measurement || null,
                device_class: sensor.attributes.device_class || null
            }));
    }

    async getClimate() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('climate.'))
            .map(climate => ({
                ...climate,
                current_temperature: parseFloat(climate.attributes.current_temperature) || null,
                target_temperature: parseFloat(climate.attributes.temperature) || null,
                hvac_mode: climate.state,
                hvac_modes: climate.attributes.hvac_modes || [],
                preset_mode: climate.attributes.preset_mode || null
            }));
    }

    async getBinarySensors() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('binary_sensor.'))
            .map(sensor => ({
                ...sensor,
                is_on: sensor.state === 'on',
                device_class: sensor.attributes.device_class || null
            }));
    }

    async getAutomations() {
        const states = await this.getStates();
        return states
            .filter(state => state.entity_id.startsWith('automation.'))
            .map(automation => ({
                ...automation,
                is_enabled: automation.state === 'on',
                last_triggered: automation.attributes.last_triggered 
                    ? new Date(automation.attributes.last_triggered) 
                    : null
            }));
    }

    // WebSocket connection for real-time updates
    connectWebSocket() {
        const wsUrl = this.baseUrl.replace('http', 'ws') + '/api/websocket';
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('Connected to Home Assistant WebSocket');
        };

        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };

        this.websocket.onclose = () => {
            console.log('Disconnected from Home Assistant WebSocket');
            // Reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(message) {
        if (message.type === 'auth_required') {
            this.websocket.send(JSON.stringify({
                type: 'auth',
                access_token: this.token
            }));
        } else if (message.type === 'auth_ok') {
            // Subscribe to state changes
            this.websocket.send(JSON.stringify({
                id: this.messageId++,
                type: 'subscribe_events',
                event_type: 'state_changed'
            }));
        } else if (message.type === 'event') {
            // Handle state change events
            this.notifySubscribers('state_changed', message.event);
        }
    }

    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
    }

    notifySubscribers(eventType, data) {
        const callbacks = this.subscribers.get(eventType) || [];
        callbacks.forEach(callback => callback(data));
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default HomeAssistantAPI;
```

## Dashboard Integration

### 1. Home Assistant Monitor Component

```jsx
// components/homelab/HomeAssistantMonitor.jsx
import React, { useState, useEffect } from 'react';
import { 
    Home, Lightbulb, Thermometer, Shield, Zap, 
    Activity, Users, AlertTriangle, Power, Wifi
} from 'lucide-react';

const HomeAssistantMonitor = () => {
    const [homeAssistantData, setHomeAssistantData] = useState({
        config: null,
        lights: [],
        sensors: [],
        climate: [],
        switches: [],
        binarySensors: [],
        automations: [],
        recent_activity: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHomeAssistantData = async () => {
            setIsLoading(true);
            try {
                const api = new HomeAssistantAPI({
                    baseUrl: process.env.REACT_APP_HOMEASSISTANT_URL,
                    token: process.env.REACT_APP_HOMEASSISTANT_TOKEN
                });

                const [config, lights, sensors, climate, switches, binarySensors, automations] = await Promise.all([
                    api.getConfig(),
                    api.getLights(),
                    api.getSensors(),
                    api.getClimate(),
                    api.getSwitches(),
                    api.getBinarySensors(),
                    api.getAutomations()
                ]);

                // Get recent activity from logbook
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const recent_activity = await api.getLogbook(yesterday);

                setHomeAssistantData({
                    config,
                    lights,
                    sensors,
                    climate,
                    switches,
                    binarySensors,
                    automations,
                    recent_activity: recent_activity.slice(0, 10)
                });

                // Connect to WebSocket for real-time updates
                api.connectWebSocket();
                api.subscribe('state_changed', (event) => {
                    // Handle real-time state changes
                    console.log('State changed:', event);
                });

            } catch (error) {
                console.error('Error fetching Home Assistant data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeAssistantData();
        const interval = setInterval(fetchHomeAssistantData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading Home Assistant data...</div>;
    }

    const activeLights = homeAssistantData.lights.filter(light => light.is_on);
    const activeSwitches = homeAssistantData.switches.filter(switch_entity => switch_entity.is_on);
    const openSensors = homeAssistantData.binarySensors.filter(sensor => sensor.is_on);
    const enabledAutomations = homeAssistantData.automations.filter(auto => auto.is_enabled);

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Home Status */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Home className="h-8 w-8 text-blue-400" />
                        <span className="text-sm text-blue-400">
                            v{homeAssistantData.config?.version}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Home Status</h3>
                    <div className="text-lg font-bold text-blue-400">
                        {homeAssistantData.config?.location_name || 'Home'}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {homeAssistantData.config?.time_zone}
                    </div>
                </div>

                {/* Lighting */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Lightbulb className="h-8 w-8 text-yellow-400" />
                        <span className="text-sm text-yellow-400">
                            {activeLights.length} On
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Lighting</h3>
                    <div className="text-2xl font-bold text-yellow-400">
                        {homeAssistantData.lights.length}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {activeSwitches.length} switches active
                    </div>
                </div>

                {/* Climate */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Thermometer className="h-8 w-8 text-green-400" />
                        <span className="text-sm text-green-400">
                            {homeAssistantData.climate.length} Zones
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Climate</h3>
                    <div className="text-2xl font-bold text-green-400">
                        {homeAssistantData.climate[0]?.current_temperature?.toFixed(1) || '--'}°
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Target: {homeAssistantData.climate[0]?.target_temperature?.toFixed(1) || '--'}°
                    </div>
                </div>

                {/* Security */}
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="h-8 w-8 text-red-400" />
                        <span className="text-sm text-red-400">
                            {openSensors.length} Open
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Security</h3>
                    <div className="text-2xl font-bold text-red-400">
                        {homeAssistantData.binarySensors.filter(s => s.attributes.device_class === 'door' || s.attributes.device_class === 'window').length}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Doors & Windows
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Status */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Power className="h-5 w-5 text-blue-400 mr-2" />
                        Device Status
                    </h3>
                    <div className="space-y-4">
                        {/* Lights */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-300">Lights</span>
                                <span className="text-yellow-400">{activeLights.length}/{homeAssistantData.lights.length}</span>
                            </div>
                            <div className="space-y-2">
                                {activeLights.slice(0, 3).map((light, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">{light.attributes.friendly_name || light.entity_id}</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                                            <span className="text-yellow-400">
                                                {light.brightness ? `${Math.round(light.brightness / 255 * 100)}%` : 'On'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Climate */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-300">Climate</span>
                                <span className="text-green-400">{homeAssistantData.climate.length} zones</span>
                            </div>
                            <div className="space-y-2">
                                {homeAssistantData.climate.slice(0, 3).map((climate, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">{climate.attributes.friendly_name || climate.entity_id}</span>
                                        <div className="text-green-400">
                                            {climate.current_temperature?.toFixed(1)}° → {climate.target_temperature?.toFixed(1)}°
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sensors */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="h-5 w-5 text-purple-400 mr-2" />
                        Sensor Readings
                    </h3>
                    <div className="space-y-3">
                        {homeAssistantData.sensors
                            .filter(sensor => sensor.numeric_value !== null && sensor.attributes.device_class)
                            .slice(0, 6)
                            .map((sensor, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300">
                                    {sensor.attributes.friendly_name || sensor.entity_id.replace('sensor.', '').replace(/_/g, ' ')}
                                </span>
                                <span className="text-purple-400 font-medium">
                                    {sensor.numeric_value} {sensor.unit_of_measurement}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automations */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Zap className="h-5 w-5 text-orange-400 mr-2" />
                        Automations
                    </h3>
                    <div className="space-y-3">
                        {homeAssistantData.automations.slice(0, 6).map((automation, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300">
                                    {automation.attributes.friendly_name || automation.entity_id.replace('automation.', '').replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                        automation.is_enabled ? 'bg-green-400' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="text-xs text-gray-500">
                                        {automation.last_triggered 
                                            ? automation.last_triggered.toLocaleDateString()
                                            : 'Never'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 text-cyan-400 mr-2" />
                        Recent Activity
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {homeAssistantData.recent_activity.map((activity, index) => (
                            <div key={index} className="text-sm">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-300 flex-1 mr-2">{activity.message}</span>
                                    <span className="text-gray-500 text-xs">
                                        {activity.when.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">{activity.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAssistantMonitor;
```

### 2. Device Control Components

```jsx
// components/homelab/SmartDeviceControls.jsx
import React, { useState } from 'react';
import { Lightbulb, Power, Thermometer, Volume2 } from 'lucide-react';

const SmartDeviceControls = ({ homeAssistantApi }) => {
    const [controllingDevice, setControllingDevice] = useState(null);

    const toggleLight = async (entityId, currentState) => {
        setControllingDevice(entityId);
        try {
            await homeAssistantApi.callService(
                'light', 
                currentState ? 'turn_off' : 'turn_on',
                entityId
            );
        } catch (error) {
            console.error('Failed to toggle light:', error);
        } finally {
            setControllingDevice(null);
        }
    };

    const adjustBrightness = async (entityId, brightness) => {
        try {
            await homeAssistantApi.callService(
                'light',
                'turn_on',
                entityId,
                { brightness: Math.round(brightness * 255 / 100) }
            );
        } catch (error) {
            console.error('Failed to adjust brightness:', error);
        }
    };

    const setClimate = async (entityId, temperature) => {
        try {
            await homeAssistantApi.callService(
                'climate',
                'set_temperature',
                entityId,
                { temperature }
            );
        } catch (error) {
            console.error('Failed to set temperature:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Light Controls */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 text-yellow-400 mr-2" />
                    Quick Light Controls
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Light control buttons would be populated from props */}
                    <button className="flex items-center justify-center p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded border border-yellow-500/30 transition-colors">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Living Room
                    </button>
                    <button className="flex items-center justify-center p-3 bg-gray-600/20 hover:bg-gray-600/30 rounded border border-gray-600/30 transition-colors">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Kitchen
                    </button>
                </div>
            </div>

            {/* Climate Controls */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold mb-3 flex items-center">
                    <Thermometer className="h-4 w-4 text-green-400 mr-2" />
                    Climate Controls
                </h4>
                <div className="flex items-center space-x-4">
                    <button className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded border border-blue-500/30">
                        68°F
                    </button>
                    <button className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded border border-green-500/30">
                        72°F
                    </button>
                    <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30">
                        76°F
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartDeviceControls;
```

## Configuration

### Environment Variables

```bash
# .env
REACT_APP_HOMEASSISTANT_URL=http://your-homeassistant:8123
REACT_APP_HOMEASSISTANT_TOKEN=your-long-lived-access-token
```

### Integration with Homelab Context

```javascript
// Add to homelabConstants.js
export const HOMEASSISTANT_ENDPOINTS = {
    states: '/api/states',
    services: '/api/services',
    config: '/api/config',
    events: '/api/events',
    history: '/api/history/period',
    logbook: '/api/logbook',
    websocket: '/api/websocket'
};

export const HOMEASSISTANT_DEVICE_CLASSES = {
    binary_sensor: ['door', 'window', 'motion', 'smoke', 'gas', 'moisture'],
    sensor: ['temperature', 'humidity', 'pressure', 'illuminance', 'energy', 'power'],
    cover: ['window', 'door', 'garage', 'curtain', 'blind', 'shutter']
};
```

## Advanced Features

### 1. Energy Monitoring Dashboard

```jsx
// Energy consumption tracking
const EnergyMonitor = ({ sensors }) => {
    const energySensors = sensors.filter(s => 
        s.attributes.device_class === 'energy' || 
        s.attributes.device_class === 'power'
    );

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Energy Consumption</h3>
            <div className="space-y-3">
                {energySensors.map((sensor, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-300">{sensor.attributes.friendly_name}</span>
                        <span className="text-blue-400 font-medium">
                            {sensor.numeric_value} {sensor.unit_of_measurement}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### 2. Scene Control

```jsx
// Scene activation controls
const SceneControls = ({ homeAssistantApi }) => {
    const activateScene = async (sceneId) => {
        try {
            await homeAssistantApi.callService('scene', 'turn_on', sceneId);
        } catch (error) {
            console.error('Failed to activate scene:', error);
        }
    };

    const scenes = [
        { id: 'scene.movie_night', name: 'Movie Night', icon: '🎬' },
        { id: 'scene.bedtime', name: 'Bedtime', icon: '😴' },
        { id: 'scene.morning', name: 'Morning', icon: '☀️' },
        { id: 'scene.away', name: 'Away', icon: '🔒' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scenes.map((scene, index) => (
                <button
                    key={index}
                    onClick={() => activateScene(scene.id)}
                    className="flex flex-col items-center p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded border border-purple-500/30 transition-colors"
                >
                    <span className="text-2xl mb-2">{scene.icon}</span>
                    <span className="text-sm text-center">{scene.name}</span>
                </button>
            ))}
        </div>
    );
};
```

## Security and Best Practices

1. **Long-lived Tokens**: Use dedicated tokens with minimal required permissions
2. **HTTPS Communication**: Always use HTTPS for Home Assistant API access
3. **Network Segmentation**: Isolate IoT devices on separate network segments
4. **Rate Limiting**: Implement proper rate limiting for API calls
5. **Error Handling**: Gracefully handle device unavailability and network issues
6. **Privacy**: Be mindful of sensitive data when displaying device information

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Verify long-lived access token is valid
2. **CORS Errors**: Configure Home Assistant to allow cross-origin requests
3. **WebSocket Connection Issues**: Check network connectivity and firewall rules
4. **Device Unavailable**: Handle offline devices gracefully in UI
5. **Slow Response Times**: Optimize API polling intervals and WebSocket usage

### Debug Commands

```bash
# Test Home Assistant API
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  http://your-homeassistant:8123/api/

# Check Home Assistant logs
docker logs homeassistant

# Test WebSocket connection
wscat -c ws://your-homeassistant:8123/api/websocket
```

This integration provides comprehensive smart home monitoring and control capabilities, allowing you to manage your entire Home Assistant ecosystem directly from your homelab dashboard with real-time updates and intuitive controls.
