import React, { useState } from 'react';
import { ArrowLeft, Shield, Globe, BarChart3, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const PiHoleManager = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    queriesBlocked: 15420,
    totalQueries: 89347,
    blockingPercentage: 17.3,
    domainsBlocked: 1203456,
    topBlockedDomains: [
      { domain: 'googleadservices.com', blocked: 1247 },
      { domain: 'facebook.com', blocked: 892 },
      { domain: 'doubleclick.net', blocked: 743 },
      { domain: 'googlesyndication.com', blocked: 634 },
      { domain: 'amazon-adsystem.com', blocked: 521 }
    ],
    topClients: [
      { ip: '192.168.1.105', name: 'Living Room TV', queries: 2341 },
      { ip: '192.168.1.106', name: 'John\'s Laptop', queries: 1876 },
      { ip: '192.168.1.107', name: 'Smart Phone', queries: 1543 },
      { ip: '192.168.1.108', name: 'Kitchen Tablet', queries: 987 },
      { ip: '192.168.1.109', name: 'Gaming PC', queries: 743 }
    ]
  });

  const [settings, setSettings] = useState({
    blocking: true,
    queryLogging: true,
    dnsServer: '8.8.8.8',
    interface: 'eth0'
  });

  const toggleBlocking = () => {
    setSettings(prev => ({ ...prev, blocking: !prev.blocking }));
  };

  const refreshStats = () => {
    // Simulate refreshing stats
    setStats(prev => ({
      ...prev,
      queriesBlocked: prev.queriesBlocked + Math.floor(Math.random() * 100),
      totalQueries: prev.totalQueries + Math.floor(Math.random() * 200)
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-accent/10 rounded-full"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              Pi-hole Manager
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshStats}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={toggleBlocking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                settings.blocking 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Shield className="w-4 h-4" />
              {settings.blocking ? 'Disable Blocking' : 'Enable Blocking'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-sm">Queries Blocked</h3>
            </div>
            <div className="text-2xl font-bold text-red-500">{stats.queriesBlocked.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-sm">Total Queries</h3>
            </div>
            <div className="text-2xl font-bold text-blue-500">{stats.totalQueries.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-sm">Blocking %</h3>
            </div>
            <div className="text-2xl font-bold text-green-500">{stats.blockingPercentage}%</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-sm">Domains Blocked</h3>
            </div>
            <div className="text-2xl font-bold text-purple-500">{stats.domainsBlocked.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">On Blocklist</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Blocked Domains */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-500" />
              Top Blocked Domains
            </h2>
            <div className="space-y-3">
              {stats.topBlockedDomains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{domain.domain}</div>
                    <div className="text-xs text-muted-foreground">Blocked {domain.blocked} times</div>
                  </div>
                  <div className="w-12 h-2 bg-red-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ 
                        width: `${(domain.blocked / Math.max(...stats.topBlockedDomains.map(d => d.blocked))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Clients */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Top Clients
            </h2>
            <div className="space-y-3">
              {stats.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.ip}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{client.queries}</div>
                    <div className="text-xs text-muted-foreground">queries</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Settings */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Quick Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <span className="text-sm font-medium">Ad Blocking</span>
              <div className={`w-10 h-5 rounded-full p-1 ${settings.blocking ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.blocking ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <span className="text-sm font-medium">Query Logging</span>
              <div className={`w-10 h-5 rounded-full p-1 ${settings.queryLogging ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.queryLogging ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-sm font-medium mb-1">DNS Server</div>
              <div className="text-xs text-muted-foreground">{settings.dnsServer}</div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-sm font-medium mb-1">Interface</div>
              <div className="text-xs text-muted-foreground">{settings.interface}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PiHoleManager;
