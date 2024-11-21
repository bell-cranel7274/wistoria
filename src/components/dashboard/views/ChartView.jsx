import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useTaskContext } from '../../../context/TaskContext';
import { TaskStatus, TaskPriority } from '../../../types/task';
import { CATEGORIES } from '../../../utils/constants';
import { GripHorizontal, Info, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export const ChartView = () => {
  const { tasks } = useTaskContext();
  const [chartOrder, setChartOrder] = useState(['status', 'priority', 'category', 'progress']);

  // Calculate summary statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  const completionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
  const averageProgress = totalTasks 
    ? (tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks).toFixed(1)
    : 0;

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(chartOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setChartOrder(items);
  };

  const statusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      label: 'Tasks by Status',
      data: [
        tasks.filter(task => task.status === TaskStatus.PENDING).length,
        tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
        tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
      ],
      backgroundColor: [
        'rgba(255, 206, 86, 0.7)',  // Pending - Yellow
        'rgba(54, 162, 235, 0.7)',   // In Progress - Blue
        'rgba(75, 192, 192, 0.7)',   // Completed - Green
      ],
      borderColor: [
        'rgb(255, 206, 86)',
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)',
      ],
      borderWidth: 1,
    }],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Tasks by Priority',
      data: [
        tasks.filter(task => task.priority === TaskPriority.LOW).length,
        tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
        tasks.filter(task => task.priority === TaskPriority.HIGH).length,
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',  // Low - Green
        'rgba(255, 206, 86, 0.7)',   // Medium - Yellow
        'rgba(255, 99, 132, 0.7)',   // High - Red
      ],
      borderColor: [
        'rgb(75, 192, 192)',
        'rgb(255, 206, 86)',
        'rgb(255, 99, 132)',
      ],
      borderWidth: 1,
    }],
  };

  const categoryData = {
    labels: CATEGORIES,
    datasets: [{
      label: 'Tasks by Category',
      data: CATEGORIES.map(category =>
        tasks.filter(task => task.category === category).length
      ),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    }],
  };

  const progressRanges = ['0-25%', '26-50%', '51-75%', '76-100%'];
  const progressData = {
    labels: progressRanges,
    datasets: [{
      label: 'Tasks by Progress',
      data: [
        tasks.filter(task => task.progress <= 25).length,
        tasks.filter(task => task.progress > 25 && task.progress <= 50).length,
        tasks.filter(task => task.progress > 50 && task.progress <= 75).length,
        tasks.filter(task => task.progress > 75).length,
      ],
      backgroundColor: 'rgba(153, 102, 255, 0.7)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          padding: 8,
          font: {
            size: 10
          },
          color: 'rgb(156 163 175)'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 10
          },
          color: 'rgb(156 163 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          },
          color: 'rgb(156 163 175)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const getChartComponent = (chartType) => {
    switch (chartType) {
      case 'status':
        return (
          <div className="bg-card p-3 rounded-lg shadow h-[250px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Status Distribution</h3>
              <div className="absolute top-3 right-3 cursor-move text-muted-foreground hover:text-foreground">
                <GripHorizontal className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col h-[calc(100%-2rem)]">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-3 pl-2 w-48">
                  <div>
                    <div className="text-xs text-muted-foreground">Pending Tasks</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>{tasks.filter(task => task.status === TaskStatus.PENDING).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.status === TaskStatus.PENDING).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      <span>{tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{tasks.filter(task => task.status === TaskStatus.COMPLETED).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.status === TaskStatus.COMPLETED).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[150px] h-[150px]">
                    <Pie data={statusData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'priority':
        return (
          <div className="bg-card p-3 rounded-lg shadow h-[250px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Priority Distribution</h3>
              <div className="absolute top-3 right-3 cursor-move text-muted-foreground hover:text-foreground">
                <GripHorizontal className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col h-[calc(100%-2rem)]">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-3 pl-2 w-48">
                  <div>
                    <div className="text-xs text-muted-foreground">High Priority</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span>{tasks.filter(task => task.priority === TaskPriority.HIGH).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.priority === TaskPriority.HIGH).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Medium Priority</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500" />
                      <span>{tasks.filter(task => task.priority === TaskPriority.MEDIUM).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.priority === TaskPriority.MEDIUM).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Low Priority</div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span>{tasks.filter(task => task.priority === TaskPriority.LOW).length}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((tasks.filter(task => task.priority === TaskPriority.LOW).length / tasks.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[150px] h-[150px]">
                    <Pie data={priorityData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'category':
        return (
          <div className="bg-card p-3 rounded-lg shadow flex gap-4 h-[250px]">
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Category Distribution</h3>
                <div className="absolute top-3 right-3 cursor-move text-muted-foreground hover:text-foreground">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              </div>
              <div className="h-[200px]">
                <Bar options={{
                  ...barOptions,
                  maintainAspectRatio: false,
                  scales: {
                    ...barOptions.scales,
                    x: {
                      ...barOptions.scales.x,
                      ticks: {
                        ...barOptions.scales.x.ticks,
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0
                      }
                    }
                  }
                }} data={categoryData} />
              </div>
            </div>
            <div className="w-48 border-l border-border pl-4">
              <div className="h-[200px] overflow-y-auto scrollbar-hide pr-2">
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground capitalize">{category}</div>
                      <div className="text-sm font-semibold">
                        {tasks.filter(task => task.category === category).length} tasks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="bg-card p-3 rounded-lg shadow flex gap-4 h-[250px]">
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Progress Distribution</h3>
                <div className="absolute top-3 right-3 cursor-move text-muted-foreground hover:text-foreground">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              </div>
              <div className="h-[200px]">
                <Bar options={barOptions} data={progressData} />
              </div>
            </div>
            <div className="w-48 border-l border-border pl-4">
              <div className="h-[200px] overflow-y-auto scrollbar-hide pr-2">
                <div className="space-y-2">
                  {progressRanges.map((range, index) => (
                    <div key={range} className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">{range}</div>
                      <div className="text-sm font-semibold">
                        {progressData.datasets[0].data[index]} tasks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Add new data for task distribution over time
  const taskDistributionData = {
    labels: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'],
    datasets: [{
      label: 'Completed Tasks',
      data: [
        tasks.filter(task => 
          task.status === TaskStatus.COMPLETED && 
          new Date(task.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        tasks.filter(task => 
          task.status === TaskStatus.COMPLETED && 
          new Date(task.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        tasks.filter(task => 
          task.status === TaskStatus.COMPLETED && 
          new Date(task.updatedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        ).length,
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgb(75, 192, 192)',
    }]
  };

  // Define data for the line graph
  const lineGraphData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Task Completion Over Time',
        data: [65, 59, 80, 81, 56, 55, 40], // Example data, replace with actual data
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const lineGraphOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156 163 175)'
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(156 163 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  // Add this function to calculate tasks completed each day for the past week
  const getTasksCompletedByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const tasksByDay = Array(7).fill(0);

    tasks.forEach(task => {
      if (task.status === TaskStatus.COMPLETED) {
        const taskDate = new Date(task.updatedAt);
        const dayDifference = (today - taskDate) / (1000 * 60 * 60 * 24);
        if (dayDifference < 7) {
          const dayIndex = taskDate.getDay();
          tasksByDay[dayIndex]++;
        }
      }
    });

    return days.map((day, index) => ({ day, count: tasksByDay[index] }));
  };

  const tasksCompletedByDay = getTasksCompletedByDay();

  // Add this function to calculate average completion time
  const getAverageCompletionTime = () => {
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    if (completedTasks.length === 0) return 'N/A';

    const totalCompletionTime = completedTasks.reduce((total, task) => {
      const createdAt = new Date(task.createdAt);
      const completedAt = new Date(task.updatedAt);
      return total + (completedAt - createdAt);
    }, 0);

    const averageTime = totalCompletionTime / completedTasks.length;
    const days = Math.floor(averageTime / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const averageCompletionTime = getAverageCompletionTime();

  return (
    <div className="p-4 bg-background min-h-screen">
      <div className="flex gap-6">
        <div className="flex-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="charts">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 gap-4"
                >
                  {chartOrder.map((chartType, index) => (
                    <Draggable key={chartType} draggableId={chartType} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'opacity-70' : ''}`}
                        >
                          {getChartComponent(chartType)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Combined Line Graph and Task Distribution Card */}
          <div className="mt-4 grid grid-cols-1 gap-6">
            {/* Main Analytics Card */}
            <div className="bg-card p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold">Task Completion Analysis</h3>
                <div className="flex gap-4">
                  <div className="text-center">
                    <h4 className="text-sm text-muted-foreground">Average Time</h4>
                    <p className="text-base font-semibold">{averageCompletionTime}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm text-muted-foreground">Total Tasks</h4>
                    <p className="text-base font-semibold">{totalTasks}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm text-muted-foreground">Completion Rate</h4>
                    <p className="text-base font-semibold">{completionRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Line Graph */}
                <div className="h-[300px]">
                  <h4 className="text-sm font-medium mb-4">Completion Trend</h4>
                  <Line data={lineGraphData} options={{
                    ...lineGraphOptions,
                    maintainAspectRatio: false,
                  }} />
                </div>

                {/* Task Distribution */}
                <div className="h-[300px]">
                  <h4 className="text-sm font-medium mb-4">Task Distribution</h4>
                  <Bar data={taskDistributionData} options={{
                    ...barOptions,
                    maintainAspectRatio: false,
                  }} />
                </div>
              </div>

              {/* Task Status Summary - Adjusted spacing */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Completed</div>
                    <div className="text-xl font-bold mt-1 text-green-500">{completedTasks}</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Pending</div>
                    <div className="text-xl font-bold mt-1 text-yellow-500">{pendingTasks}</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">In Progress</div>
                    <div className="text-xl font-bold mt-1 text-blue-500">{inProgressTasks}</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">This Week</div>
                    <div className="text-xl font-bold mt-1">{tasks.filter(task => {
                      const taskDate = new Date(task.dueDate);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      return taskDate >= weekStart;
                    }).length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Analytics Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Incomplete Tasks Graph */}
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-base font-semibold mb-6">Incomplete Tasks Overview</h3>
                <div className="h-[250px]">
                  <Bar 
                    data={{
                      labels: ['Pending', 'In Progress'],
                      datasets: [{
                        label: 'Number of Tasks',
                        data: [pendingTasks, inProgressTasks],
                        backgroundColor: [
                          'rgba(255, 206, 86, 0.7)',
                          'rgba(54, 162, 235, 0.7)',
                        ],
                        borderColor: [
                          'rgb(255, 206, 86)',
                          'rgb(54, 162, 235)',
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Weekly Progress Overview */}
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-base font-semibold mb-6">Weekly Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Today's Tasks</div>
                      <div className="text-2xl font-bold">
                        {tasks.filter(task => 
                          new Date(task.dueDate).toDateString() === new Date().toDateString()
                        ).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Week's Tasks</div>
                      <div className="text-2xl font-bold">
                        {tasks.filter(task => {
                          const taskDate = new Date(task.dueDate);
                          const today = new Date();
                          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                          return taskDate >= weekStart;
                        }).length}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                      <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Progress</div>
                      <div className="text-2xl font-bold text-accent">{averageProgress}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="w-64 space-y-4">
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Summary
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Progress</div>
                <div className="text-2xl font-bold text-accent">{averageProgress}%</div>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Task Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-bold">{pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-bold">{inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-bold">{completedTasks}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {tasks.slice(-3).reverse().map(task => (
                <div key={task.id} className="text-sm">
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Breakdown by Day */}
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4">Tasks Completed by Day</h3>
            <div className="space-y-2">
              {tasksCompletedByDay.map(({ day, count }) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="text-sm">{day}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-2">
              {tasks
                .filter(task => new Date(task.dueDate) > new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="text-sm">
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Priorities */}
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4">Top Priorities</h3>
            <div className="space-y-2">
              {tasks
                .filter(task => task.priority === TaskPriority.HIGH)
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="text-sm">
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
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