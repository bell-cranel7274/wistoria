# Nextcloud Integration

This guide covers integrating Nextcloud into your homelab dashboard, providing file storage monitoring, user management, and sync status tracking.

## ☁️ Overview

Nextcloud is a popular self-hosted cloud storage and collaboration platform. This integration provides comprehensive monitoring and management capabilities for your Nextcloud instance.

## 📊 Features

### Core Functionality
- **Storage Analytics** - Disk usage, quotas, file counts, and growth trends
- **User Management** - Active users, last login times, quota usage
- **App Monitoring** - Installed apps, versions, and update status
- **Sync Status** - Client connections, sync errors, and performance
- **System Health** - Server status, database performance, cache status
- **Activity Monitoring** - Recent file activities, sharing events, user actions

### Advanced Features
- **File Analytics** - File type distribution, largest files, duplicate detection
- **Security Monitoring** - Failed login attempts, suspicious activities, two-factor status
- **Collaboration Metrics** - Shared folders, collaborative documents, group activities
- **External Storage** - External storage points status and performance
- **Federation Monitoring** - Federated shares and remote connections
- **Notification Center** - System notifications and alerts

## 🔧 Implementation

### Nextcloud API Integration

```javascript
// src/services/NextcloudAPI.js
class NextcloudAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://cloud.example.com';
    this.username = config.username;
    this.password = config.password; // App password recommended
    this.timeout = config.timeout || 10000;
    this.headers = {
      'Authorization': `Basic ${btoa(`${this.username}:${this.password}`)}`,
      'OCS-APIRequest': 'true',
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: { ...this.headers, ...options.headers },
        timeout: this.timeout,
        ...options
      });

      if (!response.ok) {
        throw new Error(`Nextcloud API error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error('Nextcloud API request failed:', error);
      throw error;
    }
  }

  // System Information
  async getSystemInfo() {
    const data = await this.makeRequest('/ocs/v2.php/apps/serverinfo/api/v1/info?format=json');
    const info = data.ocs.data;
    
    return {
      version: info.nextcloud.version,
      versionString: info.nextcloud.versionstring,
      edition: info.nextcloud.edition,
      productName: info.nextcloud.productname,
      system: {
        version: info.system.version,
        theme: info.system.theme,
        enableAvatars: info.system.enable_avatars,
        enablePreviews: info.system.enable_previews,
        memcacheLocal: info.system.memcache_local,
        memcacheDistributed: info.system.memcache_distributed,
        filelockingEnabled: info.system.filelocking_enabled,
        memcacheLocking: info.system.memcache_locking,
        debugMode: info.system.debug,
        freespace: info.system.freespace,
        cpuload: info.system.cpuload,
        memTotal: info.system.mem_total,
        memFree: info.system.mem_free,
        swapTotal: info.system.swap_total,
        swapFree: info.system.swap_free
      },
      storage: {
        numUsers: info.storage.num_users,
        numFiles: info.storage.num_files,
        numStorages: info.storage.num_storages,
        numStoragesLocal: info.storage.num_storages_local,
        numStoragesHome: info.storage.num_storages_home,
        numStoragesOther: info.storage.num_storages_other
      },
      shares: {
        numShares: info.shares.num_shares,
        numSharesUser: info.shares.num_shares_user,
        numSharesGroups: info.shares.num_shares_groups,
        numSharesLink: info.shares.num_shares_link,
        numSharesMail: info.shares.num_shares_mail,
        numSharesRoom: info.shares.num_shares_room,
        numSharesLinkNoPassword: info.shares.num_shares_link_no_password,
        numFedSharesSent: info.shares.num_fed_shares_sent,
        numFedSharesReceived: info.shares.num_fed_shares_received
      }
    };
  }

  // User Management
  async getUsers() {
    const data = await this.makeRequest('/ocs/v2.php/cloud/users?format=json');
    const userIds = data.ocs.data.users;
    
    const users = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userData = await this.makeRequest(`/ocs/v2.php/cloud/users/${userId}?format=json`);
          const user = userData.ocs.data;
          
          return {
            id: user.id,
            displayName: user.displayname,
            email: user.email,
            enabled: user.enabled,
            quota: {
              free: user.quota?.free || 0,
              used: user.quota?.used || 0,
              total: user.quota?.total || 0,
              relative: user.quota?.relative || 0,
              quota: user.quota?.quota || 0
            },
            groups: user.groups || [],
            subAdmins: user.subadmin || [],
            lastLogin: user.lastLogin ? new Date(user.lastLogin * 1000) : null,
            backend: user.backend,
            storageLocation: user.storageLocation,
            language: user.language,
            locale: user.locale,
            backendCapabilities: user.backendCapabilities || {}
          };
        } catch (error) {
          console.warn(`Failed to fetch details for user ${userId}:`, error);
          return {
            id: userId,
            displayName: userId,
            error: true
          };
        }
      })
    );

    return users.filter(user => !user.error);
  }

  // Storage Analytics
  async getStorageStats() {
    const systemInfo = await this.getSystemInfo();
    const users = await this.getUsers();
    
    const totalQuota = users.reduce((sum, user) => sum + (user.quota.quota || 0), 0);
    const totalUsed = users.reduce((sum, user) => sum + (user.quota.used || 0), 0);
    const totalFree = users.reduce((sum, user) => sum + (user.quota.free || 0), 0);
    
    return {
      system: {
        freeSpace: systemInfo.system.freespace,
        numFiles: systemInfo.storage.numFiles,
        numUsers: systemInfo.storage.numUsers,
        numStorages: systemInfo.storage.numStorages
      },
      usage: {
        totalQuota,
        totalUsed,
        totalFree,
        usagePercentage: totalQuota > 0 ? (totalUsed / totalQuota) * 100 : 0
      },
      users: users.map(user => ({
        id: user.id,
        displayName: user.displayName,
        used: user.quota.used,
        quota: user.quota.quota,
        percentage: user.quota.relative
      })).sort((a, b) => b.used - a.used)
    };
  }

  // Activity Feed
  async getActivity(limit = 50) {
    try {
      const data = await this.makeRequest(`/ocs/v2.php/apps/activity/api/v2/activity?format=json&limit=${limit}`);
      const activities = data.ocs.data || [];
      
      return activities.map(activity => ({
        activityId: activity.activity_id,
        app: activity.app,
        type: activity.type,
        user: activity.user,
        affectedUser: activity.affecteduser,
        timestamp: new Date(activity.datetime),
        subject: activity.subject,
        subjectRich: activity.subject_rich,
        message: activity.message,
        messageRich: activity.message_rich,
        objectType: activity.object_type,
        objectId: activity.object_id,
        objectName: activity.object_name,
        objects: activity.objects || {},
        link: activity.link,
        icon: activity.icon
      }));
    } catch (error) {
      console.warn('Activity app may not be enabled:', error);
      return [];
    }
  }

  // App Information
  async getApps() {
    const data = await this.makeRequest('/ocs/v2.php/cloud/apps?format=json');
    const appIds = data.ocs.data.apps;
    
    const apps = await Promise.all(
      appIds.map(async (appId) => {
        try {
          const appData = await this.makeRequest(`/ocs/v2.php/cloud/apps/${appId}?format=json`);
          const app = appData.ocs.data;
          
          return {
            id: app.id,
            name: app.name,
            summary: app.summary,
            description: app.description,
            version: app.version,
            licence: app.licence,
            author: app.author,
            namespace: app.namespace,
            category: app.category,
            website: app.website,
            bugs: app.bugs,
            repository: app.repository,
            screenshot: app.screenshot,
            dependencies: app.dependencies || {},
            enabled: app.enabled,
            internal: app.internal,
            removable: app.removable,
            installed: app.installed,
            canInstall: app.canInstall,
            canUpdate: app.canUpdate,
            updateAvailable: app.update
          };
        } catch (error) {
          return {
            id: appId,
            name: appId,
            enabled: true,
            error: true
          };
        }
      })
    );

    return apps.filter(app => !app.error);
  }

  // Shares Information
  async getShares() {
    try {
      const data = await this.makeRequest('/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json');
      const shares = data.ocs.data || [];
      
      return shares.map(share => ({
        id: share.id,
        shareType: share.share_type,
        shareWith: share.share_with,
        shareWithDisplayname: share.share_with_displayname,
        shareWithAvatar: share.share_with_avatar,
        uidOwner: share.uid_owner,
        displaynameOwner: share.displayname_owner,
        permissions: share.permissions,
        canEdit: (share.permissions & 2) !== 0,
        canCreate: (share.permissions & 4) !== 0,
        canChange: (share.permissions & 8) !== 0,
        canDelete: (share.permissions & 16) !== 0,
        canShare: (share.permissions & 16) !== 0,
        stime: new Date(share.stime * 1000),
        parent: share.parent,
        expiration: share.expiration ? new Date(share.expiration) : null,
        token: share.token,
        uidFileOwner: share.uid_file_owner,
        note: share.note,
        label: share.label,
        path: share.path,
        itemType: share.item_type,
        itemSource: share.item_source,
        itemTarget: share.item_target,
        fileSource: share.file_source,
        fileTarget: share.file_target,
        url: share.url,
        mailSend: share.mail_send,
        hideDownload: share.hide_download
      }));
    } catch (error) {
      console.warn('Failed to fetch shares:', error);
      return [];
    }
  }

  // Group Information
  async getGroups() {
    try {
      const data = await this.makeRequest('/ocs/v2.php/cloud/groups?format=json');
      const groupIds = data.ocs.data.groups;
      
      const groups = await Promise.all(
        groupIds.map(async (groupId) => {
          try {
            const groupData = await this.makeRequest(`/ocs/v2.php/cloud/groups/${groupId}?format=json`);
            const group = groupData.ocs.data;
            
            return {
              id: group.id,
              displayName: group.displayname,
              users: group.users || [],
              disabled: group.disabled || 0,
              canAdd: group.canAdd,
              canRemove: group.canRemove
            };
          } catch (error) {
            return {
              id: groupId,
              displayName: groupId,
              users: [],
              error: true
            };
          }
        })
      );

      return groups.filter(group => !group.error);
    } catch (error) {
      console.warn('Failed to fetch groups:', error);
      return [];
    }
  }

  // Server Status Check
  async getServerStatus() {
    try {
      const start = Date.now();
      const data = await this.makeRequest('/status.php');
      const responseTime = Date.now() - start;
      
      return {
        installed: data.installed,
        maintenance: data.maintenance,
        needsDbUpgrade: data.needsDbUpgrade,
        version: data.version,
        versionstring: data.versionstring,
        edition: data.edition,
        productname: data.productname,
        extendedSupport: data.extendedSupport,
        responseTime,
        status: 'healthy'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: null
      };
    }
  }

  // Security Monitoring
  async getSecurityStatus() {
    try {
      const systemInfo = await this.getSystemInfo();
      const users = await this.getUsers();
      
      const twoFactorUsers = users.filter(user => 
        user.backendCapabilities.setPassword || 
        user.backendCapabilities.setDisplayName
      ).length;
      
      const adminUsers = users.filter(user => 
        user.groups.includes('admin')
      ).length;
      
      return {
        debugMode: systemInfo.system.debugMode,
        twoFactorEnabled: twoFactorUsers > 0,
        twoFactorUsers,
        adminUsers,
        totalUsers: users.length,
        enableAvatars: systemInfo.system.enableAvatars,
        enablePreviews: systemInfo.system.enablePreviews,
        memcacheConfigured: systemInfo.system.memcacheLocal !== 'none',
        filelockingEnabled: systemInfo.system.filelockingEnabled
      };
    } catch (error) {
      console.warn('Failed to get security status:', error);
      return {
        error: error.message
      };
    }
  }
}

