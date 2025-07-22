import React, { useState } from 'react';
import { 
  BarChart3, 
  GitBranch, 
  Activity, 
  TrendingUp,
  Database,
  Network,
  Eye,
  Settings
} from 'lucide-react';
import ChartsView from './ChartsView';
import GraphsView from './GraphsView';
import FlowView from './FlowView';

const VisualizationHub = () => {
  const [activeView, setActiveView] = useState('charts');

  const visualizationViews = [
    {
      id: 'charts',
      name: 'System Charts',
      description: 'Real-time metrics and performance analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      component: ChartsView
    },
    {
      id: 'graphs',
      name: 'Network Topology',
      description: 'Interactive network graphs and relationships',
      icon: <GitBranch className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      component: GraphsView
    },
    {
      id: 'flows',
      name: 'Process Flows',
      description: 'Workflow visualization and data pipelines',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-purple-500 to-violet-500',
      component: FlowView
    }
  ];

  const ActiveComponent = visualizationViews.find(view => view.id === activeView)?.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with View Selector */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Visualization Hub
              </h1>
              <p className="text-muted-foreground">
                Comprehensive data visualization and system analytics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Live Updates</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* View Navigation Tabs */}
          <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
            {visualizationViews.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-md font-medium transition-all duration-200 ${
                  activeView === view.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeView === view.id
                    ? `bg-gradient-to-r ${view.color} text-white`
                    : 'bg-muted/50'
                }`}>
                  {view.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{view.name}</div>
                  <div className="text-xs opacity-75">{view.description}</div>
                </div>
                {activeView === view.id && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Active</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Quick Stats Bar */}
          <div className="flex items-center justify-between mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-border/50">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">System Health: 98.5%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Active Services: 19/20</span>
              </div>
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Network Load: 45%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Active View Content */}
      <div className="px-6 pb-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default VisualizationHub;
