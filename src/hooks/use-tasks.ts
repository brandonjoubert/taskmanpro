'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/interfaces/task';
import type { TaskFormData } from '@/components/task-form-schema';
import { calculateRiskLevel } from '@/lib/risk';
import { Quadrant, Likelihood, Impact, RiskLevel } from '@/lib/constants';

// Helper to generate unique IDs (replace with a more robust solution like uuid if needed)
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Initial dummy data for demonstration
const initialTasks: Task[] = [
  { id: generateId(), title: 'Review Q3 budget', description: 'Final check before submission', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.High, riskLevel: RiskLevel.Critical, isComplete: false, createdAt: new Date() },
  { id: generateId(), title: 'Plan team offsite', description: 'Location, activities, budget', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Decide, likelihood: Likelihood.Medium, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date() },
  { id: generateId(), title: 'Book flight for conference', description: 'ASAP', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), quadrant: Quadrant.Delegate, likelihood: Likelihood.Low, impact: Impact.Medium, riskLevel: RiskLevel.Medium, isComplete: false, createdAt: new Date() },
  { id: generateId(), title: 'Clean up old project files', description: 'Low priority', dueDate: null, quadrant: Quadrant.Delete, likelihood: Likelihood.Low, impact: Impact.Low, riskLevel: RiskLevel.Low, isComplete: false, createdAt: new Date() },
    { id: generateId(), title: 'Urgent client call', description: 'Address critical issue', dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), quadrant: Quadrant.Do, likelihood: Likelihood.High, impact: Impact.Medium, riskLevel: RiskLevel.High, isComplete: false, createdAt: new Date() },
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
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]);
     // Optional: Add notification here
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
            }
          : task
      )
    );
    // Optional: Add notification here
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
     // Optional: Add confirmation dialog? Add notification?
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, isComplete: !task.isComplete } : task
      )
    );
  }, []);

  return {
    tasks,
    isLoading, // Expose loading state
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}
