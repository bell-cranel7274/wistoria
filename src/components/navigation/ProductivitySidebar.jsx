import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import {
  CheckSquare,
  List,
  Calendar,
  LayoutGrid,
  FileText,
  BookOpen,
  BarChart3,
  Clock,
  AlertTriangle,
  Plus,
  Target,
  TrendingUp,
  Filter,
  Search,
  ChevronRight,
  Star,
  Archive,
  Timer,
  Zap,
  Award,
  Activity,
  Users,
  Settings,
  PlusCircle,
  Edit3,
  Lightbulb,
  Coffee,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

export const ProductivitySidebar = ({ onAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tasks, notes, viewMode, addTask, addNote } = useTaskContext();
  const [expandedSections, setExpandedSections] = useState({
    'Task Management': true,
    'Productivity Tools': true,
    'Quick Actions': true
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const isActive = (path) => location.pathname === path;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  // Calculate real statistics with more detailed metrics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tasksToday = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });

    const completedToday = tasks.filter(task => {
      const updatedDate = new Date(task.updatedAt || task.createdAt);
      return updatedDate >= today && (task.completed || task.status === 'COMPLETED');
    });

    const completedYesterday = tasks.filter(task => {
      const updatedDate = new Date(task.updatedAt || task.createdAt);
      return updatedDate >= yesterday && updatedDate < today && (task.completed || task.status === 'COMPLETED');
    });

    const overdue = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < today && !task.completed && task.status !== 'COMPLETED';
    });

    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS');
    const highPriority = tasks.filter(task => task.priority === 'HIGH' && !task.completed);
    const upcomingWeek = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= today && dueDate <= weekFromNow && !task.completed;
    });

    const totalCompleted = tasks.filter(t => t.completed || t.status === 'COMPLETED').length;
    const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
    
    // Calculate productivity trend
    const yesterdayCompletionCount = completedYesterday.length;
    const todayCompletionCount = completedToday.length;
    const trend = todayCompletionCount > yesterdayCompletionCount ? 'up' : 
                 todayCompletionCount < yesterdayCompletionCount ? 'down' : 'same';

    return {
      tasksToday: tasksToday.length,
      completed: completedToday.length,
      completedYesterday: yesterdayCompletionCount,
      overdue: overdue.length,
      inProgress: inProgress.length,
      highPriority: highPriority.length,
      totalNotes: notes.length,
      totalTasks: tasks.length,
      completionRate,
      upcomingWeek: upcomingWeek.length,
      trend,
      productivity: completionRate >= 80 ? 'excellent' : completionRate >= 60 ? 'good' : completionRate >= 40 ? 'average' : 'needs-improvement'
    };
  }, [tasks, notes]);
  const menuItems = [
    {
      section: 'Task Management',
      items: [
        { 
          name: 'Dashboard', 
          path: '/tasks', 
          icon: <LayoutGrid className="w-4 h-4" />,
          description: 'Main task overview',
          badge: stats.totalTasks > 0 ? stats.totalTasks : null,
          quickAction: stats.overdue > 0 ? 'urgent' : null
        },
        { 
          name: 'Analytics', 
          path: '/chart', 
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Task analytics & insights',
          badge: stats.productivity === 'excellent' ? 'hot' : null
        },
        { 
          name: 'Calendar View', 
          path: '/tasks', 
          icon: <Calendar className="w-4 h-4" />,
          description: 'Schedule overview',
          badge: stats.upcomingWeek > 0 ? stats.upcomingWeek : null,
          action: () => {/* Could trigger calendar view mode */}
        }
      ]
    },
    {
      section: 'Productivity Tools',
      items: [
        { 
          name: 'Notes', 
          path: '/notes', 
          icon: <FileText className="w-4 h-4" />,
          description: 'Quick notes & ideas',
          badge: stats.totalNotes > 0 ? stats.totalNotes : null
        },
        { 
          name: 'Research Hub', 
          path: '/research', 
          icon: <BookOpen className="w-4 h-4" />,
          description: 'Research & documentation',
          badge: 'new'
        },
        { 
          name: 'Progress Hub', 
          path: '/progress-hub', 
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Track your progress',
          badge: stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : null
        },
        { 
          name: 'Focus Timer', 
          path: '/alarm', 
          icon: <Timer className="w-4 h-4" />,
          description: 'Pomodoro & time tracking',
          badge: null
        }
      ]
    },
    {
      section: 'Quick Actions',
      items: [
        { 
          name: 'New Task', 
          action: 'create-task',
          icon: <PlusCircle className="w-4 h-4" />,
          description: 'Create a new task',
          isAction: true,
          shortcut: 'Ctrl+N'
        },
        { 
          name: 'Quick Note', 
          action: 'create-note',
          icon: <Edit3 className="w-4 h-4" />,
          description: 'Jot down a quick note',
          isAction: true,
          shortcut: 'Ctrl+Shift+N'
        },
        { 
          name: 'Idea Capture', 
          action: 'capture-idea',
          icon: <Lightbulb className="w-4 h-4" />,
          description: 'Quick idea or inspiration',
          isAction: true
        }
      ]
    }
  ];
  const handleNavigation = (item) => {
    if (item.isAction) {
      // Handle quick actions with actual functionality
      if (item.action === 'create-task') {
        navigate('/tasks');
        // Create a simple task with current time
        const quickTask = {
          id: Date.now().toString(),
          title: 'New Task',
          description: '',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completed: false,
          category: 'general'
        };
        setTimeout(() => {
          if (onAction) onAction('create-task', quickTask);
        }, 100);
      } else if (item.action === 'create-note') {
        navigate('/notes');
        // Create a quick note
        const quickNote = {
          title: 'Quick Note',
          content: '',
          type: 'general',
          tags: []
        };
        setTimeout(() => {
          if (onAction) onAction('create-note', quickNote);
        }, 100);
      } else if (item.action === 'capture-idea') {
        // Create an idea note
        const ideaNote = {
          title: 'Idea',
          content: '',
          type: 'idea',
          tags: ['idea', 'inspiration']
        };
        navigate('/notes');
        setTimeout(() => {
          if (onAction) onAction('create-note', ideaNote);
        }, 100);
      }
    } else if (item.path) {
      navigate(item.path);
    }
    
    if (onAction && !item.isAction) onAction('navigate', item);
  };

  return (    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        {/* Header with current time */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-card-foreground">Productivity Center</h2>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Your command center for tasks and notes</p>
          
          {/* Productivity Status Badge */}
          <div className="mt-3 flex items-center space-x-2">
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              stats.productivity === 'excellent' ? 'bg-accent/20 text-accent-foreground' :
              stats.productivity === 'good' ? 'bg-secondary/20 text-secondary-foreground' :
              stats.productivity === 'average' ? 'bg-warning/20 text-warning-foreground' :
              'bg-destructive/20 text-destructive-foreground'
            }`}>
              {stats.productivity === 'excellent' && <Award className="w-3 h-3 mr-1" />}
              {stats.productivity === 'good' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {stats.productivity === 'average' && <Activity className="w-3 h-3 mr-1" />}
              {stats.productivity === 'needs-improvement' && <Clock className="w-3 h-3 mr-1" />}
              {stats.productivity === 'excellent' ? 'Excellent' :
               stats.productivity === 'good' ? 'Good' :
               stats.productivity === 'average' ? 'Average' : 'Needs Focus'}
            </div>
            {stats.trend !== 'same' && (
              <div className={`flex items-center ${
                stats.trend === 'up' ? 'text-accent' : 'text-destructive'
              }`}>
                {stats.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>
          {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <button
              onClick={() => toggleSection(section.section)}
              className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
            >
              <div className="flex items-center">
                {section.section}
                {section.section === 'Quick Actions' && <Zap className="w-3 h-3 ml-1" />}
                {section.section === 'Task Management' && <Target className="w-3 h-3 ml-1" />}
                {section.section === 'Productivity Tools' && <Activity className="w-3 h-3 ml-1" />}
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${
                expandedSections[section.section] ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSections[section.section] && (
              <nav className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                        : item.isAction
                        ? 'text-foreground hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                    }`}
                    title={`${item.description}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`${isActive(item.path) ? 'text-primary' : item.isAction ? 'text-primary' : ''}`}>
                        {item.icon}
                      </div>
                      <div className="ml-3 text-left">
                        <div className="font-medium flex items-center">
                          {item.name}
                          {item.quickAction === 'urgent' && (
                            <AlertTriangle className="w-3 h-3 ml-1 text-destructive" />
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                            {item.description}
                            {item.shortcut && (
                              <span className="ml-2 opacity-60">({item.shortcut})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.badge === 'hot' ? 'bg-destructive/20 text-destructive animate-pulse' :
                          item.badge === 'new' ? 'bg-accent/20 text-accent' :
                          item.badge === '↑' ? 'bg-accent/20 text-accent' :
                          item.badge === '↓' ? 'bg-destructive/20 text-destructive' :
                          isActive(item.path) 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/30 text-muted-foreground'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {!item.isAction && (
                        <ChevronRight className={`w-3 h-3 transition-transform ${
                          isActive(item.path) ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                        }`} />
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            )}
          </div>
        ))}        {/* Enhanced Stats Card */}
        <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center">
              <Target className="w-4 h-4 mr-1 text-primary" />
              Today's Overview
            </h4>
            <div className={`text-xs px-2 py-1 rounded-full font-medium flex items-center ${
              stats.completionRate >= 80 ? 'bg-accent/20 text-accent-foreground' :
              stats.completionRate >= 50 ? 'bg-secondary/20 text-secondary-foreground' :
              'bg-warning/20 text-warning-foreground'
            }`}>
              {stats.completionRate >= 80 && <Award className="w-3 h-3 mr-1" />}
              {stats.completionRate}%
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Due Today:
              </span>
              <span className={`text-sm font-medium ${stats.tasksToday > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                {stats.tasksToday}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center">
                <CheckSquare className="w-3 h-3 mr-1" />
                Completed:
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-accent">
                  {stats.completed}
                </span>
                {stats.trend === 'up' && stats.completed > stats.completedYesterday && (
                  <ArrowUp className="w-3 h-3 text-accent" />
                )}
                {stats.trend === 'down' && stats.completed < stats.completedYesterday && (
                  <ArrowDown className="w-3 h-3 text-destructive" />
                )}
              </div>
            </div>
            
            {stats.inProgress > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  In Progress:
                </span>
                <span className="text-sm font-medium text-secondary">
                  {stats.inProgress}
                </span>
              </div>
            )}
            
            {stats.overdue > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-destructive flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue:
                </span>
                <span className="text-sm font-medium text-destructive">
                  {stats.overdue}
                </span>
              </div>
            )}
            
            {stats.highPriority > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  High Priority:
                </span>
                <span className="text-sm font-medium text-primary">
                  {stats.highPriority}
                </span>
              </div>
            )}
            
            {stats.upcomingWeek > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  This Week:
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {stats.upcomingWeek}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Notes:
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {stats.totalNotes}
              </span>
            </div>
          </div>

          {/* Enhanced Progress bar */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Daily Progress</span>
              <span className="flex items-center">
                {stats.completionRate}%
                {stats.trend === 'up' && <ArrowUp className="w-3 h-3 ml-1 text-accent" />}
                {stats.trend === 'down' && <ArrowDown className="w-3 h-3 ml-1 text-destructive" />}
              </span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  stats.completionRate >= 80 ? 'bg-accent' :
                  stats.completionRate >= 50 ? 'bg-secondary' :
                  'bg-warning'
                }`}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>        {/* Enhanced Motivational Section */}
        <div className="mt-4 space-y-3">
          {/* Daily Quote/Tip */}
          <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
            <div className="flex items-start space-x-2">
              <Coffee className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {stats.overdue > 0 
                    ? `⚠️ You have ${stats.overdue} overdue task${stats.overdue !== 1 ? 's' : ''}. Time to catch up and get back on track!`
                    : stats.tasksToday > 0
                    ? `🎯 ${stats.tasksToday} task${stats.tasksToday !== 1 ? 's' : ''} due today. You've got this! Break them down into smaller steps.`
                    : stats.completed > 0
                    ? stats.productivity === 'excellent'
                      ? "🏆 Outstanding work today! You're in the flow state. Keep the momentum going!"
                      : "✅ Great job on completing tasks today! Small wins lead to big victories."
                    : stats.totalTasks > 0
                    ? "🚀 Ready to tackle the day? Pick your most important task and start there."
                    : "💡 A clean slate! Perfect time to plan your goals and create your first task."
                  }
                </p>
                {stats.productivity === 'excellent' && (
                  <div className="mt-2 text-xs text-accent font-medium">
                    🔥 You're on fire! Productivity streak active
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Actions */}
          {(stats.overdue > 0 || stats.tasksToday > 0) && (
            <div className="flex space-x-2">
              {stats.overdue > 0 && (
                <button
                  onClick={() => navigate('/tasks?filter=overdue')}
                  className="flex-1 px-3 py-2 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center justify-center space-x-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Fix Overdue</span>
                </button>
              )}
              {stats.tasksToday > 0 && (
                <button
                  onClick={() => navigate('/tasks?filter=today')}
                  className="flex-1 px-3 py-2 bg-warning/10 text-warning-foreground text-xs rounded-md border border-warning/20 hover:bg-warning/20 transition-colors flex items-center justify-center space-x-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>Today's Tasks</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductivitySidebar;
