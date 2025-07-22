# Pi-hole Integration Guide

Integrate Pi-hole DNS ad blocker with your homelab dashboard for comprehensive DNS monitoring and management.

## Overview

This guide covers integrating Pi-hole to monitor:
- DNS query statistics and blocking rates
- Top blocked domains and allowed domains
- Client activity and query types
- Network-wide protection metrics
- Custom blocklists and whitelist management

## Prerequisites

- Pi-hole 5.0+ installed and configured
- Admin interface accessible
- API token for authentication
- Network connectivity from dashboard

## Pi-hole API Setup

### 1. Generate API Token

```bash
# SSH into Pi-hole system
ssh pi@your-pihole-ip

# Generate API token (found in Pi-hole admin interface)
# Settings > API > Show API token
```

### 2. Test API Access

```bash
# Test basic connectivity
curl "http://your-pihole-ip/admin/api.php"

# Test authenticated access
curl "http://your-pihole-ip/admin/api.php?summaryRaw&auth=YOUR_API_TOKEN"
```

## Pi-hole API Implementation

```javascript
// services/piholeApi.js
class PiHoleAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.apiToken = config.apiToken;
        this.adminPath = config.adminPath || '/admin';
    }

    async getSummary() {
        try {
            const response = await this.makeRequest('summaryRaw');
            return {
                dns_queries_today: parseInt(response.dns_queries_today),
                ads_blocked_today: parseInt(response.ads_blocked_today),
                ads_percentage_today: parseFloat(response.ads_percentage_today),
                domains_being_blocked: parseInt(response.domains_being_blocked),
                queries_forwarded: parseInt(response.queries_forwarded),
                queries_cached: parseInt(response.queries_cached),
                clients_ever_seen: parseInt(response.clients_ever_seen),
                unique_clients: parseInt(response.unique_clients),
                dns_queries_all_types: parseInt(response.dns_queries_all_types),
                reply_NODATA: parseInt(response.reply_NODATA),
                reply_NXDOMAIN: parseInt(response.reply_NXDOMAIN),
                reply_CNAME: parseInt(response.reply_CNAME),
                reply_IP: parseInt(response.reply_IP),
                privacy_level: parseInt(response.privacy_level),
                status: response.status,
                gravity_last_updated: response.gravity_last_updated
            };
        } catch (error) {
            console.error('Failed to fetch Pi-hole summary:', error);
            return null;
        }
    }

    async getTopItems(count = 10) {
        try {
            const response = await this.makeRequest(`topItems=${count}`);
            return {
                top_queries: Object.entries(response.top_queries || {}).map(([domain, count]) => ({
                    domain,
                    count: parseInt(count)
                })),
                top_ads: Object.entries(response.top_ads || {}).map(([domain, count]) => ({
                    domain,
                    count: parseInt(count)
                }))
            };
        } catch (error) {
            console.error('Failed to fetch top items:', error);
            return { top_queries: [], top_ads: [] };
        }
    }

    async getTopClients(count = 10) {
        try {
            const response = await this.makeRequest(`topClients=${count}`);
            return Object.entries(response.top_sources || {}).map(([client, count]) => ({
                client,
                count: parseInt(count),
                percentage: (parseInt(count) / response.dns_queries_today * 100).toFixed(2)
            }));
        } catch (error) {
            console.error('Failed to fetch top clients:', error);
            return [];
        }
    }

    async getQueryTypesOverTime() {
        try {
            const response = await this.makeRequest('overTimeDataClients');
            const domains = response.domains_over_time || {};
            const ads = response.ads_over_time || {};
            
            const timeData = [];
            Object.keys(domains).forEach(timestamp => {
                timeData.push({
                    timestamp: parseInt(timestamp),
                    time: new Date(parseInt(timestamp) * 1000),
                    queries: parseInt(domains[timestamp] || 0),
                    blocked: parseInt(ads[timestamp] || 0)
                });
            });

            return timeData.sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error('Failed to fetch query data over time:', error);
            return [];
        }
    }

    async getForwardDestinations() {
        try {
            const response = await this.makeRequest('getForwardDestinations');
            return Object.entries(response.forward_destinations || {}).map(([destination, percentage]) => ({
                destination: destination.replace(/\|.*/, ''), // Remove additional info
                percentage: parseFloat(percentage)
            }));
        } catch (error) {
            console.error('Failed to fetch forward destinations:', error);
            return [];
        }
    }

    async getQueryTypes() {
        try {
            const response = await this.makeRequest('getQueryTypes');
            return Object.entries(response.querytypes || {}).map(([type, percentage]) => ({
                type,
                percentage: parseFloat(percentage)
            }));
        } catch (error) {
            console.error('Failed to fetch query types:', error);
            return [];
        }
    }

    async getRecentQueries(count = 100) {
        try {
            const response = await this.makeRequest(`recentBlocked=${count}`);
            return (response || []).map((entry, index) => {
                const [timestamp, type, domain, client, status] = entry;
                return {
                    id: index,
                    timestamp: parseInt(timestamp),
                    time: new Date(parseInt(timestamp) * 1000),
                    type,
                    domain,
                    client,
                    status: this.mapQueryStatus(status),
                    blocked: status === '1' || status === '4' || status === '5' || status === '6' || status === '7'
                };
            });
        } catch (error) {
            console.error('Failed to fetch recent queries:', error);
            return [];
        }
    }

    async getNetworkScan() {
        try {
            const response = await this.makeRequest('network');
            return Object.entries(response || {}).map(([ip, info]) => ({
                ip,
                hostname: info.name || 'Unknown',
                interface: info.iface || 'Unknown',
                mac_address: info.hwaddr || 'Unknown',
                last_seen: info.lastQuery ? new Date(info.lastQuery * 1000) : null,
                query_count: parseInt(info.numQueries || 0)
            }));
        } catch (error) {
            console.error('Failed to fetch network scan:', error);
            return [];
        }
    }

    async getBlocklists() {
        try {
            const response = await this.makeRequest('list/white');
            const whitelist = response || [];
            
            const blackResponse = await this.makeRequest('list/black');
            const blacklist = blackResponse || [];

            return {
                whitelist: whitelist.map((item, index) => ({
                    id: index,
                    domain: item.domain || item,
                    type: item.type || 'exact',
                    enabled: item.enabled !== false,
                    comment: item.comment || ''
                })),
                blacklist: blacklist.map((item, index) => ({
                    id: index,
                    domain: item.domain || item,
                    type: item.type || 'exact',
                    enabled: item.enabled !== false,
                    comment: item.comment || ''
                }))
            };
        } catch (error) {
            console.error('Failed to fetch blocklists:', error);
            return { whitelist: [], blacklist: [] };
        }
    }

    async enablePiHole() {
        try {
            await this.makeRequest('enable');
            return { success: true, message: 'Pi-hole enabled successfully' };
        } catch (error) {
            console.error('Failed to enable Pi-hole:', error);
            return { success: false, message: error.message };
        }
    }

    async disablePiHole(duration = 0) {
        try {
            const endpoint = duration > 0 ? `disable=${duration}` : 'disable';
            await this.makeRequest(endpoint);
            return { success: true, message: `Pi-hole disabled${duration > 0 ? ` for ${duration} seconds` : ''}` };
        } catch (error) {
            console.error('Failed to disable Pi-hole:', error);
            return { success: false, message: error.message };
        }
    }

    mapQueryStatus(status) {
        const statusMap = {
            '1': 'Blocked (gravity)',
            '2': 'Forwarded',
            '3': 'Cached',
            '4': 'Blocked (regex)',
            '5': 'Blocked (blacklist)',
            '6': 'Blocked (external)',
            '7': 'Blocked (CNAME)',
            '8': 'Forwarded (upstream)',
            '9': 'Forwarded (cached)',
            '10': 'Retried',
            '11': 'Retried (ignored)',
            '12': 'Already forwarded',
            '13': 'Already cached'
        };
        return statusMap[status] || `Unknown (${status})`;
    }

    async makeRequest(endpoint) {
        const url = `${this.baseUrl}${this.adminPath}/api.php?${endpoint}&auth=${this.apiToken}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default PiHoleAPI;
