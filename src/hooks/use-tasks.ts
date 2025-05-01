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
  { id: generateId(), title: 'Review Q3 budget', description: 'Final check before submission', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.High, riskLevel: RiskLevel.Critical, isComplete: false, createdAt: new Date(), recurring: false },
  { id: generateId(), title: 'Plan team offsite', description: 'Location, activities, budget', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Decide, likelihood: Likelihood.Medium, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date(), recurring: false },
  { id: generateId(), title: 'Submit weekly report', description: 'Sales data and team updates', dueDate: new Date(new Date().setHours(17,0,0,0)), quadrant: Quadrant.Delegate, likelihood: Likelihood.Low, impact: Impact.Medium, riskLevel: RiskLevel.Medium, isComplete: false, createdAt: new Date(), recurring: true, frequency: Frequency.Weekly, recurringUntil: null }, // Recurring task example
  { id: generateId(), title: 'Clean up old project files', description: 'Low priority', dueDate: null, quadrant: Quadrant.Delete, likelihood: Likelihood.Low, impact: Impact.Low, riskLevel: RiskLevel.Low, isComplete: false, createdAt: new Date(), recurring: false },
    { id: generateId(), title: 'Urgent client call', description: 'Address critical issue', dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date(), recurring: false },
];

// Key for local storage
const LOCAL_STORAGE_KEY = 'riskQuadrantTasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State for initial loading

   // Load tasks from local storage on initial mount (client-side only)
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          // Ensure dates are Date objects
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          recurringUntil: task.recurringUntil ? new Date(task.recurringUntil) : null, // Parse recurringUntil
          // Ensure frequency is valid or null
          frequency: Object.values(Frequency).includes(task.frequency) ? task.frequency : null,
          recurring: !!task.recurring, // Ensure boolean
        }));
        setTasks(parsedTasks);
      } else {
        // Initialize with dummy data if no stored data
         setTasks(initialTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
       setTasks(initialTasks); // Fallback to initial data on error
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Save tasks to local storage whenever tasks change (client-side only)
  useEffect(() => {
      // Avoid saving during initial load before tasks are set
      if (!isLoading) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
          } catch (error) {
            console.error("Failed to save tasks to local storage:", error);
          }
      }
  }, [tasks, isLoading]);


  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      ...formData,
      id: generateId(),
      riskLevel: calculateRiskLevel(formData.likelihood, formData.impact),
      isComplete: false,
      createdAt: new Date(),
      dueDate: formData.dueDate || null, // Ensure it's null if undefined/empty
      recurring: formData.recurring ?? false, // Ensure boolean
      frequency: formData.recurring ? formData.frequency : null, // Null if not recurring
      recurringUntil: formData.recurring ? formData.recurringUntil : null, // Null if not recurring
    };
    setTasks((prevTasks) => [...prevTasks, newTask].sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity))); // Add and sort
     // Optional: Add notification here
     // TODO: Implement logic to generate future instances if it's a recurring task
  }, []);

  const updateTask = useCallback((formData: TaskFormData) => {
    if (!formData.id) {
        console.error("Update failed: Task ID missing.");
        return; // Should not happen if form logic is correct
    }
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === formData.id
          ? {
              ...task, // Keep existing fields like isComplete, createdAt
              ...formData, // Apply updated form data
              riskLevel: calculateRiskLevel(formData.likelihood, formData.impact), // Recalculate risk
              dueDate: formData.dueDate || null, // Ensure it's null if undefined/empty
              recurring: formData.recurring ?? false, // Ensure boolean
              frequency: formData.recurring ? formData.frequency : null, // Null if not recurring
              recurringUntil: formData.recurring ? formData.recurringUntil : null, // Null if not recurring
            }
          : task
      ).sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity)) // Re-sort
    );
    // Optional: Add notification here
     // TODO: Handle updates to recurring tasks (may need to regenerate future instances)
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
     // Optional: Add confirmation dialog? Add notification?
     // TODO: Handle deletion of recurring tasks (delete future instances?)
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prevTasks) => {
        const newTasks = prevTasks.map((task) => {
            if (task.id === id) {
                const updatedTask = { ...task, isComplete: !task.isComplete };

                // Placeholder for future recurring logic
                // if (updatedTask.isComplete && task.recurring && task.frequency && task.dueDate) {
                //     // TODO: Implement generateNextTaskInstance logic here
                //     // This is where you'd calculate the next due date based on frequency
                //     // and potentially create a new task instance or update this one.
                //     // Check against recurringUntil date.
                // }

                 return updatedTask;
            }
            return task;
        });
        // Re-sort after completion toggle to potentially move completed tasks down visually if desired
        // Or keep the due date sort. For now, keep due date sort.
        return newTasks.sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
    });
     // TODO: Refine the logic for completing recurring tasks.
     // For now, it just marks the current instance complete.
     // A more robust solution would generate the next occurrence.
  }, []);

  // NOTE: This hook currently only stores the *template* for recurring tasks.
  // It does NOT automatically generate future occurrences when a task is completed
  // or when the app loads. Implementing that requires more complex logic, potentially
  // involving background jobs or checks on app load/task completion.

  return {
    tasks,
    isLoading, // Expose loading state
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}
