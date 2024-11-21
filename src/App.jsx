import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { TaskDashboard } from './components/dashboard/TaskDashboard';
import { NotesView } from './components/notes/NotesView';
import { ChartView } from './components/dashboard/views/ChartView';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<TaskDashboard />} />
            <Route path="/notes" element={<NotesView />} />
            <Route path="/chart" element={<ChartView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App; 