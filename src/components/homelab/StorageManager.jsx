import React, { useState, useEffect } from 'react';
import { ArrowLeft, HardDrive, Folder, FolderOpen, File, MoreVertical, Trash2, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const StorageManager = () => {
  const navigate = useNavigate();
  const [storageData, setStorageData] = useState({
    drives: [
      { 
        name: 'System Drive', 
        path: '/dev/sda1', 
        total: '500GB', 
        used: '320GB', 
        free: '180GB', 
        usage: 64,
        type: 'SSD',
        status: 'healthy'
      },
      { 
        name: 'Data Drive', 
        path: '/dev/sdb1', 
        total: '2TB', 
        used: '1.2TB', 
        free: '800GB', 
        usage: 60,
        type: 'HDD',
        status: 'healthy'
      },
      { 
        name: 'Backup Drive', 
        path: '/dev/sdc1', 
        total: '4TB', 
        used: '3.5TB', 
        free: '500GB', 
        usage: 87,
        type: 'HDD',
        status: 'warning'
      }
    ],
    recentFiles: [
      { name: 'backup_2024_01_15.tar.gz', size: '2.3GB', modified: '2 hours ago', type: 'archive' },
      { name: 'system_logs.txt', size: '45MB', modified: '1 day ago', type: 'text' },
      { name: 'media_collection', size: '450GB', modified: '3 days ago', type: 'folder' },
      { name: 'docker_volumes', size: '12GB', modified: '1 week ago', type: 'folder' }
    ]
  });

  const getUsageColor = (usage) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4 text-blue-500" />;
      case 'archive':
        return <File className="w-4 h-4 text-purple-500" />;
      case 'text':
        return <File className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
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
              <HardDrive className="w-6 h-6 text-blue-500" />
              Storage Manager
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <FolderOpen className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {storageData.drives.map((drive, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{drive.name}</h3>
                    <p className="text-sm text-muted-foreground">{drive.path}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(drive.status)}`}>
                  {drive.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Used: {drive.used}</span>
                  <span>Free: {drive.free}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(drive.usage)}`}
                    style={{ width: `${drive.usage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{drive.type}</span>
                  <span>{drive.usage}% used</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* File Browser */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Files & Folders</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-accent/10 rounded-md">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {storageData.recentFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-accent/5 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.size} • Modified {file.modified}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent/10 rounded-md" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-accent/10 rounded-md text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Storage Analytics */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Storage Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">6.5TB</div>
              <div className="text-sm text-muted-foreground">Total Capacity</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-green-500">5.02TB</div>
              <div className="text-sm text-muted-foreground">Used Space</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">1.48TB</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">77%</div>
              <div className="text-sm text-muted-foreground">Usage Rate</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
