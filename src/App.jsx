import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { HomelabProvider } from './context/HomelabContext';
import { ChatProvider } from './context/ChatContext';
import LoadingScreen from './components/ui/LoadingScreen';
import { TaskDashboard } from './components/dashboard/TaskDashboard';
import { NotesView } from './components/notes/NotesView';
import { ChartView } from './components/dashboard/views/ChartView';
import { ResearchNotebookView } from './components/research/ResearchNotebookView';
import { MobileEntryView } from './components/research/MobileEntryView';
import { BookView } from './components/research/BookView';
import { ProgressHub } from './components/progress/ProgressHub';
import { AlarmView } from './components/alarm/AlarmView';
import { ChatPage } from './components/chat/ChatPage';
// Home Lab Components
import { NetworkMonitor } from './components/homelab/NetworkMonitor';
import { ServerManager } from './components/homelab/ServerManager';
import { DockerManager } from './components/homelab/DockerManager';
import { PiHoleManager } from './components/homelab/PiHoleManager';
import { StorageManager } from './components/homelab/StorageManager';
import { SystemMetrics } from './components/homelab/SystemMetrics';
import { LogViewer } from './components/homelab/LogViewer';
import { AlertManager } from './components/homelab/AlertManager';
import { UptimeMonitor } from './components/homelab/UptimeMonitor';
import { SmartDeviceController } from './components/homelab/SmartDeviceController';
import { MediaServer } from './components/homelab/MediaServer';
import { FileServerManager } from './components/homelab/FileServerManager';
import { VPNManager } from './components/homelab/VPNManager';
import { SensorMonitor } from './components/homelab/SensorMonitor';
import { AutomationRules } from './components/homelab/AutomationRules';
import { EnergyMonitor } from './components/homelab/EnergyMonitor';
import { SecurityCameras } from './components/homelab/SecurityCameras';
import { AccessLogViewer } from './components/homelab/AccessLogViewer';
import FirewallManager from './components/homelab/FirewallManager';
import IntrusionDetection from './components/homelab/IntrusionDetection';
import HomeLabDashboard from './components/homelab/HomeLabDashboard';
import CentralDashboard from './components/dashboard/CentralDashboard';
import CentralCommand from './components/dashboard/CentralCommand';
import VisualizationHub from './components/homelab/views/VisualizationHub';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted');
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TaskProvider>
      <ChatProvider>
        <HomelabProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Central Dashboard - Main Management Hub */}
                <Route path="/" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading Central Command...</div></div>}>
                    <CentralCommand />
                  </Suspense>
                } />
                <Route path="/homelab" element={<HomeLabDashboard />} />
                <Route path="/central" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading Central Command...</div></div>}>
                    <CentralCommand />
                  </Suspense>
                } />
                <Route path="/old-dashboard" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading Old Dashboard...</div></div>}>
                    <CentralDashboard />
                  </Suspense>
                } />
                
                {/* Productivity & Management Tools */}
                <Route path="/tasks" element={<TaskDashboard />} />
                <Route path="/notes" element={<NotesView />} />
                <Route path="/chart" element={<ChartView />} />
                <Route path="/progress-hub" element={<ProgressHub />} />
                <Route path="/alarm" element={<AlarmView />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/research" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResearchNotebookView />
                  </Suspense>
                } />
                <Route path="/mobile-entry/:sessionId" element={<MobileEntryView />} />
                <Route path="/research/book/:bookId" element={<BookView />} />
                
                {/* Home Lab Infrastructure Routes */}
                <Route path="/network" element={<NetworkMonitor />} />
                <Route path="/servers" element={<ServerManager />} />
                <Route path="/docker" element={<DockerManager />} />
                <Route path="/pihole" element={<PiHoleManager />} />
                <Route path="/storage" element={<StorageManager />} />
                <Route path="/metrics" element={<SystemMetrics />} />
                <Route path="/logs" element={<LogViewer />} />
                <Route path="/alerts" element={<AlertManager />} />
                <Route path="/uptime" element={<UptimeMonitor />} />
                <Route path="/smart-home" element={<SmartDeviceController />} />
                <Route path="/media" element={<MediaServer />} />
                <Route path="/files" element={<FileServerManager />} />
                <Route path="/vpn" element={<VPNManager />} />
                <Route path="/sensors" element={<SensorMonitor />} />
                <Route path="/automation" element={<AutomationRules />} />
                <Route path="/energy" element={<EnergyMonitor />} />
                <Route path="/cameras" element={<SecurityCameras />} />
                <Route path="/access" element={<AccessLogViewer />} />
                <Route path="/firewall" element={<FirewallManager />} />
                <Route path="/ids" element={<IntrusionDetection />} />
                
                {/* Visualization Hub - Unified Charts, Graphs, and Flow Views */}
                <Route path="/homelab/visualizations" element={<VisualizationHub />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </BrowserRouter>
        </HomelabProvider>
      </ChatProvider>
    </TaskProvider>
  );
}

export default App;