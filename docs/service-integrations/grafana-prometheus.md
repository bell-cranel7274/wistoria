# Grafana & Prometheus Integration Guide

Integrate Grafana dashboards and Prometheus metrics with your homelab dashboard for comprehensive monitoring and visualization.

## Overview

This guide covers integrating:
- Grafana dashboards and panels embedding
- Prometheus metrics querying and display
- InfluxDB time-series data visualization
- Custom alerting and notification systems
- Performance monitoring and health checks

## Prerequisites

- Grafana 9.0+ with admin access
- Prometheus server with targets configured
- API tokens for authentication
- Network connectivity from dashboard
- Optional: InfluxDB for additional metrics storage

## Grafana Integration

### 1. Create Service Account

```bash
# In Grafana UI:
# Administration > Users and access > Service accounts
# Create service account with Viewer or Editor role
# Generate token for API access
```

### 2. Enable Required APIs

```bash
# grafana.ini configuration
[security]
allow_embedding = true

[auth.anonymous]
enabled = true
org_role = Viewer
hide_version = true

[panels]
enable_alpha = true
```

### 3. Grafana API Implementation

```javascript
// services/grafanaApi.js
class GrafanaAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.apiToken = config.apiToken;
        this.orgId = config.orgId || 1;
    }

    async getDashboards() {
        try {
            const response = await this.makeRequest('/api/search?type=dash-db');
            return response.map(dashboard => ({
                id: dashboard.id,
                uid: dashboard.uid,
                title: dashboard.title,
                url: dashboard.url,
                type: dashboard.type,
                tags: dashboard.tags,
                starred: dashboard.isStarred,
                folder_id: dashboard.folderId,
                folder_title: dashboard.folderTitle
            }));
        } catch (error) {
            console.error('Failed to fetch Grafana dashboards:', error);
            return [];
        }
    }

    async getDashboard(uid) {
        try {
            const response = await this.makeRequest(`/api/dashboards/uid/${uid}`);
            return {
                meta: response.meta,
                dashboard: {
                    id: response.dashboard.id,
                    uid: response.dashboard.uid,
                    title: response.dashboard.title,
                    tags: response.dashboard.tags,
                    timezone: response.dashboard.timezone,
                    panels: response.dashboard.panels,
                    time: response.dashboard.time,
                    refresh: response.dashboard.refresh,
                    version: response.dashboard.version
                }
            };
        } catch (error) {
            console.error(`Failed to fetch dashboard ${uid}:`, error);
            return null;
        }
    }

    async getAnnotations(from, to, tags = []) {
        try {
            const params = new URLSearchParams({
                from: from.toString(),
                to: to.toString(),
                limit: '100'
            });
            
            if (tags.length > 0) {
                params.append('tags', tags.join(','));
            }

            const response = await this.makeRequest(`/api/annotations?${params}`);
            return response.map(annotation => ({
                id: annotation.id,
                time: annotation.time,
                timeEnd: annotation.timeEnd,
                text: annotation.text,
                tags: annotation.tags,
                user: annotation.login,
                email: annotation.email,
                avatarUrl: annotation.avatarUrl
            }));
        } catch (error) {
            console.error('Failed to fetch annotations:', error);
            return [];
        }
    }

    async getAlerts() {
        try {
            const response = await this.makeRequest('/api/alerts');
            return response.map(alert => ({
                id: alert.id,
                dashboard_id: alert.dashboardId,
                dashboard_uid: alert.dashboardUid,
                dashboard_slug: alert.dashboardSlug,
                panel_id: alert.panelId,
                name: alert.name,
                state: alert.state,
                new_state_date: new Date(alert.newStateDate),
                evaluation_date: new Date(alert.evalDate),
                url: alert.url,
                message: alert.message,
                execution_error: alert.executionError
            }));
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            return [];
        }
    }

    async getDataSources() {
        try {
            const response = await this.makeRequest('/api/datasources');
            return response.map(datasource => ({
                id: datasource.id,
                uid: datasource.uid,
                name: datasource.name,
                type: datasource.type,
                url: datasource.url,
                access: datasource.access,
                is_default: datasource.isDefault,
                version: datasource.version,
                read_only: datasource.readOnly
            }));
        } catch (error) {
            console.error('Failed to fetch data sources:', error);
            return [];
        }
    }

    async queryDataSource(datasourceUid, query, from, to) {
        try {
            const response = await this.makeRequest('/api/ds/query', 'POST', {
                queries: [{
                    refId: 'A',
                    datasourceUid: datasourceUid,
                    ...query
                }],
                from: from,
                to: to
            });
            return response.results;
        } catch (error) {
            console.error('Failed to query data source:', error);
            return null;
        }
    }

    generateEmbedUrl(dashboardUid, panelId = null, options = {}) {
        const baseUrl = `${this.baseUrl}/d/${dashboardUid}`;
        const params = new URLSearchParams({
            orgId: this.orgId.toString(),
            kiosk: 'true',
            theme: options.theme || 'dark',
            ...options
        });

        if (panelId) {
            params.append('viewPanel', panelId.toString());
        }

        return `${baseUrl}?${params}`;
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
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

export default GrafanaAPI;
```