```

## Dashboard Integration

### 1. Pi-hole Monitor Component

```jsx
// components/homelab/PiHoleMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Activity, Globe, Users, TrendingUp, Clock } from 'lucide-react';

const PiHoleMonitor = () => {
    const [piHoleData, setPiHoleData] = useState({
        summary: null,
        topItems: { top_queries: [], top_ads: [] },
        topClients: [],
        queryTypes: [],
        recentQueries: [],
        timeData: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');

    useEffect(() => {
        const fetchPiHoleData = async () => {
            setIsLoading(true);
            try {
                // Fetch all Pi-hole data
                const api = new PiHoleAPI({
                    baseUrl: process.env.REACT_APP_PIHOLE_URL,
                    apiToken: process.env.REACT_APP_PIHOLE_TOKEN
                });

                const [summary, topItems, topClients, queryTypes, recentQueries, timeData] = await Promise.all([
                    api.getSummary(),
                    api.getTopItems(10),
                    api.getTopClients(10),
                    api.getQueryTypes(),
                    api.getRecentQueries(50),
                    api.getQueryTypesOverTime()
                ]);

                setPiHoleData({
                    summary,
                    topItems,
                    topClients,
                    queryTypes,
                    recentQueries,
                    timeData
                });
            } catch (error) {
                console.error('Error fetching Pi-hole data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPiHoleData();
        const interval = setInterval(fetchPiHoleData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading Pi-hole data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Queries */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Globe className="h-8 w-8 text-blue-400" />
                        <span className="text-sm text-blue-400">Today</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">DNS Queries</h3>
                    <div className="text-2xl font-bold text-blue-400">
                        {piHoleData.summary?.dns_queries_today?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {piHoleData.summary?.unique_clients} unique clients
                    </div>
                </div>

                {/* Blocked Ads */}
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="h-8 w-8 text-red-400" />
                        <span className="text-sm text-red-400">
                            {piHoleData.summary?.ads_percentage_today?.toFixed(1)}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ads Blocked</h3>
                    <div className="text-2xl font-bold text-red-400">
                        {piHoleData.summary?.ads_blocked_today?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {piHoleData.summary?.domains_being_blocked?.toLocaleString()} blocked domains
                    </div>
                </div>

                {/* Cache Performance */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-green-400" />
                        <span className="text-sm text-green-400">Cache</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Cache Hits</h3>
                    <div className="text-2xl font-bold text-green-400">
                        {piHoleData.summary?.queries_cached?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {piHoleData.summary?.queries_forwarded?.toLocaleString()} forwarded
                    </div>
                </div>

                {/* Active Clients */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-purple-400" />
                        <span className={`text-sm ${piHoleData.summary?.status === 'enabled' ? 'text-green-400' : 'text-red-400'}`}>
                            {piHoleData.summary?.status}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Active Clients</h3>
                    <div className="text-2xl font-bold text-purple-400">
                        {piHoleData.summary?.unique_clients}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {piHoleData.summary?.clients_ever_seen} total seen
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Blocked Domains */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="h-5 w-5 text-red-400 mr-2" />
                        Top Blocked Domains
                    </h3>
                    <div className="space-y-3">
                        {piHoleData.topItems.top_ads.slice(0, 8).map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300 truncate flex-1 mr-4">{item.domain}</span>
                                <span className="text-red-400 font-medium">{item.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Allowed Domains */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Globe className="h-5 w-5 text-green-400 mr-2" />
                        Top Allowed Domains
                    </h3>
                    <div className="space-y-3">
                        {piHoleData.topItems.top_queries.slice(0, 8).map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300 truncate flex-1 mr-4">{item.domain}</span>
                                <span className="text-green-400 font-medium">{item.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 text-purple-400 mr-2" />
                        Top Clients
                    </h3>
                    <div className="space-y-3">
                        {piHoleData.topClients.slice(0, 8).map((client, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300 truncate flex-1 mr-4">{client.client}</span>
                                <div className="flex items-center">
                                    <span className="text-purple-400 font-medium mr-2">{client.count.toLocaleString()}</span>
                                    <span className="text-gray-500 text-sm">({client.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Queries */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Clock className="h-5 w-5 text-blue-400 mr-2" />
                        Recent Queries
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {piHoleData.recentQueries.slice(0, 10).map((query, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex-1 truncate mr-4">
                                    <span className="text-gray-300">{query.domain}</span>
                                    <span className="text-gray-500 ml-2">({query.client})</span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        query.blocked 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : 'bg-green-500/20 text-green-400'
                                    }`}>
                                        {query.blocked ? 'Blocked' : 'Allowed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PiHoleMonitor;
```

### 2. Query Timeline Chart

```jsx
// components/homelab/PiHoleChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PiHoleChart = ({ timeData }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">DNS Queries Over Time</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleTimeString()}
                            stroke="#9CA3AF"
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                            labelFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleString()}
                            contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="queries" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            name="Total Queries"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="blocked" 
                            stroke="#EF4444" 
                            strokeWidth={2}
                            name="Blocked Queries"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PiHoleChart;
```

## Configuration

### Environment Variables

```bash
# .env
REACT_APP_PIHOLE_URL=http://your-pihole-ip
REACT_APP_PIHOLE_TOKEN=your-api-token
REACT_APP_PIHOLE_ADMIN_PATH=/admin
```

### Integration with Homelab Context

```javascript
// Add to homelabConstants.js
export const PIHOLE_ENDPOINTS = {
    summary: 'summaryRaw',
    topItems: 'topItems',
    topClients: 'topClients',
    queryTypes: 'getQueryTypes',
    recentQueries: 'recentBlocked',
    overTime: 'overTimeDataClients',
    enable: 'enable',
    disable: 'disable'
};

export const PIHOLE_REFRESH_INTERVALS = {
    summary: 30000,     // 30 seconds
    details: 60000,     // 1 minute
    logs: 10000         // 10 seconds
};
```

## Advanced Features

### 1. Real-time Controls

```jsx
// Pi-hole Control Component
const PiHoleControls = () => {
    const [status, setStatus] = useState('enabled');
    const [disableDuration, setDisableDuration] = useState(300);

    const handleToggle = async () => {
        // Implementation for enabling/disabling Pi-hole
    };

    return (
        <div className="flex items-center space-x-4">
            <button 
                onClick={handleToggle}
                className={`px-4 py-2 rounded-lg ${
                    status === 'enabled' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                }`}
            >
                {status === 'enabled' ? 'Disable' : 'Enable'} Pi-hole
            </button>
            {status === 'enabled' && (
                <select 
                    value={disableDuration} 
                    onChange={(e) => setDisableDuration(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={1800}>30 minutes</option>
                    <option value={3600}>1 hour</option>
                </select>
            )}
        </div>
    );
};
```

### 2. Network Device Detection

```jsx
// Network Device Monitor
const NetworkDevices = ({ devices }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Network Devices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                        <div>
                            <div className="font-medium">{device.hostname}</div>
                            <div className="text-sm text-gray-400">{device.ip}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-400">{device.query_count} queries</div>
                            <div className="text-xs text-gray-500">
                                {device.last_seen ? `Last seen: ${device.last_seen.toLocaleTimeString()}` : 'Never'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## Security and Best Practices

1. **API Token Security**: Store API tokens securely and rotate regularly
2. **Network Access**: Limit dashboard access to Pi-hole admin interface
3. **Rate Limiting**: Implement reasonable polling intervals to avoid overloading
4. **Error Handling**: Gracefully handle API failures and network issues
5. **Logging**: Monitor API access for security and debugging

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure Pi-hole to allow cross-origin requests
2. **API Token Invalid**: Regenerate token in Pi-hole admin interface
3. **Network Connectivity**: Verify Pi-hole is accessible from dashboard
4. **Slow Response**: Adjust polling intervals and optimize queries

### Debug Commands

```bash
# Test Pi-hole API
curl "http://your-pihole-ip/admin/api.php?summaryRaw&auth=YOUR_TOKEN"

# Check Pi-hole logs
tail -f /var/log/pihole.log

# Verify Pi-hole status
pihole status
```

This integration provides comprehensive DNS monitoring and management capabilities, giving you complete visibility into your network's DNS activity and ad-blocking performance.
