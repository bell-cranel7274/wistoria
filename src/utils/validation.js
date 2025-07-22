export const validateTask = (task) => {
  return task && 
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.createdAt === 'string';
};

export const validateTasks = (tasks) => {
  return Array.isArray(tasks) && tasks.every(validateTask);
}; 