## Prometheus Integration

### 1. Prometheus API Implementation

```javascript
// services/prometheusApi.js
class PrometheusAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout || 30000;
    }

    async query(query, time = null) {
        try {
            const params = new URLSearchParams({ query });
            if (time) {
                params.append('time', time);
            }

            const response = await this.makeRequest(`/api/v1/query?${params}`);
            return {
                status: response.status,
                data: response.data.result.map(result => ({
                    metric: result.metric,
                    value: result.value,
                    timestamp: new Date(result.value[0] * 1000),
                    rawValue: parseFloat(result.value[1])
                }))
            };
        } catch (error) {
            console.error('Failed to execute Prometheus query:', error);
            return { status: 'error', data: [] };
        }
    }

    async queryRange(query, start, end, step = '15s') {
        try {
            const params = new URLSearchParams({
                query,
                start: start.toISOString(),
                end: end.toISOString(),
                step
            });

            const response = await this.makeRequest(`/api/v1/query_range?${params}`);
            return {
                status: response.status,
                data: response.data.result.map(result => ({
                    metric: result.metric,
                    values: result.values.map(([timestamp, value]) => ({
                        timestamp: new Date(timestamp * 1000),
                        value: parseFloat(value)
                    }))
                }))
            };
        } catch (error) {
            console.error('Failed to execute Prometheus range query:', error);
            return { status: 'error', data: [] };
        }
    }

    async getTargets() {
        try {
            const response = await this.makeRequest('/api/v1/targets');
            return response.data.activeTargets.map(target => ({
                discovered_labels: target.discoveredLabels,
                labels: target.labels,
                scrape_pool: target.scrapePool,
                scrape_url: target.scrapeUrl,
                global_url: target.globalUrl,
                last_error: target.lastError,
                last_scrape: new Date(target.lastScrape),
                last_scrape_duration: target.lastScrapeDuration,
                health: target.health
            }));
        } catch (error) {
            console.error('Failed to fetch Prometheus targets:', error);
            return [];
        }
    }

    async getRules() {
        try {
            const response = await this.makeRequest('/api/v1/rules');
            return response.data.groups.map(group => ({
                name: group.name,
                file: group.file,
                interval: group.interval,
                rules: group.rules.map(rule => ({
                    name: rule.name,
                    query: rule.query,
                    duration: rule.duration,
                    labels: rule.labels,
                    annotations: rule.annotations,
                    alerts: rule.alerts || [],
                    health: rule.health,
                    type: rule.type
                }))
            }));
        } catch (error) {
            console.error('Failed to fetch Prometheus rules:', error);
            return [];
        }
    }

    async getAlerts() {
        try {
            const response = await this.makeRequest('/api/v1/alerts');
            return response.data.alerts.map(alert => ({
                labels: alert.labels,
                annotations: alert.annotations,
                state: alert.state,
                active_at: new Date(alert.activeAt),
                value: alert.value
            }));
        } catch (error) {
            console.error('Failed to fetch Prometheus alerts:', error);
            return [];
        }
    }

    async getMetrics() {
        try {
            const response = await this.makeRequest('/api/v1/label/__name__/values');
            return response.data.sort();
        } catch (error) {
            console.error('Failed to fetch available metrics:', error);
            return [];
        }
    }

    // Helper method for common system metrics
    async getSystemMetrics() {
        const queries = {
            cpu_usage: 'round((1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100, 0.1)',
            memory_usage: 'round((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100, 0.1)',
            disk_usage: 'round((1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100, 0.1)',
            network_receive: 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
            network_transmit: 'rate(node_network_transmit_bytes_total{device!="lo"}[5m])',
            load_average: 'node_load1',
            uptime: 'node_time_seconds - node_boot_time_seconds'
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            const result = await this.query(query);
            results[key] = result.data;
        }

        return results;
    }

    async makeRequest(endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
}

export default PrometheusAPI;
```

