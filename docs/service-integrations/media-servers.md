# Media Server Integration (Plex/Jellyfin/Emby)

This guide covers integrating popular media servers into your homelab dashboard, providing comprehensive media library management, streaming status, and user activity monitoring.

## 🎬 Overview

Media servers are core components of modern homelabs, providing centralized media streaming and management. This integration supports:

- **Plex Media Server** - Premium media server with advanced features
- **Jellyfin** - Open-source alternative with full customization
- **Emby** - Feature-rich media server with mobile apps

## 📊 Features

### Core Functionality
- **Library Statistics** - Movies, TV shows, music, photos counts
- **Stream Monitoring** - Active streams, bandwidth usage, device tracking
- **User Management** - User activity, session monitoring, access control
- **Media Quality Analysis** - File formats, resolution distribution, storage usage
- **Server Health** - CPU/RAM usage, disk space, transcoding performance
- **Recent Activity** - Latest additions, user sessions, popular content

### Advanced Features
- **Transcoding Analytics** - Real-time transcoding sessions and performance
- **Bandwidth Monitoring** - Network usage per stream and user
- **Content Recommendations** - Trending content and viewing patterns
- **Mobile App Integration** - Remote access status and mobile client monitoring
- **Subtitle Management** - Subtitle availability and download status
- **Metadata Health** - Missing posters, descriptions, and metadata quality

## 🔧 Implementation

### Plex API Integration

```javascript
// src/services/PlexAPI.js
class PlexAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'http://localhost:32400';
    this.token = config.token;
    this.timeout = config.timeout || 10000;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'X-Plex-Token': this.token,
          'Accept': 'application/json',
          ...options.headers
        },
        timeout: this.timeout,
        ...options
      });

      if (!response.ok) {
        throw new Error(`Plex API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Plex API request failed:', error);
      throw error;
    }
  }

  // Server Information
  async getServerInfo() {
    const data = await this.makeRequest('/');
    return {
      name: data.MediaContainer.friendlyName,
      version: data.MediaContainer.version,
      platform: data.MediaContainer.platform,
      platformVersion: data.MediaContainer.platformVersion,
      updatedAt: data.MediaContainer.updatedAt
    };
  }

  // Library Statistics
  async getLibraryStats() {
    const sections = await this.makeRequest('/library/sections');
    const stats = {
      movies: 0,
      shows: 0,
      episodes: 0,
      artists: 0,
      albums: 0,
      tracks: 0,
      photos: 0
    };

    for (const section of sections.MediaContainer.Directory) {
      const sectionData = await this.makeRequest(`/library/sections/${section.key}/all`);
      const count = sectionData.MediaContainer.size;

      switch (section.type) {
        case 'movie':
          stats.movies += count;
          break;
        case 'show':
          stats.shows += count;
          // Get episode count
          const episodes = await this.makeRequest(`/library/sections/${section.key}/allLeaves`);
          stats.episodes += episodes.MediaContainer.size;
          break;
        case 'artist':
          stats.artists += count;
          break;
        case 'photo':
          stats.photos += count;
          break;
      }
    }

    return stats;
  }

  // Active Sessions (Currently Playing)
  async getActiveSessions() {
    try {
      const data = await this.makeRequest('/status/sessions');
      const sessions = data.MediaContainer.Metadata || [];
      
      return sessions.map(session => ({
        sessionKey: session.sessionKey,
        user: session.User?.title || 'Unknown',
        title: session.title,
        type: session.type,
        year: session.year,
        rating: session.contentRating,
        duration: session.duration,
        viewOffset: session.viewOffset,
        state: session.Player?.state,
        device: session.Player?.title,
        platform: session.Player?.platform,
        location: session.Session?.location,
        bandwidth: session.Session?.bandwidth,
        transcoding: session.TranscodeSession ? {
          key: session.TranscodeSession.key,
          throttled: session.TranscodeSession.throttled,
          progress: session.TranscodeSession.progress,
          speed: session.TranscodeSession.speed,
          duration: session.TranscodeSession.duration,
          context: session.TranscodeSession.context,
          videoDecision: session.TranscodeSession.videoDecision,
          audioDecision: session.TranscodeSession.audioDecision
        } : null
      }));
    } catch (error) {
      if (error.message.includes('404')) {
        return []; // No active sessions
      }
      throw error;
    }
  }

  // Recently Added Content
  async getRecentlyAdded(limit = 20) {
    const data = await this.makeRequest(`/library/recentlyAdded?X-Plex-Container-Size=${limit}`);
    const items = data.MediaContainer.Metadata || [];
    
    return items.map(item => ({
      key: item.key,
      title: item.title,
      type: item.type,
      year: item.year,
      addedAt: new Date(item.addedAt * 1000),
      thumb: item.thumb,
      art: item.art,
      rating: item.contentRating,
      summary: item.summary,
      duration: item.duration,
      library: item.librarySectionTitle
    }));
  }

  // Server Statistics
  async getServerStats() {
    try {
      const serverInfo = await this.getServerInfo();
      const libraryStats = await this.getLibraryStats();
      const activeSessions = await this.getActiveSessions();
      
      return {
        server: serverInfo,
        library: libraryStats,
        activeSessions: activeSessions.length,
        activeStreams: activeSessions.filter(s => s.state === 'playing').length,
        activeTranscodes: activeSessions.filter(s => s.transcoding).length,
        totalBandwidth: activeSessions.reduce((sum, s) => sum + (s.bandwidth || 0), 0)
      };
    } catch (error) {
      console.error('Failed to get server stats:', error);
      throw error;
    }
  }

  // User Activity
  async getUserActivity(days = 7) {
    const data = await this.makeRequest(`/status/sessions/history/all?sort=viewedAt:desc&viewedAt>=${Date.now() - (days * 24 * 60 * 60 * 1000)}`);
    const history = data.MediaContainer.Metadata || [];
    
    return history.map(item => ({
      historyKey: item.historyKey,
      title: item.title,
      type: item.type,
      user: item.accountID,
      device: item.device,
      viewedAt: new Date(item.viewedAt * 1000),
      duration: item.duration,
      viewOffset: item.viewOffset
    }));
  }
}

