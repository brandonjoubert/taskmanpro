
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/interfaces/task';
import type { TaskFormData } from '@/components/task-form-schema';
import { calculateRiskLevel } from '@/lib/risk';
import { Quadrant, Likelihood, Impact, RiskLevel, Frequency } from '@/lib/constants'; // Import Frequency

// Helper to generate unique IDs (replace with a more robust solution like uuid if needed)
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Initial dummy data for demonstration - including recurring example
const initialTasks: Task[] = [
  { id: generateId(), title: 'Review Q3 budget', description: 'Final check before submission', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.High, riskLevel: RiskLevel.Critical, isComplete: false, createdAt: new Date(), completedAt: null, recurring: false },
  { id: generateId(), title: 'Plan team offsite', description: 'Location, activities, budget', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Decide, likelihood: Likelihood.Medium, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date(), completedAt: null, recurring: false },
  { id: generateId(), title: 'Submit weekly report', description: 'Sales data and team updates', dueDate: new Date(new Date().setHours(17,0,0,0)), quadrant: Quadrant.Delegate, likelihood: Likelihood.Low, impact: Impact.Medium, riskLevel: RiskLevel.Medium, isComplete: false, createdAt: new Date(), completedAt: null, recurring: true, frequency: Frequency.Weekly, recurringUntil: null }, // Recurring task example
  { id: generateId(), title: 'Clean up old project files', description: 'Low priority', dueDate: null, quadrant: Quadrant.Delete, likelihood: Likelihood.Low, impact: Impact.Low, riskLevel: RiskLevel.Low, isComplete: false, createdAt: new Date(), completedAt: null, recurring: false },
    { id: generateId(), title: 'Urgent client call', description: 'Address critical issue', dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date(), completedAt: null, recurring: false },
];

// Key for local storage
const LOCAL_STORAGE_KEY = 'riskQuadrantTasks';
const TASK_RETENTION_DAYS = 30; // Keep completed tasks for 30 days

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State for initial loading

   // Load tasks from local storage on initial mount (client-side only)
  useEffect(() => {
    setIsLoading(true); // Start loading
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          // Ensure dates are Date objects
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null, // Parse completedAt
          recurringUntil: task.recurringUntil ? new Date(task.recurringUntil) : null,
          frequency: Object.values(Frequency).includes(task.frequency) ? task.frequency : null,
          recurring: !!task.recurring,
          isComplete: !!task.isComplete, // Ensure boolean
        }));
        setAllTasks(parsedTasks);
      } else {
         setAllTasks(initialTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
       setAllTasks(initialTasks); // Fallback to initial data on error
    } finally {
        // Defer setting isLoading to false to allow cleanup effect to run
        // setIsLoading(false); // Moved to cleanup effect
    }
  }, []);

  // Save tasks to local storage whenever tasks change (client-side only)
  useEffect(() => {
      // Avoid saving during initial load before tasks are set or after cleanup
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
     if (allTasks.length > 0) { // Only run if tasks have been loaded
       const retentionDate = new Date();
       retentionDate.setDate(retentionDate.getDate() - TASK_RETENTION_DAYS);

       setAllTasks(currentTasks => {
         const filteredTasks = currentTasks.filter(task => {
           // Keep tasks that are NOT complete OR were completed within the retention period
           return !task.completedAt || task.completedAt > retentionDate;
         });

         if (filteredTasks.length < currentTasks.length) {
           console.log(`Removed ${currentTasks.length - filteredTasks.length} old completed tasks.`);
           return filteredTasks;
         }
         return currentTasks; // No changes
       });
        setIsLoading(false); // Mark loading as complete after cleanup
     } else if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        // Handle case where initialTasks is empty or local storage was empty
        setIsLoading(false);
     }
   }, [allTasks.length]); // Rerun if the number of tasks changes significantly (e.g., initial load)


  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      ...formData,
      id: generateId(),
      riskLevel: calculateRiskLevel(formData.likelihood, formData.impact),
      isComplete: false,
      createdAt: new Date(),
      completedAt: null, // Ensure completedAt is null for new tasks
      dueDate: formData.dueDate || null,
      recurring: formData.recurring ?? false,
      frequency: formData.recurring ? formData.frequency : null,
      recurringUntil: formData.recurring ? formData.recurringUntil : null,
    };
    setAllTasks((prevTasks) => [...prevTasks, newTask]); // No sort needed here, filter logic handles display
     // TODO: Implement logic to generate future instances if it's a recurring task
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
              ...task,
              ...formData,
              riskLevel: calculateRiskLevel(formData.likelihood, formData.impact),
              dueDate: formData.dueDate || null,
              recurring: formData.recurring ?? false,
              frequency: formData.recurring ? formData.frequency : null,
              recurringUntil: formData.recurring ? formData.recurringUntil : null,
              // completedAt and isComplete are handled by toggleTaskComplete
            }
          : task
      )
    );
     // TODO: Handle updates to recurring tasks
  }, []);

  const deleteTask = useCallback((id: string) => {
    setAllTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
     // TODO: Handle deletion of recurring tasks (delete future instances?)
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

                // Placeholder for recurring logic - currently just marks this instance
                // if (updatedTask.isComplete && task.recurring && task.frequency && task.dueDate) {
                //    // TODO: Generate next task instance
                // }

                 return updatedTask;
            }
            return task;
        });
    });
     // TODO: Refine the logic for completing recurring tasks.
  }, []);

  // Filter tasks into incomplete and completed lists
  const incompleteTasks = allTasks
    .filter(task => !task.isComplete)
    .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));

  const completedTasks = allTasks
    .filter(task => task.isComplete)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)); // Sort completed by most recent


  return {
    tasks: incompleteTasks, // Rename 'tasks' to 'incompleteTasks' for clarity? Keep as 'tasks' for backward compatibility with MatrixView
    completedTasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}

