# UniFi Controller Integration Guide

Integrate UniFi Controller (Network Application) with your homelab dashboard for comprehensive network management and monitoring.

## Overview

This guide covers integrating UniFi Controller to monitor:
- Access points and switch performance
- Client device tracking and bandwidth usage
- Network health and interference monitoring
- Site and device configuration management
- Real-time traffic analytics and DPI data

## Prerequisites

- UniFi Network Application 7.0+ (formerly UniFi Controller)
- Local user account with admin privileges
- UniFi OS or standalone controller setup
- Network connectivity from dashboard
- HTTPS access to controller (recommended)

## UniFi Controller API Setup

### 1. Create Local Admin User

```bash
# Access UniFi Controller web interface
# Settings > Admins > Add Admin
# Create dedicated API user with Super Administrator role
```

### 2. Enable Advanced Features

```bash
# Settings > System > Advanced
# Enable "Override inform host with controller hostname/IP"
# Enable "Store client fingerprints" for better device identification
```

### 3. Test API Access

```bash
# Test login endpoint
curl -k -X POST https://your-controller:8443/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"api-user","password":"your-password"}'
```

## UniFi API Implementation

```javascript
// services/unifiApi.js
class UniFiAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.username = config.username;
        this.password = config.password;
        this.site = config.site || 'default';
        this.cookies = null;
    }

    async login() {
        try {
            const response = await fetch(`${this.baseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }

            // Store cookies for subsequent requests
            this.cookies = response.headers.get('set-cookie');
            return true;
        } catch (error) {
            console.error('UniFi login failed:', error);
            throw error;
        }
    }

    async getSiteInfo() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/stat/health`);
            return response.data.map(health => ({
                subsystem: health.subsystem,
                status: health.status,
                drops: health.drops || 0,
                latency: health.latency || 0,
                uptime: health.uptime || 0,
                users: health.num_user || 0,
                guests: health.num_guest || 0,
                iot: health.num_iot || 0
            }));
        } catch (error) {
            console.error('Failed to fetch site info:', error);
            return [];
        }
    }

    async getDevices() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/stat/device`);
            return response.data.map(device => ({
                _id: device._id,
                name: device.name || device.model,
                model: device.model,
                type: device.type,
                mac: device.mac,
                ip: device.ip,
                version: device.version,
                state: device.state,
                uptime: device.uptime,
                last_seen: device.last_seen,
                // Access Point specific
                satisfaction: device.satisfaction,
                num_sta: device.num_sta,
                user_num_sta: device['user-num_sta'],
                guest_num_sta: device['guest-num_sta'],
                // Switch specific
                port_overrides: device.port_overrides || [],
                port_table: device.port_table || [],
                // Performance metrics
                cpu: device['system-stats']?.cpu || 0,
                memory: device['system-stats']?.mem || 0,
                temperature: device.general_temperature || device.temperature,
                // Network stats
                tx_bytes: device['tx_bytes-r'] || 0,
                rx_bytes: device['rx_bytes-r'] || 0,
                tx_packets: device['tx_packets-r'] || 0,
                rx_packets: device['rx_packets-r'] || 0
            }));
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            return [];
        }
    }

    async getClients() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/stat/sta`);
            return response.data.map(client => ({
                _id: client._id,
                mac: client.mac,
                ip: client.ip,
                hostname: client.hostname || client.name || 'Unknown',
                alias: client.name,
                is_guest: client.is_guest,
                is_wired: client.is_wired,
                network: client.network,
                essid: client.essid,
                ap_mac: client.ap_mac,
                channel: client.channel,
                radio: client.radio,
                signal: client.signal,
                noise: client.noise,
                rssi: client.rssi,
                satisfaction: client.satisfaction,
                uptime: client.uptime,
                last_seen: client.last_seen,
                first_seen: client.first_seen,
                // Bandwidth usage
                tx_bytes: client['tx_bytes-r'] || 0,
                rx_bytes: client['rx_bytes-r'] || 0,
                tx_rate: client.tx_rate || 0,
                rx_rate: client.rx_rate || 0,
                // Device info
                os_name: client.os_name,
                os_class: client.os_class,
                device_name: client.device_name,
                // Usage stats
                blocked: client.blocked || false,
                noted: client.noted || false
            }));
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            return [];
        }
    }

    async getNetworks() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/rest/networkconf`);
            return response.data.map(network => ({
                _id: network._id,
                name: network.name,
                purpose: network.purpose,
                vlan: network.vlan,
                enabled: network.enabled,
                is_guest: network.is_guest,
                networkgroup: network.networkgroup,
                ip_subnet: network.ip_subnet,
                dhcpd_enabled: network.dhcpd_enabled,
                dhcpd_start: network.dhcpd_start,
                dhcpd_stop: network.dhcpd_stop,
                domain_name: network.domain_name
            }));
        } catch (error) {
            console.error('Failed to fetch networks:', error);
            return [];
        }
    }

    async getWLANGroups() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/rest/wlanconf`);
            return response.data.map(wlan => ({
                _id: wlan._id,
                name: wlan.name,
                enabled: wlan.enabled,
                security: wlan.security,
                wpa_mode: wlan.wpa_mode,
                wpa_enc: wlan.wpa_enc,
                networkconf_id: wlan.networkconf_id,
                minrate_ng_enabled: wlan.minrate_ng_enabled,
                minrate_na_enabled: wlan.minrate_na_enabled,
                mac_filter_enabled: wlan.mac_filter_enabled,
                is_guest: wlan.is_guest,
                schedule_enabled: wlan.schedule_enabled
            }));
        } catch (error) {
            console.error('Failed to fetch WLAN groups:', error);
            return [];
        }
    }

    async getEvents(limit = 100) {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/stat/event?_limit=${limit}`);
            return response.data.map(event => ({
                _id: event._id,
                time: event.time,
                datetime: new Date(event.time * 1000),
                key: event.key,
                subsystem: event.subsystem,
                msg: event.msg,
                user: event.user,
                hostname: event.hostname,
                ap: event.ap,
                radio: event.radio,
                channel: event.channel,
                bytes: event.bytes,
                duration: event.duration
            }));
        } catch (error) {
            console.error('Failed to fetch events:', error);
            return [];
        }
    }

    async getTopApplications(type = 'by_app') {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/stat/sitedpi`);
            return response.data
                .filter(app => app.cat !== undefined)
                .map(app => ({
                    application: app.app || app.cat,
                    category: app.cat,
                    tx_bytes: app.tx_bytes || 0,
                    rx_bytes: app.rx_bytes || 0,
                    total_bytes: (app.tx_bytes || 0) + (app.rx_bytes || 0)
                }))
                .sort((a, b) => b.total_bytes - a.total_bytes)
                .slice(0, 20);
        } catch (error) {
            console.error('Failed to fetch top applications:', error);
            return [];
        }
    }

    async getPortForwardRules() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/rest/portforward`);
            return response.data.map(rule => ({
                _id: rule._id,
                name: rule.name,
                enabled: rule.enabled,
                src: rule.src,
                dst_port: rule.dst_port,
                fwd_ip: rule.fwd_ip,
                fwd_port: rule.fwd_port,
                proto: rule.proto,
                log: rule.log
            }));
        } catch (error) {
            console.error('Failed to fetch port forward rules:', error);
            return [];
        }
    }

    async getFirewallGroups() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/rest/firewallgroup`);
            return response.data.map(group => ({
                _id: group._id,
                name: group.name,
                group_type: group.group_type,
                group_members: group.group_members || []
            }));
        } catch (error) {
            console.error('Failed to fetch firewall groups:', error);
            return [];
        }
    }

    async getSiteSettings() {
        try {
            const response = await this.makeRequest(`/api/s/${this.site}/get/setting`);
            const settings = {};
            response.data.forEach(setting => {
                settings[setting.key] = setting;
            });
            return settings;
        } catch (error) {
            console.error('Failed to fetch site settings:', error);
            return {};
        }
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        // Ensure we're logged in
        if (!this.cookies) {
            await this.login();
        }

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        };

        if (this.cookies) {
            options.headers['Cookie'] = this.cookies;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (response.status === 401) {
            // Token expired, re-login
            await this.login();
            return this.makeRequest(endpoint, method, body);
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default UniFiAPI;
```

