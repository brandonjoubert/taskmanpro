
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/interfaces/task';
import type { TaskFormData } from '@/components/task-form-schema';
import { calculateRiskValue, calculateImpactScore } from '@/lib/risk';
import { Quadrant, Frequency, impactScoreConfig, quadrantConfig } from '@/lib/constants';

// Helper to generate unique IDs
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Function to generate initial tasks with new structure
const generateInitialTasks = (): Task[] => {
    const tasksRaw = [
      { title: 'Review Q3 budget', description: 'Final check before submission', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Do, monetaryImpact: 15000, recurring: false },
      { title: 'Plan team offsite', description: 'Location, activities, budget', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Decide, monetaryImpact: 3000, recurring: false },
      { title: 'Submit weekly report', description: 'Sales data and team updates', dueDate: new Date(new Date().setHours(17,0,0,0)), quadrant: Quadrant.Delegate, monetaryImpact: 500, recurring: true, frequency: Frequency.Weekly, recurringUntil: null },
      { title: 'Clean up old project files', description: 'Low priority', dueDate: null, quadrant: Quadrant.Delete, monetaryImpact: 50, recurring: false },
      { title: 'Urgent client call', description: 'Address critical issue', dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), quadrant: Quadrant.Do, monetaryImpact: 8000, recurring: false },
      { title: 'Research new CRM tool', description: 'Explore options for sales team', dueDate: null, quadrant: Quadrant.Decide, monetaryImpact: 25000, recurring: false },
      { title: 'Order office snacks', description: 'Refill kitchen supplies', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Delegate, monetaryImpact: 80, recurring: false },
    ];

    return tasksRaw.map(taskData => ({
        id: generateId(),
        ...taskData,
        riskValue: calculateRiskValue(taskData.monetaryImpact, taskData.quadrant),
        isComplete: false,
        createdAt: new Date(),
        completedAt: null,
        frequency: taskData.frequency || null,
        recurringUntil: taskData.recurringUntil || null,
    }));
}


// Key for local storage
const LOCAL_STORAGE_KEY = 'riskQuadrantTasks';
const TASK_RETENTION_DAYS = 30; // Keep completed tasks for 30 days

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

   // Load tasks from local storage on initial mount
  useEffect(() => {
    setIsLoading(true);
    let loadedTasks: Task[] = [];
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        loadedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          recurringUntil: task.recurringUntil ? new Date(task.recurringUntil) : null,
          // Validate enums and types
          quadrant: Object.values(Quadrant).includes(task.quadrant) ? task.quadrant : Quadrant.Delete,
          monetaryImpact: typeof task.monetaryImpact === 'number' && isFinite(task.monetaryImpact) && task.monetaryImpact >= 0 ? task.monetaryImpact : 0,
          riskValue: typeof task.riskValue === 'number' && isFinite(task.riskValue) ? task.riskValue : calculateRiskValue(task.monetaryImpact ?? 0, task.quadrant ?? Quadrant.Delete), // Recalculate if invalid
          isComplete: !!task.isComplete,
          recurring: !!task.recurring,
          frequency: Object.values(Frequency).includes(task.frequency) ? task.frequency : null,
        }));
      } else {
         loadedTasks = generateInitialTasks();
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
       loadedTasks = generateInitialTasks(); // Fallback on error
    } finally {
       setAllTasks(loadedTasks);
       // Defer setting isLoading to false until after cleanup effect
    }
  }, []);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
      if (!isLoading) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTasks));
          } catch (error) {
            console.error("Failed to save tasks to local storage:", error);
          }
      }
  }, [allTasks, isLoading]);

  // Cleanup old completed tasks
   useEffect(() => {
     if (!isLoading && allTasks.length > 0) {
       const retentionDate = new Date();
       retentionDate.setDate(retentionDate.getDate() - TASK_RETENTION_DAYS);

       setAllTasks(currentTasks => {
         const filteredTasks = currentTasks.filter(task => {
           return !task.completedAt || task.completedAt > retentionDate;
         });

         if (filteredTasks.length < currentTasks.length) {
           console.log(`Removed ${currentTasks.length - filteredTasks.length} old completed tasks.`);
           return filteredTasks;
         }
         return currentTasks;
       });
     }
     // Ensure loading is false after potential cleanup
     if (!isLoading) setIsLoading(false); // Mark loading complete if not already
     else if (allTasks.length > 0) setIsLoading(false); // Mark loading complete if tasks loaded and cleanup ran

   }, [isLoading, allTasks.length]); // Depend on isLoading and task count


  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      ...formData,
      id: generateId(),
      riskValue: calculateRiskValue(formData.monetaryImpact, formData.quadrant), // Calculate risk value
      isComplete: false,
      createdAt: new Date(),
      completedAt: null,
      dueDate: formData.dueDate || null,
      recurring: formData.recurring ?? false,
      frequency: formData.recurring ? formData.frequency : null,
      recurringUntil: formData.recurring ? formData.recurringUntil : null,
    };
    setAllTasks((prevTasks) => [...prevTasks, newTask]);
  }, []);

  const updateTask = useCallback((formData: TaskFormData) => {
    if (!formData.id) {
        console.error("Update failed: Task ID missing.");
        return;
    }
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === formData.id
          ? {
              ...task, // Keep existing fields like createdAt, completedAt, isComplete
              ...formData, // Apply updated form data
              riskValue: calculateRiskValue(formData.monetaryImpact, formData.quadrant), // Recalculate risk value
              dueDate: formData.dueDate || null,
              recurring: formData.recurring ?? false,
              frequency: formData.recurring ? formData.frequency : null,
              recurringUntil: formData.recurring ? formData.recurringUntil : null,
            }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setAllTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setAllTasks((prevTasks) => {
        return prevTasks.map((task) => {
            if (task.id === id) {
                const isNowComplete = !task.isComplete;
                const completionDate = isNowComplete ? new Date() : null;

                const updatedTask = {
                    ...task,
                    isComplete: isNowComplete,
                    completedAt: completionDate
                };
                return updatedTask;
            }
            return task;
        });
    });
  }, []);

  // Filter tasks into incomplete and completed lists
  const incompleteTasks = allTasks
    .filter(task => !task.isComplete)
    .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));

  const completedTasks = allTasks
    .filter(task => task.isComplete)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));


  return {
    tasks: incompleteTasks,
    completedTasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}
