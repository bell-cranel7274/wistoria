import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { TaskStatus } from '../../../types/task';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../../utils/constants';

export const CalendarView = ({ tasks, onTaskSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="w-3 h-3 text-amber-500" />;
      case TaskStatus.IN_PROGRESS:
        return <AlertCircle className="w-3 h-3 text-sky-500" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getTaskColor = (task) => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500/10 hover:bg-emerald-500/20';
      case TaskStatus.IN_PROGRESS:
        return 'bg-sky-500/10 hover:bg-sky-500/20';
      default:
        return 'bg-amber-500/10 hover:bg-amber-500/20';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="h-32 bg-card/50 border border-border rounded-lg"
        />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const dayTasks = tasks.filter(task => task.dueDate === dateStr);
      const isToday = formatDate(new Date()) === dateStr;

      days.push(
        <div 
          key={day} 
          className={`h-32 bg-card/50 border ${isToday ? 'border-primary' : 'border-border'} rounded-lg p-2`}
        >
          <div className={`font-medium text-sm mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto h-[calc(100%-2rem)] scrollbar-hide">
            {dayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onTaskSelect(task)}
                className={`
                  text-xs p-1.5 rounded cursor-pointer
                  flex items-center gap-1.5
                  ${getTaskColor(task)}
                  transition-colors duration-200
                `}
              >
                {getStatusIcon(task.status)}
                <span className="truncate flex-1">{task.title}</span>
                {task.progress > 0 && (
                  <span className="text-[10px] opacity-75">{task.progress}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-4 bg-background rounded-lg border border-border">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-accent/10 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-accent/10 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-sm text-muted-foreground">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarView; 