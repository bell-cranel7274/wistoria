import React, { useState, useEffect } from 'react';
import { ArrowLeft, Film, Play, Pause, RotateCcw, Settings, Users, HardDrive, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const MediaServer = () => {
  const navigate = useNavigate();
  const [serverStats, setServerStats] = useState({
    status: 'online',
    version: 'Plex Media Server v1.40.1',
    uptime: '15 days, 7 hours',
    activeStreams: 3,
    totalUsers: 12,
    libraryCount: {
      movies: 1247,
      tvShows: 156,
      music: 3421,
      photos: 8934
    },
    storage: {
      total: '8TB',
      used: '5.2TB',
      available: '2.8TB',
      usage: 65
    },
    bandwidth: {
      current: '25 Mbps',
      peak: '78 Mbps',
      total: '2.1 TB'
    }
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, user: 'John', action: 'Started watching', content: 'The Dark Knight', time: '5 min ago', type: 'movie' },
    { id: 2, user: 'Sarah', action: 'Finished watching', content: 'Breaking Bad S5E16', time: '12 min ago', type: 'tv' },
    { id: 3, user: 'Mike', action: 'Added to library', content: '24 new movies', time: '1 hour ago', type: 'library' },
    { id: 4, user: 'Admin', action: 'Transcoding completed', content: 'Inception (4K)', time: '2 hours ago', type: 'system' },
    { id: 5, user: 'Emma', action: 'Started playlist', content: 'Chill Vibes Mix', time: '3 hours ago', type: 'music' }
  ]);

  const [activeStreams, setActiveStreams] = useState([
    { 
      id: 1, 
      user: 'John', 
      content: 'The Dark Knight', 
      quality: '1080p', 
      bandwidth: '8 Mbps',
      progress: 45,
      device: 'Smart TV'
    },
    { 
      id: 2, 
      user: 'Sarah', 
      content: 'Breaking Bad S5E16', 
      quality: '720p', 
      bandwidth: '4 Mbps',
      progress: 78,
      device: 'iPad'
    },
    { 
      id: 3, 
      user: 'Mike', 
      content: 'The Office S3E12', 
      quality: '1080p', 
      bandwidth: '6 Mbps',
      progress: 23,
      device: 'iPhone'
    }
  ]);

  const restartServer = () => {
    setServerStats(prev => ({ ...prev, status: 'restarting' }));
    setTimeout(() => {
      setServerStats(prev => ({ ...prev, status: 'online' }));
    }, 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'restarting':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Play className="w-5 h-5 text-green-500" />;
      case 'restarting':
        return <RotateCcw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'offline':
        return <Pause className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'movie':
        return <Film className="w-4 h-4 text-blue-500" />;
      case 'tv':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'music':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'library':
        return <HardDrive className="w-4 h-4 text-orange-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
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
              <Film className="w-6 h-6 text-purple-500" />
              Media Server Manager
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={restartServer}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              disabled={serverStats.status === 'restarting'}
            >
              <RotateCcw className={`w-4 h-4 ${serverStats.status === 'restarting' ? 'animate-spin' : ''}`} />
              Restart Server
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Server Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(serverStats.status)}
              <div>
                <h2 className="font-semibold text-lg">Server Status</h2>
                <p className="text-sm text-muted-foreground">{serverStats.version}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${getStatusColor(serverStats.status)}`}>
                {serverStats.status.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">Uptime: {serverStats.uptime}</div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{serverStats.activeStreams}</div>
            <div className="text-sm text-muted-foreground">Active Streams</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{serverStats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{serverStats.libraryCount.movies}</div>
            <div className="text-sm text-muted-foreground">Movies</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{serverStats.libraryCount.tvShows}</div>
            <div className="text-sm text-muted-foreground">TV Shows</div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Streams */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Active Streams
            </h2>
            <div className="space-y-4">
              {activeStreams.map((stream) => (
                <div key={stream.id} className="p-4 bg-accent/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{stream.content}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stream.user} • {stream.device}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{stream.quality}</div>
                      <div className="text-muted-foreground">{stream.bandwidth}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stream.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stream.progress}% complete
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Storage Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-500" />
              Storage Usage
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Used Storage</span>
                <span className="font-semibold">{serverStats.storage.used}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${serverStats.storage.usage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Available: {serverStats.storage.available}</span>
                <span>Total: {serverStats.storage.total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-accent/5 rounded-lg">
                  <div className="font-semibold text-lg">{serverStats.libraryCount.music}</div>
                  <div className="text-sm text-muted-foreground">Music Tracks</div>
                </div>
                <div className="text-center p-3 bg-accent/5 rounded-lg">
                  <div className="font-semibold text-lg">{serverStats.libraryCount.photos}</div>
                  <div className="text-sm text-muted-foreground">Photos</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-accent/5 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-muted-foreground">{activity.action}</span>
                    <span className="font-medium">{activity.content}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bandwidth Usage */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Bandwidth Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{serverStats.bandwidth.current}</div>
              <div className="text-sm text-muted-foreground">Current Usage</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{serverStats.bandwidth.peak}</div>
              <div className="text-sm text-muted-foreground">Peak Usage</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{serverStats.bandwidth.total}</div>
              <div className="text-sm text-muted-foreground">Total Streamed</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
