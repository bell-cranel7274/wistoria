import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTaskContext } from '../../../context/TaskContext';
import { TaskStatus } from '../../../types/task';

export const KanbanView = ({ tasks, onTaskSelect }) => {
  const { updateTask } = useTaskContext();

  const columns = {
    [TaskStatus.PENDING]: {
      title: 'To Do',
      tasks: tasks.filter(task => task.status === TaskStatus.PENDING),
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />
    },
    [TaskStatus.IN_PROGRESS]: {
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
      icon: <Clock className="w-5 h-5 text-amber-500" />
    },
    [TaskStatus.COMPLETED]: {
      title: 'Completed',
      tasks: tasks.filter(task => task.status === TaskStatus.COMPLETED),
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const task = tasks.find(t => t.id.toString() === draggableId);

    if (task && source.droppableId !== destination.droppableId) {
      updateTask({
        ...task,
        status: destination.droppableId,
        progress: destination.droppableId === TaskStatus.COMPLETED ? 100 : 
                 destination.droppableId === TaskStatus.PENDING ? 0 : task.progress
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {Object.entries(columns).map(([status, { title, tasks: columnTasks, icon }]) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-card/50 rounded-lg p-4 min-h-[200px] border border-border
                  ${snapshot.isDraggingOver ? 'bg-accent/10' : ''}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {icon}
                  <h3 className="font-semibold text-foreground">
                    {title} ({columnTasks.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onTaskSelect(task)}
                          className={`p-3 bg-background rounded-md shadow-sm border border-border
                            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}
                            hover:bg-accent/5 cursor-pointer`}
                        >
                          <h4 className="font-medium text-foreground">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}; 