# pfSense/OPNsense Integration Guide

Integrate your pfSense or OPNsense firewall with your homelab dashboard for comprehensive network monitoring and management.

## Overview

This guide covers integrating pfSense and OPNsense firewalls to monitor:
- Network traffic and bandwidth usage
- Active connections and firewall rules
- VPN connections and users
- System performance metrics
- Security events and logs

## Prerequisites

- pfSense 2.6+ or OPNsense 21.7+
- API access enabled on firewall
- Network connectivity from dashboard to firewall
- Admin privileges on firewall

## pfSense Integration

### 1. Enable API Access

```bash
# Install pfSense API package
System > Package Manager > Available Packages
# Search for "pfSense-pkg-API" and install
```

### 2. Configure API User

```xml
<!-- System > User Manager > Add User -->
<user>
    <username>homelab-api</username>
    <password>secure-random-password</password>
    <privileges>
        <privilege>WebCfg - Status: Interfaces page</privilege>
        <privilege>WebCfg - Status: System logs page</privilege>
        <privilege>WebCfg - Status: Traffic Graph page</privilege>
        <privilege>WebCfg - Diagnostics: Interface Statistics page</privilege>
    </privileges>
</user>
```

### 3. API Implementation

```javascript
// services/pfSenseApi.js
class PfSenseAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.auth = {
            client_id: config.clientId,
            client_token: config.clientToken
        };
    }

    async getSystemInfo() {
        try {
            const response = await this.makeRequest('/api/v1/status/system');
            return {
                hostname: response.hostname,
                platform: response.platform,
                version: response.version,
                uptime: response.uptime,
                cpu_usage: response.cpu.usage,
                memory_usage: response.memory.usage,
                temperature: response.temperature
            };
        } catch (error) {
            console.error('Failed to fetch pfSense system info:', error);
            return null;
        }
    }

    async getInterfaceStats() {
        try {
            const response = await this.makeRequest('/api/v1/status/interface');
            return Object.entries(response).map(([name, data]) => ({
                name,
                status: data.status,
                ipv4_address: data.ipaddr,
                subnet: data.subnet,
                bytes_in: parseInt(data.inbytes),
                bytes_out: parseInt(data.outbytes),
                packets_in: parseInt(data.inpkts),
                packets_out: parseInt(data.outpkts),
                errors_in: parseInt(data.inerrs),
                errors_out: parseInt(data.outerrs)
            }));
        } catch (error) {
            console.error('Failed to fetch interface stats:', error);
            return [];
        }
    }

    async getFirewallRules() {
        try {
            const response = await this.makeRequest('/api/v1/firewall/rule');
            return response.map(rule => ({
                id: rule.id,
                interface: rule.interface,
                protocol: rule.protocol,
                source: rule.source,
                destination: rule.destination,
                description: rule.descr,
                enabled: rule.disabled !== 'true',
                action: rule.type === 'pass' ? 'Allow' : 'Block'
            }));
        } catch (error) {
            console.error('Failed to fetch firewall rules:', error);
            return [];
        }
    }

    async getVPNConnections() {
        try {
            const response = await this.makeRequest('/api/v1/status/openvpn');
            return response.map(vpn => ({
                name: vpn.name,
                mode: vpn.mode,
                status: vpn.status,
                connected_clients: vpn.client_count || 0,
                bytes_sent: parseInt(vpn.bytes_sent || 0),
                bytes_received: parseInt(vpn.bytes_recv || 0)
            }));
        } catch (error) {
            console.error('Failed to fetch VPN connections:', error);
            return [];
        }
    }

    async getSecurityEvents(limit = 100) {
        try {
            const response = await this.makeRequest(`/api/v1/status/log/filter?limit=${limit}`);
            return response.map(event => ({
                timestamp: new Date(event.time * 1000),
                interface: event.interface,
                action: event.act,
                protocol: event.proto,
                source_ip: event.srcip,
                destination_ip: event.dstip,
                source_port: event.srcport,
                destination_port: event.dstport,
                message: event.tracker_msg
            }));
        } catch (error) {
            console.error('Failed to fetch security events:', error);
            return [];
        }
    }

    async getBandwidthUsage(interface = 'wan') {
        try {
            const response = await this.makeRequest(`/api/v1/status/traffic/${interface}`);
            return {
                interface,
                current_in: response.in_rate,
                current_out: response.out_rate,
                total_in: response.in_bytes,
                total_out: response.out_bytes,
                peak_in: response.in_peak,
                peak_out: response.out_peak
            };
        } catch (error) {
            console.error('Failed to fetch bandwidth usage:', error);
            return null;
        }
    }

    async makeRequest(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.auth.client_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default PfSenseAPI;
```

