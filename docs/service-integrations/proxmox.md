# Proxmox VE Integration Guide

Complete guide for integrating Proxmox Virtual Environment with your homelab dashboard.

## 🎯 Overview

Proxmox VE is a powerful virtualization platform that combines KVM virtualization and LXC containers. This guide shows how to integrate it with your homelab dashboard for comprehensive VM and container management.

## 🔧 Proxmox API Setup

### 1. Enable API Access
```bash
# On Proxmox server, enable API access
pvesh set /access/domains/pam -comment "PAM standard authentication"

# Create API user
pveum user add homelab-api@pve --password your-secure-password --comment "Homelab Dashboard API"

# Create role with necessary permissions
pveum role add HomelabRole -privs "VM.Audit,VM.Monitor,VM.PowerMgmt,Datastore.Audit,Sys.Audit,Pool.Audit"

# Assign role to user
pveum aclmod / -user homelab-api@pve -role HomelabRole
```

### 2. API Token Authentication (Recommended)
```bash
# Create API token (more secure than password)
pveum user token add homelab-api@pve homelab-token --privsep 0

# Note the Token ID and Secret - you'll need these
# Token ID: homelab-api@pve!homelab-token
# Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🚀 Implementation

### 1. Proxmox Client (`src/integrations/proxmoxClient.js`)
```javascript
const axios = require('axios');
const https = require('https');

