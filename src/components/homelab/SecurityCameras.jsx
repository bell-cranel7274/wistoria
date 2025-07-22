import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const SecurityCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setCameras([
        {
          id: 1,
          name: 'Front Door',
          location: 'Main Entrance',
          status: 'online',
          recording: true,
          resolution: '1080p',
          fps: 30,
          nightVision: true,
          motionDetection: true,
          audioRecording: true,
          storageUsed: '45.2GB',
          lastMotion: '2024-01-15 14:30',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZyb250IERvb3I8L3RleHQ+PC9zdmc+'
        },
        {
          id: 2,
          name: 'Backyard',
          location: 'Garden Area',
          status: 'online',
          recording: true,
          resolution: '4K',
          fps: 25,
          nightVision: true,
          motionDetection: true,
          audioRecording: false,
          storageUsed: '78.9GB',
          lastMotion: '2024-01-15 14:25',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzIyNTUyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhY2t5YXJkPC90ZXh0Pjwvc3ZnPg=='
        },
        {
          id: 3,
          name: 'Garage',
          location: 'Vehicle Bay',
          status: 'online',
          recording: false,
          resolution: '720p',
          fps: 15,
          nightVision: false,
          motionDetection: true,
          audioRecording: false,
          storageUsed: '12.3GB',
          lastMotion: '2024-01-15 12:45',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzU1NTU1NSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhcmFnZTwvdGV4dD48L3N2Zz4='
        },
        {
          id: 4,
          name: 'Driveway',
          location: 'Vehicle Entrance',
          status: 'online',
          recording: true,
          resolution: '1080p',
          fps: 30,
          nightVision: true,
          motionDetection: true,
          audioRecording: true,
          storageUsed: '67.1GB',
          lastMotion: '2024-01-15 14:10',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzQ0NDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyaXZld2F5PC90ZXh0Pjwvc3ZnPg=='
        },
        {
          id: 5,
          name: 'Side Gate',
          location: 'Property Perimeter',
          status: 'offline',
          recording: false,
          resolution: '720p',
          fps: 15,
          nightVision: true,
          motionDetection: true,
          audioRecording: false,
          storageUsed: '5.8GB',
          lastMotion: '2024-01-14 16:20',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzY2NjY2NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9mZmxpbmU8L3RleHQ+PC9zdmc+'
        },
        {
          id: 6,
          name: 'Living Room',
          location: 'Interior Monitor',
          status: 'online',
          recording: false,
          resolution: '1080p',
          fps: 20,
          nightVision: false,
          motionDetection: false,
          audioRecording: true,
          storageUsed: '8.4GB',
          lastMotion: 'N/A',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzc3NTUzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmluZyBSb29tPC90ZXh0Pjwvc3ZnPg=='
        }
      ]);

      setRecordings([
        {
          id: 1,
          camera: 'Front Door',
          timestamp: '2024-01-15 14:30',
          duration: '00:02:45',
          type: 'motion',
          size: '125MB',
          thumbnail: 'Motion detected at front entrance'
        },
        {
          id: 2,
          camera: 'Backyard',
          timestamp: '2024-01-15 14:25',
          duration: '00:01:30',
          type: 'motion',
          size: '89MB',
          thumbnail: 'Animal movement in garden'
        },
        {
          id: 3,
          camera: 'Driveway',
          timestamp: '2024-01-15 14:10',
          duration: '00:03:20',
          type: 'motion',
          size: '178MB',
          thumbnail: 'Vehicle arrival'
        },
        {
          id: 4,
          camera: 'Front Door',
          timestamp: '2024-01-15 13:45',
          duration: '00:05:15',
          type: 'scheduled',
          size: '245MB',
          thumbnail: 'Scheduled recording'
        }
      ]);

      setAlerts([
        {
          id: 1,
          camera: 'Side Gate',
          type: 'offline',
          message: 'Camera offline for 22 hours',
          timestamp: '2024-01-14 16:30',
          severity: 'critical'
        },
        {
          id: 2,
          camera: 'Front Door',
          type: 'motion',
          message: 'Unexpected motion detected',
          timestamp: '2024-01-15 14:30',
          severity: 'warning'
        },
        {
          id: 3,
          camera: 'Backyard',
          type: 'storage',
          message: 'Storage 85% full',
          timestamp: '2024-01-15 12:00',
          severity: 'info'
        }
      ]);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setCameras(prev => prev.map(camera => ({
        ...camera,
        storageUsed: camera.status === 'online' && camera.recording 
          ? `${(parseFloat(camera.storageUsed) + Math.random() * 0.1).toFixed(1)}GB`
          : camera.storageUsed
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const toggleRecording = (cameraId) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId 
        ? { ...camera, recording: !camera.recording }
        : camera
    ));
  };

  const toggleMotionDetection = (cameraId) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId 
        ? { ...camera, motionDetection: !camera.motionDetection }
        : camera
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading security camera data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Security Cameras</h1>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
              >
                List
              </button>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Add Camera
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Cameras</h3>
            <p className="text-3xl font-bold text-blue-400">{cameras.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Online</h3>
            <p className="text-3xl font-bold text-green-400">
              {cameras.filter(c => c.status === 'online').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recording</h3>
            <p className="text-3xl font-bold text-red-400">
              {cameras.filter(c => c.recording).length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Storage Used</h3>
            <p className="text-3xl font-bold text-purple-400">217GB</p>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Security Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)} text-gray-900`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{alert.camera}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-600">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Camera Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cameras.map((camera) => (
                  <div key={camera.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={camera.thumbnail}
                        alt={camera.name}
                        className="w-full h-full object-cover"
                      />
                      {camera.recording && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                          ● REC
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{camera.name}</h3>
                        <p className="text-sm text-gray-400">{camera.location}</p>
                      </div>
                      <div className={`text-sm ${getStatusColor(camera.status)}`}>
                        ● {camera.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Resolution:</span>
                        <span className="ml-2">{camera.resolution}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">FPS:</span>
                        <span className="ml-2">{camera.fps}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Storage:</span>
                        <span className="ml-2">{camera.storageUsed}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Motion:</span>
                        <span className="ml-2 text-xs">{camera.lastMotion}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-4 text-sm">
                        {camera.nightVision && <span title="Night Vision">🌙</span>}
                        {camera.audioRecording && <span title="Audio Recording">🎤</span>}
                        {camera.motionDetection && <span title="Motion Detection">🏃</span>}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleRecording(camera.id)}
                        className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                          camera.recording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {camera.recording ? 'Stop' : 'Record'}
                      </button>
                      <button
                        onClick={() => setSelectedCamera(camera)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleMotionDetection(camera.id)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                        title="Toggle Motion Detection"
                      >
                        🏃
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Camera List</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Camera</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Resolution</th>
                        <th className="text-left py-2">Recording</th>
                        <th className="text-left py-2">Storage</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cameras.map((camera) => (
                        <tr key={camera.id} className="border-b border-gray-700">
                          <td className="py-2">
                            <div>
                              <div className="font-semibold">{camera.name}</div>
                              <div className="text-gray-400 text-xs">{camera.location}</div>
                            </div>
                          </td>
                          <td className="py-2">
                            <span className={getStatusColor(camera.status)}>
                              ● {camera.status}
                            </span>
                          </td>
                          <td className="py-2">{camera.resolution} @ {camera.fps}fps</td>
                          <td className="py-2">
                            <span className={camera.recording ? 'text-red-400' : 'text-gray-400'}>
                              {camera.recording ? '● Recording' : '○ Stopped'}
                            </span>
                          </td>
                          <td className="py-2">{camera.storageUsed}</td>
                          <td className="py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleRecording(camera.id)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                              >
                                {camera.recording ? 'Stop' : 'Record'}
                              </button>
                              <button
                                onClick={() => setSelectedCamera(camera)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Recent Recordings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Recordings</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recordings.map((recording) => (
                <div key={recording.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{recording.camera}</h3>
                      <p className="text-sm text-gray-400">{recording.timestamp}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      recording.type === 'motion' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {recording.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{recording.thumbnail}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                    <span>Duration: {recording.duration}</span>
                    <span>Size: {recording.size}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                      Play
                    </button>
                    <button className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
