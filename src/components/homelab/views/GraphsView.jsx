import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Network, GitBranch, Layers, Zap, Activity, 
  Server, HardDrive, Wifi, Database, Shield,
  TrendingUp, TrendingDown, BarChart2, PieChart
} from 'lucide-react';

const GraphsView = () => {
  const [selectedGraph, setSelectedGraph] = useState('network');
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const svgRef = useRef();
  const forceGraphRef = useRef();
  const hierarchyRef = useRef();

  // Network topology data
  const networkData = {
    nodes: [
      { id: 'router', name: 'Main Router', type: 'router', status: 'online', cpu: 15, x: 300, y: 200 },
      { id: 'switch1', name: 'Core Switch', type: 'switch', status: 'online', cpu: 8, x: 300, y: 100 },
      { id: 'proxmox', name: 'Proxmox Server', type: 'server', status: 'online', cpu: 45, x: 150, y: 50 },
      { id: 'truenas', name: 'TrueNAS', type: 'storage', status: 'online', cpu: 23, x: 450, y: 50 },
      { id: 'pihole', name: 'Pi-hole', type: 'service', status: 'online', cpu: 5, x: 100, y: 150 },
      { id: 'homeassistant', name: 'Home Assistant', type: 'service', status: 'online', cpu: 18, x: 500, y: 150 },
      { id: 'plex', name: 'Plex Media', type: 'service', status: 'warning', cpu: 67, x: 200, y: 250 },
      { id: 'grafana', name: 'Grafana', type: 'service', status: 'online', cpu: 12, x: 400, y: 250 },
      { id: 'nextcloud', name: 'Nextcloud', type: 'service', status: 'online', cpu: 28, x: 250, y: 300 },
      { id: 'firewall', name: 'pfSense', type: 'security', status: 'online', cpu: 19, x: 350, y: 300 }
    ],
    links: [
      { source: 'router', target: 'switch1', bandwidth: 95, latency: 1 },
      { source: 'switch1', target: 'proxmox', bandwidth: 87, latency: 2 },
      { source: 'switch1', target: 'truenas', bandwidth: 76, latency: 1 },
      { source: 'switch1', target: 'pihole', bandwidth: 34, latency: 1 },
      { source: 'router', target: 'homeassistant', bandwidth: 45, latency: 3 },
      { source: 'router', target: 'plex', bandwidth: 89, latency: 2 },
      { source: 'switch1', target: 'grafana', bandwidth: 23, latency: 1 },
      { source: 'router', target: 'nextcloud', bandwidth: 56, latency: 4 },
      { source: 'router', target: 'firewall', bandwidth: 67, latency: 1 }
    ]
  };

  // Service dependency data
  const dependencyData = {
    name: 'Homelab Infrastructure',
    children: [
      {
        name: 'Core Services',
        children: [
          { name: 'Router', value: 100, status: 'online' },
          { name: 'DNS (Pi-hole)', value: 95, status: 'online' },
          { name: 'Firewall', value: 98, status: 'online' }
        ]
      },
      {
        name: 'Virtualization',
        children: [
          { name: 'Proxmox VE', value: 92, status: 'online' },
          { name: 'VM Pool', value: 88, status: 'warning' },
          { name: 'Container Pool', value: 96, status: 'online' }
        ]
      },
      {
        name: 'Storage',
        children: [
          { name: 'TrueNAS Core', value: 97, status: 'online' },
          { name: 'ZFS Pools', value: 93, status: 'online' },
          { name: 'Backup Storage', value: 89, status: 'online' }
        ]
      },
      {
        name: 'Applications',
        children: [
          { name: 'Plex Media Server', value: 78, status: 'warning' },
          { name: 'Home Assistant', value: 94, status: 'online' },
          { name: 'Nextcloud', value: 91, status: 'online' },
          { name: 'Grafana', value: 99, status: 'online' }
        ]
      }
    ]
  };

  // Real-time metrics for animated graphs
  const [metricsData, setMetricsData] = useState([]);
  const [connectionFlow, setConnectionFlow] = useState([]);

  useEffect(() => {
    // Generate initial metrics
    const initialMetrics = Array.from({ length: 50 }, (_, i) => ({
      time: i,
      throughput: Math.random() * 100,
      latency: Math.random() * 50,
      errors: Math.random() * 10,
      connections: Math.floor(Math.random() * 1000)
    }));
    setMetricsData(initialMetrics);    // Simulate network flow
    const flows = networkData.links.map((link, i) => ({
      id: i,
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
      packets: Math.floor(Math.random() * 1000),
      direction: Math.random() > 0.5 ? 'inbound' : 'outbound'
    }));
    setConnectionFlow(flows);
  }, []);

  // Network topology visualization
  useEffect(() => {
    if (selectedGraph === 'network' && forceGraphRef.current) {
      const svg = d3.select(forceGraphRef.current);
      svg.selectAll('*').remove();

      const width = 800;
      const height = 600;

      svg.attr('width', width).attr('height', height);

      // Create simulation
      const simulation = d3.forceSimulation(networkData.nodes)
        .force('link', d3.forceLink(networkData.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

      // Create links
      const link = svg.append('g')
        .selectAll('line')
        .data(networkData.links)
        .enter().append('line')
        .attr('stroke', d => {
          if (d.bandwidth > 80) return '#10B981';
          if (d.bandwidth > 50) return '#F59E0B';
          return '#EF4444';
        })
        .attr('stroke-width', d => Math.max(2, d.bandwidth / 20))
        .attr('stroke-opacity', 0.8);

      // Create nodes
      const node = svg.append('g')
        .selectAll('g')
        .data(networkData.nodes)
        .enter().append('g')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      // Node circles
      node.append('circle')
        .attr('r', d => {
          switch(d.type) {
            case 'router': return 20;
            case 'server': return 18;
            case 'switch': return 15;
            case 'storage': return 16;
            default: return 12;
          }
        })
        .attr('fill', d => {
          if (d.status === 'online') return '#10B981';
          if (d.status === 'warning') return '#F59E0B';
          return '#EF4444';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Node labels
      node.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', 35)
        .attr('font-size', '12px')
        .attr('fill', '#374151');

      // CPU usage indicators
      node.append('text')
        .text(d => `${d.cpu}%`)
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff');

      // Update positions
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }, [selectedGraph]);

  // Hierarchical service tree
  useEffect(() => {
    if (selectedGraph === 'hierarchy' && hierarchyRef.current) {
      const svg = d3.select(hierarchyRef.current);
      svg.selectAll('*').remove();

      const width = 800;
      const height = 600;
      
      svg.attr('width', width).attr('height', height);

      const root = d3.hierarchy(dependencyData)
        .sum(d => d.value || 0)
        .sort((a, b) => b.value - a.value);

      const treemap = d3.treemap()
        .size([width, height])
        .paddingTop(28)
        .paddingRight(7)
        .paddingInner(3);

      treemap(root);

      const leaf = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

      leaf.append('rect')
        .attr('id', d => d.id)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => {
          if (d.data.status === 'online') return '#10B981';
          if (d.data.status === 'warning') return '#F59E0B';
          return '#EF4444';
        })
        .attr('fill-opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      leaf.append('text')
        .attr('x', 4)
        .attr('y', 20)
        .text(d => d.data.name)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff');

      leaf.append('text')
        .attr('x', 4)
        .attr('y', 35)
        .text(d => `${d.data.value}%`)
        .attr('font-size', '11px')
        .attr('fill', '#fff');

      // Add category labels
      svg.selectAll('.category')
        .data(root.children)
        .enter().append('text')
        .attr('class', 'category')
        .attr('x', d => d.x0 + 4)
        .attr('y', d => d.y0 + 16)
        .text(d => d.data.name)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151');
    }
  }, [selectedGraph]);

  // Real-time metrics stream
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsData(prev => {
        const newPoint = {
          time: prev.length,
          throughput: Math.random() * 100,
          latency: Math.random() * 50,
          errors: Math.random() * 10,
          connections: Math.floor(Math.random() * 1000)
        };
        return [...prev.slice(1), newPoint];
      });

      // Update connection flows
      setConnectionFlow(prev => prev.map(flow => ({
        ...flow,
        packets: Math.floor(Math.random() * 1000),
        direction: Math.random() > 0.5 ? 'inbound' : 'outbound'
      })));
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed]);

  const GraphSelector = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setSelectedGraph('network')}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          selectedGraph === 'network' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        <Network className="w-4 h-4" />
        <span>Network Topology</span>
      </button>
      <button
        onClick={() => setSelectedGraph('hierarchy')}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          selectedGraph === 'hierarchy' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Service Tree</span>
      </button>
      <button
        onClick={() => setSelectedGraph('flow')}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          selectedGraph === 'flow' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        <GitBranch className="w-4 h-4" />
        <span>Data Flow</span>
      </button>
    </div>
  );
  const ConnectionFlowList = () => (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-500" />
        Live Connection Flows
      </h3>
      <div className="space-y-2 max-h-400 overflow-y-auto">
        {connectionFlow.map(flow => (
          <div key={flow.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                flow.direction === 'inbound' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <span className="text-sm font-medium">
                {typeof flow.source === 'string' ? flow.source : flow.source?.id || 'Unknown'} → {typeof flow.target === 'string' ? flow.target : flow.target?.id || 'Unknown'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {flow.packets ? flow.packets.toLocaleString() : '0'} packets
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <GitBranch className="mr-3 text-purple-600" />
            Network Graphs
          </h1>
          <p className="text-gray-600 mt-1">Interactive network topology and service relationships</p>
        </div>
        <div className="flex space-x-4">
          <select 
            value={animationSpeed} 
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={500}>Fast (0.5s)</option>
            <option value={1000}>Normal (1s)</option>
            <option value={2000}>Slow (2s)</option>
            <option value={5000}>Very Slow (5s)</option>
          </select>
        </div>
      </div>

      {/* Graph Type Selector */}
      <GraphSelector />

      {/* Main Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-md">
            {selectedGraph === 'network' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Network Topology</h3>
                <svg ref={forceGraphRef} className="w-full border rounded"></svg>
              </div>
            )}
            
            {selectedGraph === 'hierarchy' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Service Dependency Tree</h3>
                <svg ref={hierarchyRef} className="w-full border rounded"></svg>
              </div>
            )}
            
            {selectedGraph === 'flow' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Data Flow Visualization</h3>
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Real-time data flow visualization</p>
                    <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <ConnectionFlowList />
          
          {/* Network Stats */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-green-500" />
              Network Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Nodes</span>
                <span className="font-semibold">{networkData.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="font-semibold">{networkData.links.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Bandwidth</span>
                <span className="font-semibold">
                  {(networkData.links.reduce((sum, link) => sum + link.bandwidth, 0) / networkData.links.length).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Online Services</span>
                <span className="font-semibold text-green-600">
                  {networkData.nodes.filter(node => node.status === 'online').length}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Graph Updates</span>
            </div>
          </div>
          <div className="text-sm">
            Update Rate: {animationSpeed}ms
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphsView;