export default PlexAPI;
```

### Jellyfin API Integration

```javascript
// src/services/JellyfinAPI.js
class JellyfinAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'http://localhost:8096';
    this.apiKey = config.apiKey;
    this.userId = config.userId;
    this.timeout = config.timeout || 10000;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'X-Emby-Authorization': `MediaBrowser Client="Dashboard", Device="WebApp", DeviceId="dashboard", Version="1.0.0", Token="${this.apiKey}"`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: this.timeout,
        ...options
      });

      if (!response.ok) {
        throw new Error(`Jellyfin API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Jellyfin API request failed:', error);
      throw error;
    }
  }

  // Server Information
  async getServerInfo() {
    const data = await this.makeRequest('/System/Info');
    return {
      name: data.ServerName,
      version: data.Version,
      operatingSystem: data.OperatingSystem,
      architecture: data.SystemArchitecture,
      startupWizardCompleted: data.StartupWizardCompleted
    };
  }

  // Library Statistics
  async getLibraryStats() {
    const views = await this.makeRequest('/UserViews', {
      headers: { 'X-Emby-Client': 'Dashboard' }
    });
    
    const stats = {
      movies: 0,
      series: 0,
      episodes: 0,
      music: 0,
      books: 0,
      photos: 0
    };

    for (const view of views.Items) {
      const items = await this.makeRequest(`/Users/${this.userId}/Items?ParentId=${view.Id}&Recursive=true&IncludeItemTypes=${view.CollectionType}`);
      
      switch (view.CollectionType) {
        case 'movies':
          stats.movies += items.TotalRecordCount;
          break;
        case 'tvshows':
          stats.series += items.Items.filter(i => i.Type === 'Series').length;
          stats.episodes += items.Items.filter(i => i.Type === 'Episode').length;
          break;
        case 'music':
          stats.music += items.TotalRecordCount;
          break;
        case 'books':
          stats.books += items.TotalRecordCount;
          break;
        case 'photos':
          stats.photos += items.TotalRecordCount;
          break;
      }
    }

    return stats;
  }

  // Active Sessions
  async getActiveSessions() {
    const data = await this.makeRequest('/Sessions');
    
    return data.filter(session => session.NowPlayingItem).map(session => ({
      id: session.Id,
      userId: session.UserId,
      userName: session.UserName,
      deviceName: session.DeviceName,
      client: session.Client,
      applicationVersion: session.ApplicationVersion,
      nowPlaying: {
        name: session.NowPlayingItem.Name,
        type: session.NowPlayingItem.Type,
        runTimeTicks: session.NowPlayingItem.RunTimeTicks,
        playState: {
          positionTicks: session.PlayState.PositionTicks,
          canSeek: session.PlayState.CanSeek,
          isPaused: session.PlayState.IsPaused,
          isMuted: session.PlayState.IsMuted,
          volumeLevel: session.PlayState.VolumeLevel,
          playMethod: session.PlayState.PlayMethod
        }
      },
      transcoding: session.TranscodingInfo ? {
        audioCodec: session.TranscodingInfo.AudioCodec,
        videoCodec: session.TranscodingInfo.VideoCodec,
        container: session.TranscodingInfo.Container,
        isVideoDirect: session.TranscodingInfo.IsVideoDirect,
        isAudioDirect: session.TranscodingInfo.IsAudioDirect,
        bitrate: session.TranscodingInfo.Bitrate,
        framerate: session.TranscodingInfo.Framerate,
        completionPercentage: session.TranscodingInfo.CompletionPercentage
      } : null
    }));
  }

  // Recently Added
  async getRecentlyAdded(limit = 20) {
    const data = await this.makeRequest(`/Users/${this.userId}/Items/Latest?Limit=${limit}&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear`);
    
    return data.map(item => ({
      id: item.Id,
      name: item.Name,
      type: item.Type,
      year: item.ProductionYear,
      dateCreated: new Date(item.DateCreated),
      overview: item.Overview,
      communityRating: item.CommunityRating,
      runTimeTicks: item.RunTimeTicks,
      genres: item.Genres || [],
      studios: item.Studios || []
    }));
  }

  // System Activity
  async getSystemActivity() {
    const sessions = await this.getActiveSessions();
    const serverInfo = await this.getServerInfo();
    const libraryStats = await this.getLibraryStats();
    
    return {
      server: serverInfo,
      library: libraryStats,
      activeSessions: sessions.length,
      activeStreams: sessions.filter(s => !s.nowPlaying.playState.isPaused).length,
      activeTranscodes: sessions.filter(s => s.transcoding && !s.transcoding.isVideoDirect).length
    };
  }
}

export default JellyfinAPI;
```

### React Dashboard Components

```jsx
// src/components/MediaServerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, Users, Film, Tv, Music, HardDrive, Activity, TrendingUp } from 'lucide-react';
import PlexAPI from '../services/PlexAPI';
import JellyfinAPI from '../services/JellyfinAPI';

const MediaServerDashboard = ({ serverType = 'plex', config }) => {
  const [data, setData] = useState({
    server: {},
    library: {},
    sessions: [],
    recentlyAdded: [],
    loading: true,
    error: null
  });

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    const api = serverType === 'plex' ? new PlexAPI(config) : new JellyfinAPI(config);
    
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const [serverInfo, libraryStats, activeSessions, recentlyAdded] = await Promise.all([
          serverType === 'plex' ? api.getServerInfo() : api.getServerInfo(),
          serverType === 'plex' ? api.getLibraryStats() : api.getLibraryStats(),
          serverType === 'plex' ? api.getActiveSessions() : api.getActiveSessions(),
          serverType === 'plex' ? api.getRecentlyAdded(10) : api.getRecentlyAdded(10)
        ]);

        setData({
          server: serverInfo,
          library: libraryStats,
          sessions: activeSessions,
          recentlyAdded,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch media server data:', error);
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
  }, [serverType, config, refreshInterval]);

  const getServerIcon = () => {
    switch (serverType) {
      case 'plex':
        return '🎬';
      case 'jellyfin':
        return '🐙';
      case 'emby':
        return '📺';
      default:
        return '🎭';
    }
  };

  if (data.loading && Object.keys(data.server).length === 0) {
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
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
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

  const activeStreams = data.sessions.filter(s => s.state === 'playing' || (!s.state && !s.nowPlaying?.playState?.isPaused));
  const activeTranscodes = data.sessions.filter(s => s.transcoding || (s.transcoding && !s.transcoding.isVideoDirect));

  return (
    <div className="space-y-6">
      {/* Server Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getServerIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold capitalize">{serverType} Media Server</h2>
              <p className="text-purple-100">{data.server.name} • v{data.server.version}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Active Sessions</div>
            <div className="text-3xl font-bold">{data.sessions.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Film className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Movies</p>
              <p className="text-2xl font-semibold text-gray-900">{data.library.movies || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Tv className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">TV Shows</p>
              <p className="text-2xl font-semibold text-gray-900">{data.library.shows || data.library.series || 0}</p>
              {data.library.episodes && (
                <p className="text-xs text-gray-400">{data.library.episodes} episodes</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Music className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Music</p>
              <p className="text-2xl font-semibold text-gray-900">{data.library.music || data.library.artists || 0}</p>
              {data.library.tracks && (
                <p className="text-xs text-gray-400">{data.library.tracks} tracks</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Streaming</p>
              <p className="text-2xl font-semibold text-gray-900">{activeStreams.length}</p>
              {activeTranscodes.length > 0 && (
                <p className="text-xs text-orange-500">{activeTranscodes.length} transcoding</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {data.sessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Active Sessions ({data.sessions.length})
          </h3>
          <div className="space-y-4">
            {data.sessions.map((session, index) => (
              <div key={session.sessionKey || session.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {session.title || session.nowPlaying?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {session.user || session.userName} • {session.device || session.deviceName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.platform || session.client} • {session.location || 'Local'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {session.state === 'playing' || !session.nowPlaying?.playState?.isPaused ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-yellow-500" />
                    )}
                    {(session.transcoding || (session.transcoding && !session.transcoding.isVideoDirect)) && (
                      <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Transcoding
                      </div>
                    )}
                  </div>
                </div>
                {session.transcoding && (
                  <div className="mt-2 text-xs text-gray-500">
                    {session.transcoding.videoDecision || session.transcoding.videoCodec} • 
                    {session.transcoding.speed && ` ${session.transcoding.speed}x speed`}
                    {session.transcoding.progress && ` • ${Math.round(session.transcoding.progress)}% complete`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recently Added
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recentlyAdded.slice(0, 6).map((item, index) => (
            <div key={item.key || item.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 truncate">{item.title || item.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{item.type} • {item.year}</p>
              <p className="text-xs text-gray-500 mt-1">
                Added {(item.addedAt || item.dateCreated)?.toLocaleDateString()}
              </p>
              {item.summary && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.summary || item.overview}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaServerDashboard;
```

## 🔐 Configuration

### Environment Variables

```bash
# Plex Configuration
REACT_APP_PLEX_URL=http://your-plex-server:32400
REACT_APP_PLEX_TOKEN=your-plex-token

# Jellyfin Configuration  
REACT_APP_JELLYFIN_URL=http://your-jellyfin-server:8096
REACT_APP_JELLYFIN_API_KEY=your-jellyfin-api-key
REACT_APP_JELLYFIN_USER_ID=your-user-id

# Emby Configuration
REACT_APP_EMBY_URL=http://your-emby-server:8096
REACT_APP_EMBY_API_KEY=your-emby-api-key
```

### Getting API Credentials

#### Plex Token
1. Log into Plex Web App
2. Open browser developer tools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for requests to plex.tv containing `X-Plex-Token`
6. Copy the token value

#### Jellyfin API Key
1. Open Jellyfin Admin Dashboard
2. Go to Advanced → API Keys
3. Click "Add API Key"
4. Enter name and save
5. Copy the generated key

## 🚀 Usage Examples

### Basic Integration

```jsx
// App.js
import MediaServerDashboard from './components/MediaServerDashboard';

function App() {
  const plexConfig = {
    baseURL: process.env.REACT_APP_PLEX_URL,
    token: process.env.REACT_APP_PLEX_TOKEN
  };

  const jellyfinConfig = {
    baseURL: process.env.REACT_APP_JELLYFIN_URL,
    apiKey: process.env.REACT_APP_JELLYFIN_API_KEY,
    userId: process.env.REACT_APP_JELLYFIN_USER_ID
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <MediaServerDashboard 
          serverType="plex" 
          config={plexConfig} 
        />
        <MediaServerDashboard 
          serverType="jellyfin" 
          config={jellyfinConfig} 
        />
      </div>
    </div>
  );
}

export default App;
```

### Multi-Server Setup

```jsx
// src/components/MediaServerGrid.jsx
import React from 'react';
import MediaServerDashboard from './MediaServerDashboard';

const MediaServerGrid = () => {
  const servers = [
    {
      name: 'Main Plex Server',
      type: 'plex',
      config: {
        baseURL: 'http://192.168.1.100:32400',
        token: process.env.REACT_APP_PLEX_TOKEN_MAIN
      }
    },
    {
      name: 'Jellyfin Movies',
      type: 'jellyfin',
      config: {
        baseURL: 'http://192.168.1.101:8096',
        apiKey: process.env.REACT_APP_JELLYFIN_API_KEY,
        userId: process.env.REACT_APP_JELLYFIN_USER_ID
      }
    }
  ];

  return (
    <div className="space-y-8">
      {servers.map((server, index) => (
        <div key={index}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{server.name}</h2>
          <MediaServerDashboard 
            serverType={server.type}
            config={server.config}
          />
        </div>
      ))}
    </div>
  );
};

export default MediaServerGrid;
```

## 🔧 Advanced Features

### Stream Quality Monitoring

```javascript
// src/services/StreamAnalytics.js
class StreamAnalytics {
  constructor(mediaAPI) {
    this.api = mediaAPI;
    this.metrics = [];
  }

  async collectMetrics() {
    const sessions = await this.api.getActiveSessions();
    const timestamp = new Date();
    
    const currentMetrics = {
      timestamp,
      totalSessions: sessions.length,
      activeStreams: sessions.filter(s => s.state === 'playing').length,
      transcodingSessions: sessions.filter(s => s.transcoding).length,
      totalBandwidth: sessions.reduce((sum, s) => sum + (s.bandwidth || 0), 0),
      qualityDistribution: this.analyzeQuality(sessions),
      deviceTypes: this.analyzeDevices(sessions)
    };

    this.metrics.push(currentMetrics);
    
    // Keep only last 24 hours of metrics
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    return currentMetrics;
  }

  analyzeQuality(sessions) {
    const qualities = {};
    sessions.forEach(session => {
      if (session.transcoding) {
        const quality = `${session.transcoding.width || 'Unknown'}x${session.transcoding.height || 'Unknown'}`;
        qualities[quality] = (qualities[quality] || 0) + 1;
      }
    });
    return qualities;
  }

  analyzeDevices(sessions) {
    const devices = {};
    sessions.forEach(session => {
      const device = session.device || session.platform || 'Unknown';
      devices[device] = (devices[device] || 0) + 1;
    });
    return devices;
  }

  getMetricsSummary(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) return null;

    return {
      averageSessions: recentMetrics.reduce((sum, m) => sum + m.totalSessions, 0) / recentMetrics.length,
      peakSessions: Math.max(...recentMetrics.map(m => m.totalSessions)),
      totalTranscodingTime: recentMetrics.reduce((sum, m) => sum + m.transcodingSessions, 0),
      averageBandwidth: recentMetrics.reduce((sum, m) => sum + m.totalBandwidth, 0) / recentMetrics.length,
      peakBandwidth: Math.max(...recentMetrics.map(m => m.totalBandwidth))
    };
  }
}

export default StreamAnalytics;
```

## 🛡️ Security Considerations

### API Security
- **Token Management**: Store API tokens securely using environment variables
- **HTTPS Only**: Always use HTTPS for production deployments
- **Rate Limiting**: Implement client-side rate limiting to prevent API abuse
- **Network Security**: Restrict API access to trusted networks only

### Access Control
- **User Permissions**: Respect media server user permissions and sharing settings
- **Read-Only Access**: Dashboard should only read data, never modify server settings
- **Session Isolation**: Don't expose sensitive session information to unauthorized users

## 🔍 Troubleshooting

### Common Issues

#### Connection Errors
```javascript
// Handle network connectivity issues
const handleConnectionError = (error) => {
  if (error.message.includes('ECONNREFUSED')) {
    return 'Media server is not accessible. Check if the server is running and network settings.';
  } else if (error.message.includes('401')) {
    return 'Authentication failed. Check your API token/key.';
  } else if (error.message.includes('timeout')) {
    return 'Request timed out. Server may be overloaded or network is slow.';
  }
  return 'Unknown connection error occurred.';
};
```

#### API Rate Limits
```javascript
// Implement exponential backoff for rate limiting
class RateLimitHandler {
  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
    this.retryDelay = 1000; // Start with 1 second
  }

  async makeRequestWithBackoff(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.message.includes('429') && attempt <= this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithBackoff(requestFn, attempt + 1);
      }
      throw error;
    }
  }
}
```

### Performance Optimization
- **Caching**: Implement intelligent caching for library statistics
- **Lazy Loading**: Load recently added content on demand
- **Polling Intervals**: Adjust refresh rates based on content type
- **Error Recovery**: Implement graceful degradation when services are unavailable

## 📈 Monitoring and Alerts

### Performance Metrics
- **Response Times**: Track API response times and alert on degradation
- **Error Rates**: Monitor failed requests and connection issues
- **Bandwidth Usage**: Track streaming bandwidth and alert on excessive usage
- **Transcoding Load**: Monitor server CPU usage during transcoding

### Health Checks
```javascript
// src/services/HealthCheck.js
class MediaServerHealthCheck {
  constructor(apis) {
    this.apis = apis; // Array of media server APIs
  }

  async checkAllServers() {
    const results = await Promise.allSettled(
      this.apis.map(async (api) => {
        const start = Date.now();
        try {
          await api.getServerInfo();
          return {
            server: api.constructor.name,
            status: 'healthy',
            responseTime: Date.now() - start
          };
        } catch (error) {
          return {
            server: api.constructor.name,
            status: 'unhealthy',
            error: error.message,
            responseTime: Date.now() - start
          };
        }
      })
    );

    return results.map(result => result.value);
  }
}
```

This comprehensive media server integration provides everything needed to monitor and manage Plex, Jellyfin, and Emby servers from your homelab dashboard, with real-time streaming monitoring, library statistics, and user activity tracking.