## OPNsense Integration

### 1. Enable API Access

```bash
# System > Access > Users
# Create API user with appropriate privileges

# System > Settings > Administration
# Enable "Secure Shell" if needed for debugging
```

### 2. Generate API Key

```bash
# System > Access > Users > [your-api-user] > API keys
# Generate new API key pair
# Save Key ID and Secret securely
```

### 3. OPNsense API Implementation

```javascript
// services/opnSenseApi.js
class OPNsenseAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.auth = {
            key: config.apiKey,
            secret: config.apiSecret
        };
    }

    async getSystemInfo() {
        try {
            const response = await this.makeRequest('/api/core/system/status');
            return {
                hostname: response.hostname,
                platform: response.platform,
                version: response.product_version,
                uptime: response.uptime,
                cpu_usage: response.cpu.user + response.cpu.system,
                memory_usage: (response.memory.used / response.memory.total) * 100,
                load_average: response.load_average[0]
            };
        } catch (error) {
            console.error('Failed to fetch OPNsense system info:', error);
            return null;
        }
    }

    async getInterfaceStats() {
        try {
            const response = await this.makeRequest('/api/diagnostics/interface/getInterfaceStatistics');
            return Object.entries(response).map(([name, data]) => ({
                name,
                status: data.status === 'up' ? 'online' : 'offline',
                ipv4_address: data.ipv4?.[0]?.address,
                bytes_in: parseInt(data.bytes_received || 0),
                bytes_out: parseInt(data.bytes_sent || 0),
                packets_in: parseInt(data.packets_received || 0),
                packets_out: parseInt(data.packets_sent || 0),
                errors_in: parseInt(data.errors_in || 0),
                errors_out: parseInt(data.errors_out || 0)
            }));
        } catch (error) {
            console.error('Failed to fetch interface stats:', error);
            return [];
        }
    }

    async getFirewallRules() {
        try {
            const response = await this.makeRequest('/api/firewall/filter/searchRule');
            return response.rows.map(rule => ({
                uuid: rule.uuid,
                interface: rule.interface,
                protocol: rule.protocol,
                source: rule.source,
                destination: rule.destination,
                description: rule.description,
                enabled: rule.enabled === '1',
                action: rule.action
            }));
        } catch (error) {
            console.error('Failed to fetch firewall rules:', error);
            return [];
        }
    }

    async getVPNConnections() {
        try {
            const [wireguard, openvpn] = await Promise.all([
                this.makeRequest('/api/wireguard/service/status').catch(() => ({ peers: [] })),
                this.makeRequest('/api/openvpn/service/status').catch(() => ({ sessions: [] }))
            ]);

            const connections = [];

            // WireGuard connections
            if (wireguard.peers) {
                wireguard.peers.forEach(peer => {
                    connections.push({
                        type: 'WireGuard',
                        name: peer.name || peer.public_key.substring(0, 8),
                        status: peer.latest_handshake ? 'connected' : 'disconnected',
                        endpoint: peer.endpoint,
                        bytes_sent: parseInt(peer.transfer_tx || 0),
                        bytes_received: parseInt(peer.transfer_rx || 0),
                        last_handshake: peer.latest_handshake
                    });
                });
            }

            // OpenVPN connections
            if (openvpn.sessions) {
                openvpn.sessions.forEach(session => {
                    connections.push({
                        type: 'OpenVPN',
                        name: session.common_name,
                        status: session.status,
                        virtual_ip: session.virtual_address,
                        real_ip: session.real_address,
                        bytes_sent: parseInt(session.bytes_sent || 0),
                        bytes_received: parseInt(session.bytes_received || 0),
                        connected_since: session.connected_since
                    });
                });
            }

            return connections;
        } catch (error) {
            console.error('Failed to fetch VPN connections:', error);
            return [];
        }
    }

    async makeRequest(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        const auth = btoa(`${this.auth.key}:${this.auth.secret}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default OPNsenseAPI;
```

## Dashboard Integration

### 1. Firewall Metrics Component

```jsx
// components/homelab/FirewallMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, AlertTriangle } from 'lucide-react';