export default NextcloudAPI;
```

### React Dashboard Component

```jsx
// src/components/NextcloudDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Cloud, Users, HardDrive, Activity, Shield, Share2, 
  Settings, AlertTriangle, CheckCircle, Download, Upload,
  FileText, FolderOpen, Calendar, Mail
} from 'lucide-react';
import NextcloudAPI from '../services/NextcloudAPI';

const NextcloudDashboard = ({ config }) => {
  const [data, setData] = useState({
    systemInfo: {},
    users: [],
    storageStats: {},
    activity: [],
    apps: [],
    shares: [],
    groups: [],
    status: {},
    security: {},
    loading: true,
    error: null
  });

  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const api = new NextcloudAPI(config);
    
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const [
          status,
          systemInfo,
          users,
          storageStats,
          activity,
          apps,
          shares,
          groups,
          security
        ] = await Promise.allSettled([
          api.getServerStatus(),
          api.getSystemInfo(),
          api.getUsers(),
          api.getStorageStats(),
          api.getActivity(20),
          api.getApps(),
          api.getShares(),
          api.getGroups(),
          api.getSecurityStatus()
        ]);

        setData({
          status: status.value || {},
          systemInfo: systemInfo.value || {},
          users: users.value || [],
          storageStats: storageStats.value || {},
          activity: activity.value || [],
          apps: apps.value || [],
          shares: shares.value || [],
          groups: groups.value || [],
          security: security.value || {},
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch Nextcloud data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [config, refreshInterval]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'text-green-500';
    if (status === 'unhealthy') return 'text-red-500';
    return 'text-yellow-500';
  };

  if (data.loading && Object.keys(data.status).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">☁️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{data.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const enabledApps = data.apps.filter(app => app.enabled);
  const updateableApps = data.apps.filter(app => app.canUpdate);
  const activeUsers = data.users.filter(user => user.enabled && user.lastLogin);
  const topUsers = data.storageStats.users?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cloud className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Nextcloud Server</h2>
              <p className="text-blue-100">
                {data.status.productname} v{data.status.versionstring}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm flex items-center ${getStatusColor(data.status.status)}`}>
              {data.status.status === 'healthy' ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
              {data.status.status || 'Unknown'}
            </div>
            {data.status.responseTime && (
              <div className="text-sm opacity-90">{data.status.responseTime}ms response</div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Activity },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'storage', name: 'Storage', icon: HardDrive },
              { id: 'apps', name: 'Apps', icon: Settings },
              { id: 'shares', name: 'Shares', icon: Share2 },
              { id: 'security', name: 'Security', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Total Users</p>
                      <p className="text-2xl font-semibold">{data.users.length}</p>
                      <p className="text-xs opacity-75">{activeUsers.length} active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Files</p>
                      <p className="text-2xl font-semibold">{data.systemInfo.storage?.numFiles || 0}</p>
                      <p className="text-xs opacity-75">{data.systemInfo.storage?.numStorages || 0} storages</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <Share2 className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Shares</p>
                      <p className="text-2xl font-semibold">{data.shares.length}</p>
                      <p className="text-xs opacity-75">{data.systemInfo.shares?.numSharesLink || 0} public</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Apps</p>
                      <p className="text-2xl font-semibold">{enabledApps.length}</p>
                      <p className="text-xs opacity-75">{updateableApps.length} updates</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Maintenance Mode</span>
                      <span className={`text-sm font-medium ${data.status.maintenance ? 'text-red-600' : 'text-green-600'}`}>
                        {data.status.maintenance ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database Upgrade Needed</span>
                      <span className={`text-sm font-medium ${data.status.needsDbUpgrade ? 'text-yellow-600' : 'text-green-600'}`}>
                        {data.status.needsDbUpgrade ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Free Space</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatBytes(data.systemInfo.system?.freespace || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="text-sm font-medium text-gray-900">
                        {data.systemInfo.system?.memTotal && data.systemInfo.system?.memFree ? 
                          `${Math.round(((data.systemInfo.system.memTotal - data.systemInfo.system.memFree) / data.systemInfo.system.memTotal) * 100)}%` : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {data.activity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {activity.type === 'file_created' && <FileText className="h-4 w-4 text-green-500" />}
                          {activity.type === 'file_changed' && <Activity className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'file_deleted' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {activity.type === 'shared' && <Share2 className="h-4 w-4 text-purple-500" />}
                          {!['file_created', 'file_changed', 'file_deleted', 'shared'].includes(activity.type) && 
                            <Activity className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{activity.subject}</p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {activity.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="text-sm text-gray-500">
                  {data.users.length} total users • {activeUsers.length} active
                </div>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.users.slice(0, 10).map((user, index) => (
                      <tr key={user.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {(user.displayName || user.id).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.displayName || user.id}</div>
                              <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatBytes(user.quota?.used || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.quota?.quota > 0 ? formatBytes(user.quota.quota) : 'Unlimited'}
                          {user.quota?.relative > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(user.quota.relative, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Storage Analytics</h3>
              
              {data.storageStats.usage && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Storage Usage Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatBytes(data.storageStats.usage.totalUsed)}</div>
                      <div className="text-sm text-gray-500">Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatBytes(data.storageStats.usage.totalQuota)}</div>
                      <div className="text-sm text-gray-500">Total Quota</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{data.storageStats.usage.usagePercentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Used</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${Math.min(data.storageStats.usage.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {topUsers.length > 0 && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900">Top Storage Users</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {topUsers.map((user, index) => (
                      <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatBytes(user.used)}</div>
                          <div className="text-xs text-gray-500">{user.percentage}% of quota</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Apps Tab */}
          {activeTab === 'apps' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Installed Applications</h3>
                <div className="text-sm text-gray-500">
                  {enabledApps.length} enabled • {updateableApps.length} updates available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.apps.map((app, index) => (
                  <div key={app.id || index} className={`border rounded-lg p-4 ${app.enabled ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{app.name || app.id}</h4>
                        <p className="text-xs text-gray-500 mt-1">v{app.version}</p>
                        {app.summary && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{app.summary}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {app.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {app.canUpdate && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Update
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shares Tab */}
          {activeTab === 'shares' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">File Shares</h3>
                <div className="text-sm text-gray-500">
                  {data.shares.length} total shares
                </div>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shared With
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.shares.slice(0, 10).map((share, index) => (
                      <tr key={share.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FolderOpen className="h-4 w-4 mr-2 text-gray-400" />
                            {share.path || share.fileTarget}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {share.shareWithDisplayname || share.shareWith || 'Public'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {share.shareType === 0 && 'User'}
                          {share.shareType === 1 && 'Group'}
                          {share.shareType === 3 && 'Public Link'}
                          {share.shareType === 4 && 'Email'}
                          {share.shareType === 6 && 'Federation'}
                          {![0, 1, 3, 4, 6].includes(share.shareType) && 'Other'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-1">
                            {share.canEdit && <span className="bg-blue-100 text-blue-800 text-xs px-1 rounded">Edit</span>}
                            {share.canShare && <span className="bg-green-100 text-green-800 text-xs px-1 rounded">Share</span>}
                            {share.canDelete && <span className="bg-red-100 text-red-800 text-xs px-1 rounded">Delete</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {share.stime.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Security Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Debug Mode</span>
                      <span className={`text-sm font-medium ${data.security.debugMode ? 'text-red-600' : 'text-green-600'}`}>
                        {data.security.debugMode ? 'Enabled (⚠️)' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                      <span className={`text-sm font-medium ${data.security.twoFactorUsers > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {data.security.twoFactorUsers || 0} users
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Admin Users</span>
                      <span className="text-sm font-medium text-gray-900">
                        {data.security.adminUsers || 0} users
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">File Locking</span>
                      <span className={`text-sm font-medium ${data.security.filelockingEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                        {data.security.filelockingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memory Cache</span>
                      <span className={`text-sm font-medium ${data.security.memcacheConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                        {data.security.memcacheConfigured ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">User Security</h4>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{data.security.totalUsers || 0}</div>
                      <div className="text-sm text-gray-500">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{data.security.twoFactorUsers || 0}</div>
                      <div className="text-sm text-gray-500">2FA Enabled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{data.security.adminUsers || 0}</div>
                      <div className="text-sm text-gray-500">Administrators</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextcloudDashboard;
```

## 🔐 Configuration

### Environment Variables

```bash
# Nextcloud Configuration
REACT_APP_NEXTCLOUD_URL=https://your-nextcloud-server.com
REACT_APP_NEXTCLOUD_USERNAME=your-username
REACT_APP_NEXTCLOUD_PASSWORD=your-app-password

# Optional: Admin-specific endpoints
REACT_APP_NEXTCLOUD_ADMIN_USER=admin
REACT_APP_NEXTCLOUD_ADMIN_PASSWORD=admin-app-password
```

### App Password Setup

1. Log into your Nextcloud instance
2. Go to Settings → Personal → Security
3. Scroll down to "App passwords"
4. Enter a name for the app password (e.g., "Dashboard")
5. Click "Create new app password"
6. Copy the generated password (use this instead of your regular password)

## 🚀 Usage Examples

### Basic Integration

```jsx
// App.js
import NextcloudDashboard from './components/NextcloudDashboard';

function App() {
  const nextcloudConfig = {
    baseURL: process.env.REACT_APP_NEXTCLOUD_URL,
    username: process.env.REACT_APP_NEXTCLOUD_USERNAME,
    password: process.env.REACT_APP_NEXTCLOUD_PASSWORD
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <NextcloudDashboard config={nextcloudConfig} />
      </div>
    </div>
  );
}

export default App;
```

### Multi-Instance Setup

```jsx
// src/components/NextcloudMultiInstance.jsx
import React from 'react';
import NextcloudDashboard from './NextcloudDashboard';

const NextcloudMultiInstance = () => {
  const instances = [
    {
      name: 'Personal Cloud',
      config: {
        baseURL: 'https://personal.nextcloud.com',
        username: process.env.REACT_APP_NC_PERSONAL_USER,
        password: process.env.REACT_APP_NC_PERSONAL_PASS
      }
    },
    {
      name: 'Family Cloud',
      config: {
        baseURL: 'https://family.nextcloud.com',
        username: process.env.REACT_APP_NC_FAMILY_USER,
        password: process.env.REACT_APP_NC_FAMILY_PASS
      }
    }
  ];

  return (
    <div className="space-y-8">
      {instances.map((instance, index) => (
        <div key={index}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{instance.name}</h2>
          <NextcloudDashboard config={instance.config} />
        </div>
      ))}
    </div>
  );
};

export default NextcloudMultiInstance;
```

## 🛡️ Security Considerations

### Authentication
- **App Passwords**: Always use app passwords instead of main passwords
- **HTTPS Only**: Ensure all connections use HTTPS
- **Token Storage**: Store credentials securely in environment variables
- **Access Scoping**: Create separate app passwords for different applications

### API Permissions
- **Read-Only Access**: Dashboard should only read data, not modify settings
- **User Isolation**: Respect user permissions and data isolation
- **Rate Limiting**: Implement client-side rate limiting
- **Error Handling**: Don't expose sensitive information in error messages

## 🔍 Troubleshooting

### Common Issues

#### Authentication Errors
```javascript
// Handle authentication issues
const handleAuthError = (error) => {
  if (error.message.includes('401')) {
    return 'Invalid username or app password. Please check credentials.';
  } else if (error.message.includes('403')) {
    return 'Access denied. User may not have sufficient permissions.';
  }
  return 'Authentication failed';
};
```

#### CORS Issues
```javascript
// For development, you may need to handle CORS
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const url = isDevelopment ? `${corsProxy}${this.baseURL}${endpoint}` : `${this.baseURL}${endpoint}`;
```

#### Rate Limiting
```javascript
// Implement retry logic for rate limiting
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

## 📈 Advanced Features

### Custom Monitoring Alerts

```javascript
// src/services/NextcloudMonitor.js
class NextcloudMonitor {
  constructor(api) {
    this.api = api;
    this.thresholds = {
      storageUsage: 85, // Alert at 85% storage usage
      inactiveUsers: 30, // Alert if user inactive for 30 days
      failedLogins: 5, // Alert after 5 failed login attempts
      lowDiskSpace: 5 * 1024 * 1024 * 1024 // Alert at 5GB free space
    };
  }

  async checkAlerts() {
    const alerts = [];
    
    try {
      const [storageStats, systemInfo, security] = await Promise.all([
        this.api.getStorageStats(),
        this.api.getSystemInfo(),
        this.api.getSecurityStatus()
      ]);

      // Storage usage alert
      if (storageStats.usage.usagePercentage > this.thresholds.storageUsage) {
        alerts.push({
          type: 'warning',
          message: `Storage usage is at ${storageStats.usage.usagePercentage.toFixed(1)}%`,
          severity: 'high'
        });
      }

      // Low disk space alert
      if (systemInfo.system.freespace < this.thresholds.lowDiskSpace) {
        alerts.push({
          type: 'critical',
          message: `Low disk space: ${this.formatBytes(systemInfo.system.freespace)} remaining`,
          severity: 'critical'
        });
      }

      // Security alerts
      if (security.debugMode) {
        alerts.push({
          type: 'security',
          message: 'Debug mode is enabled in production',
          severity: 'medium'
        });
      }

      return alerts;
    } catch (error) {
      return [{
        type: 'error',
        message: `Failed to check alerts: ${error.message}`,
        severity: 'high'
      }];
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default NextcloudMonitor;
```

This comprehensive Nextcloud integration provides detailed monitoring and management capabilities for your self-hosted cloud storage, including user management, storage analytics, security monitoring, and real-time activity tracking.