## Dashboard Integration

### 1. Metrics Dashboard Component

```jsx
// components/homelab/MetricsMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Server, HardDrive, Network, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MetricsMonitor = () => {
    const [metricsData, setMetricsData] = useState({
        system: {},
        alerts: [],
        targets: [],
        timeSeriesData: {}
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetricsData = async () => {
            setIsLoading(true);
            try {
                const prometheusApi = new PrometheusAPI({
                    baseUrl: process.env.REACT_APP_PROMETHEUS_URL
                });

                const [systemMetrics, alerts, targets] = await Promise.all([
                    prometheusApi.getSystemMetrics(),
                    prometheusApi.getAlerts(),
                    prometheusApi.getTargets()
                ]);

                // Fetch time series data for charts
                const endTime = new Date();
                const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last hour

                const cpuHistory = await prometheusApi.queryRange(
                    'round((1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100, 0.1)',
                    startTime,
                    endTime,
                    '60s'
                );

                const memoryHistory = await prometheusApi.queryRange(
                    'round((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100, 0.1)',
                    startTime,
                    endTime,
                    '60s'
                );

                setMetricsData({
                    system: systemMetrics,
                    alerts,
                    targets,
                    timeSeriesData: {
                        cpu: cpuHistory.data[0]?.values || [],
                        memory: memoryHistory.data[0]?.values || []
                    }
                });
            } catch (error) {
                console.error('Error fetching metrics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetricsData();
        const interval = setInterval(fetchMetricsData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading metrics data...</div>;
    }

    const cpuUsage = metricsData.system.cpu_usage?.[0]?.rawValue || 0;
    const memoryUsage = metricsData.system.memory_usage?.[0]?.rawValue || 0;
    const diskUsage = metricsData.system.disk_usage?.[0]?.rawValue || 0;
    const loadAverage = metricsData.system.load_average?.[0]?.rawValue || 0;

    // Prepare chart data
    const chartData = metricsData.timeSeriesData.cpu.map((cpuPoint, index) => {
        const memoryPoint = metricsData.timeSeriesData.memory[index];
        return {
            timestamp: cpuPoint.timestamp.getTime(),
            time: cpuPoint.timestamp.toLocaleTimeString(),
            cpu: cpuPoint.value,
            memory: memoryPoint?.value || 0
        };
    });

    return (
        <div className="space-y-6">
            {/* System Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CPU Usage */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Server className="h-8 w-8 text-blue-400" />
                        <span className={`text-sm ${cpuUsage > 80 ? 'text-red-400' : 'text-blue-400'}`}>
                            {cpuUsage.toFixed(1)}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">CPU Usage</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full ${
                                cpuUsage > 80 ? 'bg-red-400' : 
                                cpuUsage > 60 ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-400">Load: {loadAverage.toFixed(2)}</div>
                </div>

                {/* Memory Usage */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-green-400" />
                        <span className={`text-sm ${memoryUsage > 80 ? 'text-red-400' : 'text-green-400'}`}>
                            {memoryUsage.toFixed(1)}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full ${
                                memoryUsage > 80 ? 'bg-red-400' : 
                                memoryUsage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(memoryUsage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-400">Available RAM</div>
                </div>

                {/* Disk Usage */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <HardDrive className="h-8 w-8 text-purple-400" />
                        <span className={`text-sm ${diskUsage > 80 ? 'text-red-400' : 'text-purple-400'}`}>
                            {diskUsage.toFixed(1)}%
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Disk Usage</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full ${
                                diskUsage > 80 ? 'bg-red-400' : 
                                diskUsage > 60 ? 'bg-yellow-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${Math.min(diskUsage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-400">Filesystem usage</div>
                </div>

                {/* Monitoring Status */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        <span className="text-sm text-yellow-400">
                            {metricsData.alerts.filter(a => a.state === 'firing').length} Active
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Alerts</h3>
                    <div className="text-2xl font-bold text-yellow-400">
                        {metricsData.alerts.length}
                    </div>
                    <div className="text-sm text-gray-400">
                        {metricsData.targets.filter(t => t.health === 'up').length}/{metricsData.targets.length} targets up
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                    System Performance (Last Hour)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="time" 
                                stroke="#9CA3AF"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                stroke="#9CA3AF"
                                domain={[0, 100]}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'cpu' ? 'CPU' : 'Memory']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="cpu" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                name="CPU Usage"
                                dot={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="memory" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                name="Memory Usage"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Alerts */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        Active Alerts
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {metricsData.alerts.filter(alert => alert.state === 'firing').map((alert, index) => (
                            <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                                <div className="font-medium text-red-400">
                                    {alert.labels.alertname || 'Unknown Alert'}
                                </div>
                                <div className="text-sm text-gray-300 mt-1">
                                    {alert.annotations.summary || alert.annotations.description}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Active since: {alert.active_at.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {metricsData.alerts.filter(alert => alert.state === 'firing').length === 0 && (
                            <div className="text-gray-400 text-center py-4">No active alerts</div>
                        )}
                    </div>
                </div>

                {/* Monitoring Targets */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Network className="h-5 w-5 text-green-400 mr-2" />
                        Monitoring Targets
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {metricsData.targets.map((target, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-300">
                                        {target.labels.instance || target.scrape_url}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {target.scrape_pool} • {target.labels.job}
                                    </div>
                                    {target.last_error && (
                                        <div className="text-xs text-red-400 mt-1">{target.last_error}</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className={`w-3 h-3 rounded-full ${
                                        target.health === 'up' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {target.last_scrape_duration}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsMonitor;
```

### 2. Embedded Grafana Dashboards

```jsx
// components/homelab/GrafanaEmbed.jsx
import React, { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

const GrafanaEmbed = ({ dashboardUid, panelId = null, height = 400, title = null }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [embedUrl, setEmbedUrl] = useState('');

    useEffect(() => {
        const grafanaApi = new GrafanaAPI({
            baseUrl: process.env.REACT_APP_GRAFANA_URL,
            apiToken: process.env.REACT_APP_GRAFANA_TOKEN
        });

        const url = grafanaApi.generateEmbedUrl(dashboardUid, panelId, {
            theme: 'dark',
            refresh: '30s',
            from: 'now-1h',
            to: 'now'
        });

        setEmbedUrl(url);
    }, [dashboardUid, panelId]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!embedUrl) {
        return <div className="bg-gray-800 p-4 rounded-lg">Loading Grafana dashboard...</div>;
    }

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'relative'}`}>
            <div className={`bg-gray-800/50 rounded-lg border border-gray-700 ${isFullscreen ? 'h-full' : ''}`}>
                {title && (
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-gray-400 hover:text-white rounded"
                                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            >
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                            <a
                                href={embedUrl.replace('kiosk=true', 'kiosk=false')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white rounded"
                                title="Open in Grafana"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                )}
                <iframe
                    src={embedUrl}
                    width="100%"
                    height={isFullscreen ? 'calc(100vh - 60px)' : height}
                    frameBorder="0"
                    className="rounded-b-lg"
                ></iframe>
            </div>
        </div>
    );
};

export default GrafanaEmbed;
```

## Configuration

### Environment Variables

```bash
# .env
REACT_APP_GRAFANA_URL=http://your-grafana:3000
REACT_APP_GRAFANA_TOKEN=your-service-account-token
REACT_APP_GRAFANA_ORG_ID=1

REACT_APP_PROMETHEUS_URL=http://your-prometheus:9090
REACT_APP_PROMETHEUS_TIMEOUT=30000

REACT_APP_INFLUXDB_URL=http://your-influxdb:8086
REACT_APP_INFLUXDB_TOKEN=your-influxdb-token
REACT_APP_INFLUXDB_ORG=your-org
```

### Integration with Homelab Context

```javascript
// Add to homelabConstants.js
export const MONITORING_ENDPOINTS = {
    grafana: {
        dashboards: '/api/search',
        dashboard: '/api/dashboards/uid/',
        alerts: '/api/alerts',
        annotations: '/api/annotations'
    },
    prometheus: {
        query: '/api/v1/query',
        queryRange: '/api/v1/query_range',
        targets: '/api/v1/targets',
        alerts: '/api/v1/alerts',
        rules: '/api/v1/rules'
    }
};

export const COMMON_PROMETHEUS_QUERIES = {
    cpu: 'round((1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100, 0.1)',
    memory: 'round((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100, 0.1)',
    disk: 'round((1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100, 0.1)',
    network_in: 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
    network_out: 'rate(node_network_transmit_bytes_total{device!="lo"}[5m])',
    load: 'node_load1',
    uptime: 'node_time_seconds - node_boot_time_seconds'
};
```

## Advanced Features

### 1. Custom Alerting System

```jsx
// Alert management component
const AlertManager = ({ alerts }) => {
    const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());

    const acknowledgeAlert = (alertId) => {
        setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    };

    return (
        <div className="space-y-4">
            {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                    acknowledgedAlerts.has(alert.id) 
                        ? 'bg-gray-700/50 border-gray-600' 
                        : 'bg-red-500/10 border-red-500/20'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium">{alert.name}</h4>
                            <p className="text-sm text-gray-400">{alert.message}</p>
                        </div>
                        <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
```

### 2. Multi-Dashboard Grid

```jsx
// Dashboard grid for multiple Grafana panels
const DashboardGrid = () => {
    const dashboards = [
        { uid: 'system-overview', title: 'System Overview' },
        { uid: 'network-monitoring', title: 'Network Stats' },
        { uid: 'application-metrics', title: 'Applications' },
        { uid: 'security-events', title: 'Security' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboards.map((dashboard, index) => (
                <GrafanaEmbed
                    key={index}
                    dashboardUid={dashboard.uid}
                    title={dashboard.title}
                    height={300}
                />
            ))}
        </div>
    );
};
```

## Security and Best Practices

1. **Service Account Tokens**: Use dedicated service accounts with minimal required permissions
2. **CORS Configuration**: Configure Grafana and Prometheus to allow cross-origin requests
3. **Network Security**: Secure monitoring infrastructure with proper firewall rules
4. **Data Retention**: Configure appropriate data retention policies for time-series data
5. **Authentication**: Implement proper authentication for monitoring endpoints
6. **Rate Limiting**: Respect API rate limits and implement proper error handling

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure `allow_embedding = true` in Grafana configuration
2. **Authentication Failures**: Verify service account tokens and permissions
3. **Slow Dashboard Loading**: Optimize Prometheus queries and dashboard refresh rates
4. **Missing Metrics**: Check Prometheus target configuration and scrape health
5. **Iframe Issues**: Ensure proper embedding settings and CSP headers

### Debug Commands

```bash
# Test Grafana API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://your-grafana:3000/api/dashboards/home

# Test Prometheus API
curl http://your-prometheus:9090/api/v1/query?query=up

# Check Grafana configuration
docker exec grafana-container cat /etc/grafana/grafana.ini | grep embedding
```

This integration provides comprehensive monitoring capabilities by combining Grafana's visualization power with Prometheus's metric collection, giving you professional-grade monitoring directly in your homelab dashboard.