const FirewallMonitor = ({ firewallType = 'pfsense' }) => {
    const [firewallData, setFirewallData] = useState({
        system: null,
        interfaces: [],
        rules: [],
        vpn: [],
        events: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFirewallData = async () => {
            // Implementation based on firewall type
            // Use PfSenseAPI or OPNsenseAPI
        };

        fetchFirewallData();
        const interval = setInterval(fetchFirewallData, 30000);
        return () => clearInterval(interval);
    }, [firewallType]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Status */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                    <Shield className="h-8 w-8 text-blue-400" />
                    <span className="text-sm text-gray-400 capitalize">{firewallType}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Firewall Status</h3>
                {firewallData.system && (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">CPU</span>
                            <span className="text-blue-400">{firewallData.system.cpu_usage?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Memory</span>
                            <span className="text-green-400">{firewallData.system.memory_usage?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Uptime</span>
                            <span className="text-purple-400">{formatUptime(firewallData.system.uptime)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Network Interfaces */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8 text-green-400" />
                    <span className="text-sm text-green-400">
                        {firewallData.interfaces.filter(i => i.status === 'online').length} Active
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Interfaces</h3>
                <div className="space-y-2">
                    {firewallData.interfaces.slice(0, 3).map((interface, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-400">{interface.name}</span>
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    interface.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                                }`}></div>
                                <span className="text-xs text-gray-500">
                                    {formatBytes(interface.bytes_in + interface.bytes_out)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* VPN Connections */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-purple-400" />
                    <span className="text-sm text-purple-400">
                        {firewallData.vpn.filter(v => v.status === 'connected').length} Connected
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">VPN Status</h3>
                <div className="space-y-2">
                    {firewallData.vpn.slice(0, 3).map((vpn, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-400">{vpn.name}</span>
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    vpn.status === 'connected' ? 'bg-green-400' : 'bg-gray-400'
                                }`}></div>
                                <span className="text-xs text-gray-500">{vpn.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Events */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-lg border border-red-500/20">
                <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <span className="text-sm text-red-400">
                        {firewallData.events.filter(e => e.action === 'block').length} Blocked
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Security Events</h3>
                <div className="space-y-2">
                    {firewallData.events.slice(0, 3).map((event, index) => (
                        <div key={index} className="text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">{event.source_ip}</span>
                                <span className={`${
                                    event.action === 'block' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                    {event.action}
                                </span>
                            </div>
                            <div className="text-gray-500 truncate">{event.message}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper functions
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default FirewallMonitor;
```

## Configuration Examples

### Environment Variables

```bash
# .env
REACT_APP_PFSENSE_URL=https://your-pfsense.local
REACT_APP_PFSENSE_CLIENT_ID=homelab-api
REACT_APP_PFSENSE_CLIENT_TOKEN=your-api-token

REACT_APP_OPNSENSE_URL=https://your-opnsense.local
REACT_APP_OPNSENSE_API_KEY=your-api-key
REACT_APP_OPNSENSE_API_SECRET=your-api-secret
```

### Integration with Homelab Context

```javascript
// Add to homelabConstants.js
export const FIREWALL_ENDPOINTS = {
    pfsense: {
        system: '/api/v1/status/system',
        interfaces: '/api/v1/status/interface',
        rules: '/api/v1/firewall/rule',
        vpn: '/api/v1/status/openvpn'
    },
    opnsense: {
        system: '/api/core/system/status',
        interfaces: '/api/diagnostics/interface/getInterfaceStatistics',
        rules: '/api/firewall/filter/searchRule',
        vpn: '/api/wireguard/service/status'
    }
};
```

## Security Considerations

1. **API Access Control**: Limit API user permissions to read-only operations
2. **Network Segmentation**: Ensure dashboard can only access necessary firewall endpoints
3. **HTTPS Only**: Always use HTTPS for API communications
4. **Rate Limiting**: Implement proper rate limiting to avoid overwhelming firewall
5. **Monitoring**: Log all API access attempts for security auditing

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check firewall rules and ensure API ports are accessible
2. **Authentication Failures**: Verify API credentials and user permissions
3. **Timeout Errors**: Adjust polling intervals and implement proper error handling
4. **SSL Certificate Issues**: Configure proper certificate validation or trusted CAs

### Debug Commands

```bash
# Test pfSense API connectivity
curl -k -H "Authorization: Bearer YOUR_TOKEN" https://your-pfsense.local/api/v1/status/system

# Test OPNsense API connectivity
curl -k -u "API_KEY:API_SECRET" https://your-opnsense.local/api/core/system/status
```

This integration provides comprehensive firewall monitoring capabilities, giving you real-time visibility into your network security posture directly from your homelab dashboard.