## Dashboard Integration

### 1. UniFi Network Monitor Component

```jsx
// components/homelab/UniFiMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Wifi, Router, Users, Activity, Signal, Zap } from 'lucide-react';

const UniFiMonitor = () => {
    const [unifiData, setUnifiData] = useState({
        site: [],
        devices: [],
        clients: [],
        networks: [],
        events: [],
        applications: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUniFiData = async () => {
            setIsLoading(true);
            try {
                const api = new UniFiAPI({
                    baseUrl: process.env.REACT_APP_UNIFI_URL,
                    username: process.env.REACT_APP_UNIFI_USERNAME,
                    password: process.env.REACT_APP_UNIFI_PASSWORD,
                    site: process.env.REACT_APP_UNIFI_SITE || 'default'
                });

                const [site, devices, clients, networks, events, applications] = await Promise.all([
                    api.getSiteInfo(),
                    api.getDevices(),
                    api.getClients(),
                    api.getNetworks(),
                    api.getEvents(50),
                    api.getTopApplications()
                ]);

                setUnifiData({
                    site,
                    devices,
                    clients,
                    networks,
                    events,
                    applications
                });
            } catch (error) {
                console.error('Error fetching UniFi data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUniFiData();
        const interval = setInterval(fetchUniFiData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading UniFi data...</div>;
    }

    const accessPoints = unifiData.devices.filter(d => d.type === 'uap');
    const switches = unifiData.devices.filter(d => d.type === 'usw');
    const gateways = unifiData.devices.filter(d => d.type === 'ugw' || d.type === 'udm');
    const activeClients = unifiData.clients.filter(c => c.last_seen > Date.now() / 1000 - 300); // Active in last 5 minutes

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Access Points */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Wifi className="h-8 w-8 text-blue-400" />
                        <span className="text-sm text-blue-400">
                            {accessPoints.filter(ap => ap.state === 1).length} Online
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Access Points</h3>
                    <div className="text-2xl font-bold text-blue-400">{accessPoints.length}</div>
                    <div className="text-sm text-gray-400 mt-2">
                        {accessPoints.reduce((sum, ap) => sum + (ap.num_sta || 0), 0)} connected devices
                    </div>
                </div>

                {/* Network Devices */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Router className="h-8 w-8 text-green-400" />
                        <span className="text-sm text-green-400">
                            {unifiData.devices.filter(d => d.state === 1).length} Active
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Network Devices</h3>
                    <div className="text-2xl font-bold text-green-400">{unifiData.devices.length}</div>
                    <div className="text-sm text-gray-400 mt-2">
                        {switches.length} switches, {gateways.length} gateways
                    </div>
                </div>

                {/* Connected Clients */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-purple-400" />
                        <span className="text-sm text-purple-400">
                            {activeClients.length} Active
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Connected Clients</h3>
                    <div className="text-2xl font-bold text-purple-400">{unifiData.clients.length}</div>
                    <div className="text-sm text-gray-400 mt-2">
                        {unifiData.clients.filter(c => c.is_wired).length} wired, {' '}
                        {unifiData.clients.filter(c => !c.is_wired).length} wireless
                    </div>
                </div>

                {/* Network Health */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-yellow-400" />
                        <span className="text-sm text-yellow-400">
                            {Math.round(accessPoints.reduce((sum, ap) => sum + (ap.satisfaction || 0), 0) / accessPoints.length)}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Network Health</h3>
                    <div className="text-2xl font-bold text-yellow-400">
                        {unifiData.site.find(s => s.subsystem === 'wlan')?.status || 'OK'}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Avg satisfaction score
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Access Point Details */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Wifi className="h-5 w-5 text-blue-400 mr-2" />
                        Access Points
                    </h3>
                    <div className="space-y-4">
                        {accessPoints.map((ap, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                <div className="flex-1">
                                    <div className="font-medium">{ap.name}</div>
                                    <div className="text-sm text-gray-400">{ap.model} - {ap.ip}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {ap.num_sta} clients • {ap.satisfaction}% satisfaction
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`w-3 h-3 rounded-full ${
                                        ap.state === 1 ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {ap.uptime ? formatUptime(ap.uptime) : 'Offline'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Applications */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                        Top Applications
                    </h3>
                    <div className="space-y-3">
                        {unifiData.applications.slice(0, 8).map((app, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300">{app.application}</span>
                                <div className="text-right">
                                    <span className="text-blue-400 font-medium">
                                        {formatBytes(app.total_bytes)}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        ↑{formatBytes(app.tx_bytes)} ↓{formatBytes(app.rx_bytes)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Clients */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 text-purple-400 mr-2" />
                        Recent Clients
                    </h3>
                    <div className="space-y-3">
                        {activeClients.slice(0, 8).map((client, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="text-gray-300">{client.hostname}</div>
                                    <div className="text-xs text-gray-500">
                                        {client.ip} • {client.is_wired ? 'Wired' : `WiFi (${client.essid})`}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {!client.is_wired && (
                                        <div className="flex items-center">
                                            <Signal className="h-4 w-4 text-green-400 mr-1" />
                                            <span className="text-sm text-green-400">{client.signal}dBm</span>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        {formatBytes(client.tx_bytes + client.rx_bytes)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Events */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="h-5 w-5 text-orange-400 mr-2" />
                        Recent Events
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {unifiData.events.slice(0, 10).map((event, index) => (
                            <div key={index} className="text-sm">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-300 flex-1 mr-2">{event.msg}</span>
                                    <span className="text-gray-500 text-xs">
                                        {event.datetime.toLocaleTimeString()}
                                    </span>
                                </div>
                                {event.user && (
                                    <div className="text-xs text-gray-500">User: {event.user}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default UniFiMonitor;
```

## Configuration

### Environment Variables

```bash
# .env
REACT_APP_UNIFI_URL=https://your-controller:8443
REACT_APP_UNIFI_USERNAME=api-user
REACT_APP_UNIFI_PASSWORD=your-password
REACT_APP_UNIFI_SITE=default
```

### Integration with Homelab Context

```javascript
// Add to homelabConstants.js
export const UNIFI_ENDPOINTS = {
    login: '/api/login',
    logout: '/api/logout',
    sites: '/api/self/sites',
    devices: '/api/s/{site}/stat/device',
    clients: '/api/s/{site}/stat/sta',
    health: '/api/s/{site}/stat/health',
    events: '/api/s/{site}/stat/event',
    dpi: '/api/s/{site}/stat/sitedpi'
};

export const UNIFI_REFRESH_INTERVALS = {
    devices: 30000,     // 30 seconds
    clients: 15000,     // 15 seconds  
    events: 60000,      // 1 minute
    health: 30000       // 30 seconds
};
```

## Advanced Features

### 1. Network Topology Visualization

```jsx
// Network topology component showing device relationships
const NetworkTopology = ({ devices, clients }) => {
    // Implementation for visualizing network structure
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Network Topology</h3>
            {/* SVG or Canvas-based network diagram */}
        </div>
    );
};
```

### 2. Client Bandwidth Monitoring

```jsx
// Real-time bandwidth monitoring for clients
const BandwidthMonitor = ({ clients }) => {
    const topClients = clients
        .sort((a, b) => (b.tx_bytes + b.rx_bytes) - (a.tx_bytes + a.rx_bytes))
        .slice(0, 10);

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Bandwidth Usage</h3>
            <div className="space-y-3">
                {topClients.map((client, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-300">{client.hostname}</span>
                        <div className="text-right">
                            <div className="text-blue-400">
                                {formatBandwidth(client.tx_bytes + client.rx_bytes)}
                            </div>
                            <div className="text-xs text-gray-500">
                                ↑{client.tx_rate} ↓{client.rx_rate} Mbps
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### 3. WiFi Heatmap Data

```jsx
// Component for displaying WiFi signal strength across APs
const WiFiHeatmap = ({ accessPoints }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">WiFi Coverage</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {accessPoints.map((ap, index) => (
                    <div key={index} className="text-center p-3 bg-gray-700/50 rounded">
                        <div className="font-medium">{ap.name}</div>
                        <div className="text-sm text-gray-400">{ap.model}</div>
                        <div className="mt-2">
                            <div className={`inline-block px-2 py-1 rounded text-xs ${
                                ap.satisfaction > 80 ? 'bg-green-500/20 text-green-400' :
                                ap.satisfaction > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {ap.satisfaction}% satisfaction
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {ap.num_sta} clients
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## Security and Best Practices

1. **Dedicated API User**: Create a separate admin account for API access
2. **HTTPS Only**: Always use HTTPS for controller communication
3. **Network Segmentation**: Isolate management traffic when possible
4. **Rate Limiting**: Implement reasonable API call frequencies
5. **Error Handling**: Gracefully handle authentication failures and network issues
6. **Session Management**: Properly handle login sessions and timeouts

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**: Use self-signed certificate options or install proper certificates
2. **Authentication Failures**: Verify username/password and admin privileges
3. **CORS Issues**: Configure UniFi Controller to allow cross-origin requests
4. **Session Timeouts**: Implement automatic re-authentication logic
5. **Slow API Response**: Optimize query frequency and data filtering

### Debug Commands

```bash
# Test UniFi Controller connectivity
curl -k https://your-controller:8443/status

# Test API login
curl -k -X POST https://your-controller:8443/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Check UniFi logs
tail -f /usr/lib/unifi/logs/server.log
```

This integration provides comprehensive UniFi network monitoring capabilities, giving you complete visibility into your wireless and wired network infrastructure from your homelab dashboard.