class ProxmoxClient {
  constructor(config) {
    this.host = config.host;
    this.port = config.port || 8006;
    this.username = config.username;
    this.password = config.password;
    this.tokenId = config.tokenId;
    this.tokenSecret = config.tokenSecret;
    this.baseURL = `https://${this.host}:${this.port}/api2/json`;
    this.ticket = null;
    this.csrf = null;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // For self-signed certificates
      })
    });
  }

  async authenticate() {
    if (this.tokenId && this.tokenSecret) {
      // Use API token authentication
      this.client.defaults.headers.common['Authorization'] = 
        `PVEAPIToken=${this.tokenId}=${this.tokenSecret}`;
      return;
    }

    if (this.ticket) return;

    try {
      const response = await this.client.post('/access/ticket', {
        username: this.username,
        password: this.password
      });

      this.ticket = response.data.data.ticket;
      this.csrf = response.data.data.CSRFPreventionToken;
      
      this.client.defaults.headers.common['Cookie'] = `PVEAuthCookie=${this.ticket}`;
      this.client.defaults.headers.common['CSRFPreventionToken'] = this.csrf;
    } catch (error) {
      console.error('Proxmox authentication failed:', error);
      throw error;
    }
  }

  async apiRequest(method, endpoint, data = null) {
    await this.authenticate();
    
    const config = {
      method,
      url: endpoint,
      ...(data && { data })
    };

    try {
      const response = await this.client(config);
      return response.data.data;
    } catch (error) {
      console.error(`Proxmox API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // Cluster Information
  async getClusterStatus() {
    return await this.apiRequest('GET', '/cluster/status');
  }

  async getNodes() {
    return await this.apiRequest('GET', '/nodes');
  }

  // Node Information
  async getNodeStatus(node) {
    return await this.apiRequest('GET', `/nodes/${node}/status`);
  }

  async getNodeResources(node) {
    return await this.apiRequest('GET', `/nodes/${node}/resources`);
  }

  async getNodeVersion(node) {
    return await this.apiRequest('GET', `/nodes/${node}/version`);
  }

  // Virtual Machines
  async getVMs(node = null) {
    if (node) {
      return await this.apiRequest('GET', `/nodes/${node}/qemu`);
    }
    
    // Get VMs from all nodes
    const nodes = await this.getNodes();
    const allVMs = [];
    
    for (const nodeInfo of nodes) {
      if (nodeInfo.type === 'node' && nodeInfo.online) {
        try {
          const vms = await this.apiRequest('GET', `/nodes/${nodeInfo.node}/qemu`);
          allVMs.push(...vms.map(vm => ({ ...vm, node: nodeInfo.node })));
        } catch (error) {
          console.error(`Failed to get VMs from node ${nodeInfo.node}:`, error);
        }
      }
    }
    
    return allVMs;
  }

  async getVMStatus(node, vmid) {
    return await this.apiRequest('GET', `/nodes/${node}/qemu/${vmid}/status/current`);
  }

  async getVMConfig(node, vmid) {
    return await this.apiRequest('GET', `/nodes/${node}/qemu/${vmid}/config`);
  }

  // VM Control
  async startVM(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/qemu/${vmid}/status/start`);
  }

  async stopVM(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/qemu/${vmid}/status/stop`);
  }

  async shutdownVM(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/qemu/${vmid}/status/shutdown`);
  }

  async rebootVM(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/qemu/${vmid}/status/reboot`);
  }

  // LXC Containers
  async getContainers(node = null) {
    if (node) {
      return await this.apiRequest('GET', `/nodes/${node}/lxc`);
    }
    
    // Get containers from all nodes
    const nodes = await this.getNodes();
    const allContainers = [];
    
    for (const nodeInfo of nodes) {
      if (nodeInfo.type === 'node' && nodeInfo.online) {
        try {
          const containers = await this.apiRequest('GET', `/nodes/${nodeInfo.node}/lxc`);
          allContainers.push(...containers.map(ct => ({ ...ct, node: nodeInfo.node })));
        } catch (error) {
          console.error(`Failed to get containers from node ${nodeInfo.node}:`, error);
        }
      }
    }
    
    return allContainers;
  }

  async getContainerStatus(node, vmid) {
    return await this.apiRequest('GET', `/nodes/${node}/lxc/${vmid}/status/current`);
  }

  // Container Control
  async startContainer(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/lxc/${vmid}/status/start`);
  }

  async stopContainer(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/lxc/${vmid}/status/stop`);
  }

  async shutdownContainer(node, vmid) {
    return await this.apiRequest('POST', `/nodes/${node}/lxc/${vmid}/status/shutdown`);
  }

  // Storage
  async getStorage() {
    const nodes = await this.getNodes();
    const storageData = [];
    
    for (const nodeInfo of nodes) {
      if (nodeInfo.type === 'node' && nodeInfo.online) {
        try {
          const storage = await this.apiRequest('GET', `/nodes/${nodeInfo.node}/storage`);
          storageData.push(...storage.map(s => ({ ...s, node: nodeInfo.node })));
        } catch (error) {
          console.error(`Failed to get storage from node ${nodeInfo.node}:`, error);
        }
      }
    }
    
    return storageData;
  }

  // Backups
  async getBackups(node = null) {
    if (node) {
      return await this.apiRequest('GET', `/nodes/${node}/storage/local/content`, {
        content: 'backup'
      });
    }
    
    const nodes = await this.getNodes();
    const allBackups = [];
    
    for (const nodeInfo of nodes) {
      if (nodeInfo.type === 'node' && nodeInfo.online) {
        try {
          const backups = await this.apiRequest('GET', `/nodes/${nodeInfo.node}/storage/local/content?content=backup`);
          allBackups.push(...backups.map(b => ({ ...b, node: nodeInfo.node })));
        } catch (error) {
          console.error(`Failed to get backups from node ${nodeInfo.node}:`, error);
        }
      }
    }
    
    return allBackups;
  }

  // Tasks
  async getTasks(node = null) {
    if (node) {
      return await this.apiRequest('GET', `/nodes/${node}/tasks`);
    }
    
    const nodes = await this.getNodes();
    const allTasks = [];
    
    for (const nodeInfo of nodes) {
      if (nodeInfo.type === 'node' && nodeInfo.online) {
        try {
          const tasks = await this.apiRequest('GET', `/nodes/${nodeInfo.node}/tasks`);
          allTasks.push(...tasks.map(t => ({ ...t, node: nodeInfo.node })));
        } catch (error) {
          console.error(`Failed to get tasks from node ${nodeInfo.node}:`, error);
        }
      }
    }
    
    return allTasks;
  }
}

module.exports = ProxmoxClient;
```

### 2. Proxmox Service (`src/services/proxmoxService.js`)
```javascript
const ProxmoxClient = require('../integrations/proxmoxClient');

class ProxmoxService {
  constructor() {
    this.client = new ProxmoxClient({
      host: process.env.PROXMOX_HOST,
      port: process.env.PROXMOX_PORT,
      tokenId: process.env.PROXMOX_TOKEN_ID,
      tokenSecret: process.env.PROXMOX_TOKEN_SECRET,
      // Fallback to username/password if tokens not available
      username: process.env.PROXMOX_USERNAME,
      password: process.env.PROXMOX_PASSWORD
    });
  }

  async getClusterOverview() {
    try {
      const [status, nodes] = await Promise.all([
        this.client.getClusterStatus(),
        this.client.getNodes()
      ]);

      const activeNodes = nodes.filter(n => n.type === 'node' && n.online);
      const totalResources = {
        cpu: 0,
        memory: 0,
        storage: 0,
        cpuUsed: 0,
        memoryUsed: 0,
        storageUsed: 0
      };

      for (const node of activeNodes) {
        try {
          const resources = await this.client.getNodeResources(node.node);
          totalResources.cpu += resources.cpu || 0;
          totalResources.memory += resources.memory || 0;
          totalResources.cpuUsed += resources.cpu * (resources.cpu_usage || 0);
          totalResources.memoryUsed += resources.memory * (resources.memory_usage || 0);
        } catch (error) {
          console.error(`Failed to get resources for node ${node.node}:`, error);
        }
      }

      return {
        cluster: {
          name: status.find(s => s.type === 'cluster')?.name || 'Proxmox Cluster',
          status: 'online',
          nodes: activeNodes.length,
          version: status.find(s => s.type === 'cluster')?.version
        },
        resources: {
          cpu: {
            total: totalResources.cpu,
            used: totalResources.cpuUsed,
            percentage: totalResources.cpu > 0 ? (totalResources.cpuUsed / totalResources.cpu) * 100 : 0
          },
          memory: {
            total: totalResources.memory,
            used: totalResources.memoryUsed,
            percentage: totalResources.memory > 0 ? (totalResources.memoryUsed / totalResources.memory) * 100 : 0
          }
        },
        nodes: activeNodes
      };
    } catch (error) {
      console.error('Proxmox cluster overview error:', error);
      throw error;
    }
  }

  async getVirtualMachines() {
    try {
      const vms = await this.client.getVMs();
      const vmDetails = [];

      for (const vm of vms) {
        try {
          const [status, config] = await Promise.all([
            this.client.getVMStatus(vm.node, vm.vmid),
            this.client.getVMConfig(vm.node, vm.vmid)
          ]);

          vmDetails.push({
            id: vm.vmid,
            name: vm.name || config.name || `VM-${vm.vmid}`,
            node: vm.node,
            status: vm.status,
            uptime: status.uptime,
            cpu: {
              cores: config.cores,
              usage: status.cpu * 100
            },
            memory: {
              total: config.memory * 1024 * 1024, // Convert MB to bytes
              used: status.mem,
              percentage: config.memory > 0 ? (status.mem / (config.memory * 1024 * 1024)) * 100 : 0
            },
            disk: {
              size: status.maxdisk,
              used: status.disk,
              percentage: status.maxdisk > 0 ? (status.disk / status.maxdisk) * 100 : 0
            },
            network: {
              in: status.netin,
              out: status.netout
            },
            os: config.ostype,
            template: vm.template === 1,
            tags: config.tags ? config.tags.split(',') : []
          });
        } catch (error) {
          console.error(`Failed to get details for VM ${vm.vmid}:`, error);
          // Add basic info even if detailed fetch fails
          vmDetails.push({
            id: vm.vmid,
            name: vm.name || `VM-${vm.vmid}`,
            node: vm.node,
            status: vm.status,
            error: 'Failed to fetch details'
          });
        }
      }

      return vmDetails;
    } catch (error) {
      console.error('Proxmox VMs error:', error);
      throw error;
    }
  }

  async getContainers() {
    try {
      const containers = await this.client.getContainers();
      const containerDetails = [];

      for (const container of containers) {
        try {
          const status = await this.client.getContainerStatus(container.node, container.vmid);

          containerDetails.push({
            id: container.vmid,
            name: container.name || `CT-${container.vmid}`,
            node: container.node,
            status: container.status,
            uptime: status.uptime,
            cpu: {
              cores: status.cpus,
              usage: status.cpu * 100
            },
            memory: {
              total: status.maxmem,
              used: status.mem,
              percentage: status.maxmem > 0 ? (status.mem / status.maxmem) * 100 : 0
            },
            disk: {
              size: status.maxdisk,
              used: status.disk,
              percentage: status.maxdisk > 0 ? (status.disk / status.maxdisk) * 100 : 0
            },
            network: {
              in: status.netin,
              out: status.netout
            },
            template: container.template === 1,
            tags: container.tags ? container.tags.split(',') : []
          });
        } catch (error) {
          console.error(`Failed to get details for container ${container.vmid}:`, error);
          containerDetails.push({
            id: container.vmid,
            name: container.name || `CT-${container.vmid}`,
            node: container.node,
            status: container.status,
            error: 'Failed to fetch details'
          });
        }
      }

      return containerDetails;
    } catch (error) {
      console.error('Proxmox containers error:', error);
      throw error;
    }
  }

  async getStorageInfo() {
    try {
      const storage = await this.client.getStorage();
      const storageDetails = [];

      for (const store of storage) {
        storageDetails.push({
          id: store.storage,
          node: store.node,
          type: store.type,
          content: store.content,
          enabled: store.enabled === 1,
          shared: store.shared === 1,
          size: store.total,
          used: store.used,
          available: store.avail,
          percentage: store.total > 0 ? (store.used / store.total) * 100 : 0
        });
      }

      return storageDetails;
    } catch (error) {
      console.error('Proxmox storage error:', error);
      throw error;
    }
  }

  async getBackups() {
    try {
      const backups = await this.client.getBackups();
      
      return backups.map(backup => ({
        id: backup.volid,
        node: backup.node,
        vmid: backup.vmid,
        type: backup.content,
        size: backup.size,
        created: new Date(backup.ctime * 1000).toISOString(),
        notes: backup.notes,
        format: backup.format
      }));
    } catch (error) {
      console.error('Proxmox backups error:', error);
      throw error;
    }
  }

  async getRunningTasks() {
    try {
      const tasks = await this.client.getTasks();
      
      return tasks
        .filter(task => task.status === 'running')
        .map(task => ({
          id: task.upid,
          node: task.node,
          type: task.type,
          description: task.id,
          user: task.user,
          startTime: new Date(task.starttime * 1000).toISOString(),
          status: task.status
        }));
    } catch (error) {
      console.error('Proxmox tasks error:', error);
      throw error;
    }
  }

  // Control Methods
  async controlVM(node, vmid, action) {
    try {
      switch (action) {
        case 'start':
          return await this.client.startVM(node, vmid);
        case 'stop':
          return await this.client.stopVM(node, vmid);
        case 'shutdown':
          return await this.client.shutdownVM(node, vmid);
        case 'reboot':
          return await this.client.rebootVM(node, vmid);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Proxmox VM control error (${action}):`, error);
      throw error;
    }
  }

  async controlContainer(node, vmid, action) {
    try {
      switch (action) {
        case 'start':
          return await this.client.startContainer(node, vmid);
        case 'stop':
          return await this.client.stopContainer(node, vmid);
        case 'shutdown':
          return await this.client.shutdownContainer(node, vmid);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Proxmox container control error (${action}):`, error);
      throw error;
    }
  }
}

module.exports = new ProxmoxService();
```

### 3. API Controller (`src/controllers/proxmoxController.js`)
```javascript
const proxmoxService = require('../services/proxmoxService');

class ProxmoxController {
  async getClusterOverview(req, res) {
    try {
      const overview = await proxmoxService.getClusterOverview();
      res.json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox cluster overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cluster overview',
        message: error.message
      });
    }
  }

  async getVirtualMachines(req, res) {
    try {
      const vms = await proxmoxService.getVirtualMachines();
      res.json({
        success: true,
        data: vms,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox VMs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch virtual machines'
      });
    }
  }

  async getContainers(req, res) {
    try {
      const containers = await proxmoxService.getContainers();
      res.json({
        success: true,
        data: containers,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox containers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch containers'
      });
    }
  }

  async getStorage(req, res) {
    try {
      const storage = await proxmoxService.getStorageInfo();
      res.json({
        success: true,
        data: storage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox storage error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch storage information'
      });
    }
  }

  async getBackups(req, res) {
    try {
      const backups = await proxmoxService.getBackups();
      res.json({
        success: true,
        data: backups,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox backups error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch backup information'
      });
    }
  }

  async getTasks(req, res) {
    try {
      const tasks = await proxmoxService.getRunningTasks();
      res.json({
        success: true,
        data: tasks,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch running tasks'
      });
    }
  }

  async controlVM(req, res) {
    try {
      const { node, vmid, action } = req.params;
      const result = await proxmoxService.controlVM(node, vmid, action);
      
      res.json({
        success: true,
        data: result,
        message: `VM ${vmid} ${action} command sent successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox VM control error:', error);
      res.status(500).json({
        success: false,
        error: `Failed to ${req.params.action} VM`,
        message: error.message
      });
    }
  }

  async controlContainer(req, res) {
    try {
      const { node, vmid, action } = req.params;
      const result = await proxmoxService.controlContainer(node, vmid, action);
      
      res.json({
        success: true,
        data: result,
        message: `Container ${vmid} ${action} command sent successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Proxmox container control error:', error);
      res.status(500).json({
        success: false,
        error: `Failed to ${req.params.action} container`,
        message: error.message
      });
    }
  }
}

module.exports = new ProxmoxController();
```

### 4. Add Routes to API (`src/routes/api.js`)
```javascript
// Add these routes to your existing api.js file
const proxmoxController = require('../controllers/proxmoxController');

// Proxmox routes
router.get('/proxmox/cluster', proxmoxController.getClusterOverview);
router.get('/proxmox/vms', proxmoxController.getVirtualMachines);
router.get('/proxmox/containers', proxmoxController.getContainers);
router.get('/proxmox/storage', proxmoxController.getStorage);
router.get('/proxmox/backups', proxmoxController.getBackups);
router.get('/proxmox/tasks', proxmoxController.getTasks);

// VM control
router.post('/proxmox/vms/:node/:vmid/:action', proxmoxController.controlVM);
router.post('/proxmox/containers/:node/:vmid/:action', proxmoxController.controlContainer);
```

### 5. Environment Variables
Add to your `.env` file:
```env
# Proxmox Configuration
PROXMOX_HOST=192.168.1.100
PROXMOX_PORT=8006
PROXMOX_TOKEN_ID=homelab-api@pve!homelab-token
PROXMOX_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Alternative: Username/Password (less secure)
# PROXMOX_USERNAME=homelab-api@pve
# PROXMOX_PASSWORD=your-secure-password
```

## 🎨 Frontend Integration

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';
import { Server, Play, Square, RotateCcw, Power } from 'lucide-react';

const ProxmoxDashboard = () => {
  const [cluster, setCluster] = useState(null);
  const [vms, setVMs] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProxmoxData();
    const interval = setInterval(fetchProxmoxData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  const fetchProxmoxData = async () => {
    try {
      const [clusterRes, vmsRes, containersRes] = await Promise.all([
        fetch('/api/proxmox/cluster'),
        fetch('/api/proxmox/vms'),
        fetch('/api/proxmox/containers')
      ]);

      const [clusterData, vmsData, containersData] = await Promise.all([
        clusterRes.json(),
        vmsRes.json(),
        containersRes.json()
      ]);

      setCluster(clusterData.data);
      setVMs(vmsData.data);
      setContainers(containersData.data);
    } catch (error) {
      console.error('Failed to fetch Proxmox data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleVMAction = async (node, vmid, action) => {
    try {
      const response = await fetch(`/api/proxmox/vms/${node}/${vmid}/${action}`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchProxmoxData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} VM:`, error);
    }
  };

  const handleContainerAction = async (node, vmid, action) => {
    try {
      const response = await fetch(`/api/proxmox/containers/${node}/${vmid}/${action}`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchProxmoxData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
    }
  };

  if (loading) return <div>Loading Proxmox data...</div>;

  return (
    <div className="space-y-6">
      {/* Cluster Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Server className="mr-2" />
          {cluster?.cluster.name}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nodes</p>
            <p className="text-2xl font-bold">{cluster?.cluster.nodes}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CPU Usage</p>
            <p className="text-2xl font-bold">{cluster?.resources.cpu.percentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="text-2xl font-bold">{cluster?.resources.memory.percentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Virtual Machines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4">Virtual Machines</h3>
        <div className="grid gap-4">
          {vms.map(vm => (
            <div key={`${vm.node}-${vm.id}`} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{vm.name}</h4>
                  <p className="text-sm text-gray-600">Node: {vm.node} | ID: {vm.id}</p>
                  <p className="text-sm">Status: 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      vm.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vm.status}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {vm.status === 'running' ? (
                    <>
                      <button
                        onClick={() => controlVM(vm.node, vm.id, 'shutdown')}
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        title="Shutdown"
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => controlVM(vm.node, vm.id, 'reboot')}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Reboot"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => controlVM(vm.node, vm.id, 'start')}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                      title="Start"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>
              </div>
              {vm.status === 'running' && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>CPU: {vm.cpu?.usage.toFixed(1)}%</div>
                  <div>Memory: {vm.memory?.percentage.toFixed(1)}%</div>
                  <div>Disk: {vm.disk?.percentage.toFixed(1)}%</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LXC Containers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4">LXC Containers</h3>
        <div className="grid gap-4">
          {containers.map(container => (
            <div key={`${container.node}-${container.id}`} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{container.name}</h4>
                  <p className="text-sm text-gray-600">Node: {container.node} | ID: {container.id}</p>
                  <p className="text-sm">Status: 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      container.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {container.status}
                    </span>
                  </p>
                </div>
                {/* Similar control buttons as VMs */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProxmoxDashboard;
```

## 🔐 Security Best Practices

1. **Use API Tokens**: Prefer API tokens over username/password
2. **Least Privilege**: Create roles with minimal necessary permissions
3. **Network Security**: Restrict API access to trusted networks
4. **HTTPS Only**: Always use HTTPS for API communication
5. **Regular Rotation**: Rotate API tokens regularly

## 🚀 Advanced Features

### Real-time Updates with WebSocket
```javascript
// Add to your WebSocket handler
socket.on('request-proxmox-update', async () => {
  try {
    const [cluster, vms, containers] = await Promise.all([
      proxmoxService.getClusterOverview(),
      proxmoxService.getVirtualMachines(),
      proxmoxService.getContainers()
    ]);
    
    socket.emit('proxmox-cluster-update', cluster);
    socket.emit('proxmox-vms-update', vms);
    socket.emit('proxmox-containers-update', containers);
  } catch (error) {
    socket.emit('error', { message: 'Failed to fetch Proxmox updates' });
  }
});
```

### Monitoring and Alerts
```javascript
// Monitor VM status changes
const monitorVMStatus = async () => {
  const vms = await proxmoxService.getVirtualMachines();
  
  for (const vm of vms) {
    if (vm.status === 'stopped' && vm.shouldBeRunning) {
      // Send alert
      await sendAlert({
        type: 'vm_down',
        message: `VM ${vm.name} is unexpectedly stopped`,
        severity: 'warning'
      });
    }
  }
};
```

## 📊 Monitoring Integration

### Prometheus Metrics
```javascript
// Export Proxmox metrics for Prometheus
app.get('/metrics/proxmox', async (req, res) => {
  try {
    const [cluster, vms, containers] = await Promise.all([
      proxmoxService.getClusterOverview(),
      proxmoxService.getVirtualMachines(),
      proxmoxService.getContainers()
    ]);

    let metrics = '';
    
    // Cluster metrics
    metrics += `proxmox_cluster_cpu_usage{cluster="${cluster.cluster.name}"} ${cluster.resources.cpu.percentage}\n`;
    metrics += `proxmox_cluster_memory_usage{cluster="${cluster.cluster.name}"} ${cluster.resources.memory.percentage}\n`;
    
    // VM metrics
    vms.forEach(vm => {
      if (vm.status === 'running') {
        metrics += `proxmox_vm_cpu_usage{node="${vm.node}",vmid="${vm.id}",name="${vm.name}"} ${vm.cpu.usage}\n`;
        metrics += `proxmox_vm_memory_usage{node="${vm.node}",vmid="${vm.id}",name="${vm.name}"} ${vm.memory.percentage}\n`;
      }
    });

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});
```

### Custom Metrics Collection
```javascript
// Enhanced metrics for detailed monitoring
const collectDetailedMetrics = async () => {
  const metrics = {
    timestamp: Date.now(),
    cluster: await proxmoxService.getClusterOverview(),
    nodes: await proxmoxService.getNodes(),
    vms: await proxmoxService.getVirtualMachines(),
    containers: await proxmoxService.getContainers(),
    storage: await proxmoxService.getStorageDetails(),
    backups: await proxmoxService.getBackupStatus()
  };

  // Calculate efficiency metrics
  metrics.efficiency = {
    vmDensity: metrics.vms.length / metrics.nodes.length,
    resourceUtilization: {
      cpu: metrics.cluster.resources.cpu.percentage,
      memory: metrics.cluster.resources.memory.percentage,
      storage: metrics.cluster.resources.storage.percentage
    },
    powerEfficiency: metrics.vms.filter(vm => vm.status === 'running').length / metrics.vms.length
  };

  return metrics;
};
```

## 🎯 Best Practices

### Resource Management
1. **VM Sizing Guidelines**
   - Start with minimal resources and scale up as needed
   - Monitor resource usage patterns before allocation changes
   - Use balloon memory driver for dynamic memory management

2. **Storage Best Practices**
   - Use SSD storage for OS and frequently accessed data
   - Implement regular backup schedules
   - Monitor storage performance and capacity

3. **Network Configuration**
   - Separate management and VM traffic
   - Implement VLANs for network segmentation
   - Monitor network throughput and latency

### Automation Scripts
```bash
#!/bin/bash
# proxmox-health-check.sh
# Daily health check script

API_TOKEN="your-api-token"
PROXMOX_HOST="your-proxmox-host"

echo "=== Proxmox Health Check $(date) ==="

# Check cluster status
curl -s -k -H "Authorization: PVEAPIToken=$API_TOKEN" \
  "https://$PROXMOX_HOST:8006/api2/json/cluster/status" | \
  jq '.data[] | select(.type=="cluster") | .name'

# Check node status
curl -s -k -H "Authorization: PVEAPIToken=$API_TOKEN" \
  "https://$PROXMOX_HOST:8006/api2/json/nodes" | \
  jq '.data[] | {node: .node, status: .status, cpu: .cpu, mem: .mem}'

# Check failed backups
curl -s -k -H "Authorization: PVEAPIToken=$API_TOKEN" \
  "https://$PROXMOX_HOST:8006/api2/json/cluster/backup" | \
  jq '.data[] | select(.last_run_state=="ERROR") | {job: .id, error: .last_run_endtime}'
```

### Backup Automation
```javascript
// Automated backup management
class ProxmoxBackupManager {
  constructor(proxmoxService) {
    this.proxmox = proxmoxService;
  }

  async createBackupJob(config) {
    const backupConfig = {
      starttime: config.startTime || '02:00',
      all: config.allVMs || false,
      vmid: config.vmids?.join(','),
      node: config.node,
      storage: config.storage,
      mode: config.mode || 'snapshot',
      compress: config.compress || 'zstd',
      enabled: 1,
      dow: config.daysOfWeek || 'sun,mon,tue,wed,thu,fri,sat'
    };

    return await this.proxmox.makeRequest('/cluster/backup', 'POST', backupConfig);
  }

  async getBackupLogs() {
    const logs = await this.proxmox.makeRequest('/cluster/backup');
    return logs.data.map(job => ({
      id: job.id,
      lastRun: job.last_run_endtime,
      status: job.last_run_state,
      duration: job.last_run_endtime - job.last_run_starttime,
      size: job.size
    }));
  }
}
```

## 🔄 Integration Examples

### Home Assistant Integration
```yaml
# configuration.yaml
sensor:
  - platform: rest
    name: "Proxmox Cluster CPU"
    resource: "http://homelab-api:3000/api/proxmox/cluster"
    value_template: "{{ value_json.resources.cpu.percentage }}"
    unit_of_measurement: "%"
    
  - platform: rest
    name: "Proxmox VMs Running"
    resource: "http://homelab-api:3000/api/proxmox/vms"
    value_template: "{{ value_json | selectattr('status', 'equalto', 'running') | list | length }}"
    unit_of_measurement: "VMs"

automation:
  - alias: "Proxmox High CPU Alert"
    trigger:
      platform: numeric_state
      entity_id: sensor.proxmox_cluster_cpu
      above: 80
    action:
      service: notify.telegram
      data:
        message: "⚠️ Proxmox cluster CPU usage is high: {{ states('sensor.proxmox_cluster_cpu') }}%"
```

### Discord Bot Integration
```javascript
// Discord bot for Proxmox management
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('proxmox-status')
    .setDescription('Get Proxmox cluster status'),
    
  new SlashCommandBuilder()
    .setName('vm-control')
    .setDescription('Control a VM')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Start', value: 'start' },
          { name: 'Stop', value: 'stop' },
          { name: 'Restart', value: 'restart' }
        ))
    .addIntegerOption(option =>
      option.setName('vmid')
        .setDescription('VM ID')
        .setRequired(true))
];

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'proxmox-status') {
    const cluster = await proxmoxService.getClusterOverview();
    const embed = {
      title: '🖥️ Proxmox Cluster Status',
      fields: [
        { name: 'CPU Usage', value: `${cluster.resources.cpu.percentage.toFixed(1)}%`, inline: true },
        { name: 'Memory Usage', value: `${cluster.resources.memory.percentage.toFixed(1)}%`, inline: true },
        { name: 'Storage Usage', value: `${cluster.resources.storage.percentage.toFixed(1)}%`, inline: true }
      ],
      color: cluster.resources.cpu.percentage > 80 ? 0xff0000 : 0x00ff00
    };
    
    await interaction.reply({ embeds: [embed] });
  }
});
```

## 📋 Complete Configuration Checklist

### Initial Setup
- [ ] Proxmox VE installed and configured
- [ ] API user created with appropriate permissions
- [ ] API token generated and stored securely
- [ ] SSL certificates configured (optional but recommended)
- [ ] Network access configured between homelab dashboard and Proxmox

### Dashboard Integration
- [ ] Proxmox service implemented with all required methods
- [ ] API routes configured and tested
- [ ] Frontend components implemented
- [ ] Real-time updates configured
- [ ] Error handling implemented

### Monitoring Setup
- [ ] Prometheus metrics endpoint configured
- [ ] Grafana dashboard imported
- [ ] Alert rules configured
- [ ] Notification channels set up
- [ ] Health check scripts deployed

### Security Configuration
- [ ] API token permissions minimized
- [ ] IP restrictions configured (if needed)
- [ ] SSL verification enabled
- [ ] Rate limiting implemented
- [ ] Audit logging enabled

### Backup and Maintenance
- [ ] Backup jobs configured
- [ ] Backup monitoring implemented
- [ ] Health check automation deployed
- [ ] Documentation updated
- [ ] Team training completed

## 🔗 Additional Resources

- [Proxmox VE API Documentation](https://pve.proxmox.com/pve-docs/api-viewer/)
- [Proxmox VE Administration Guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.html)
- [Best Practices for Virtualization](https://www.proxmox.com/en/proxmox-ve/best-practices)
- [Community Scripts and Tools](https://github.com/tteck/Proxmox)

---

This comprehensive Proxmox integration provides complete control and monitoring of your virtualization infrastructure through your homelab dashboard. The modular design allows you to implement features incrementally based on your specific needs and requirements.

For advanced features like automatic scaling, disaster recovery, or multi-cluster management, consider extending the base implementation with additional specialized modules.
