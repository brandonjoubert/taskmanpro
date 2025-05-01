
'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter, // Changed from closestCorners
} from '@dnd-kit/core';
import type { Task } from '@/interfaces/task';
import type { TaskFormData } from '@/components/task-form-schema';
import { Quadrant } from '@/lib/constants';
import { QuadrantColumn } from './quadrant-column';
import { useState } from 'react';

interface MatrixViewProps {
  tasks: Task[]; // Should now only receive incomplete tasks
  onToggleComplete?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  currencySymbol: string; // Added prop
  updateTask: (data: TaskFormData) => void; // Add updateTask prop
}

export function MatrixView({
    tasks,
    onToggleComplete,
    onEditTask,
    onDeleteTask,
    currencySymbol,
    updateTask // Destructure updateTask
}: MatrixViewProps) {

    // State to track the currently dragged item ID for potential styling
    const [activeId, setActiveId] = useState<string | null>(null);

  const getTasksForQuadrant = (quadrant: Quadrant): Task[] => {
    // Filter already happened in useTasks, but double-check just in case
    return tasks.filter((task) => task.quadrant === quadrant && !task.isComplete);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      // Ensure 'over' exists before trying to access its id
      if (!over) {
          console.log("Drag ended outside a droppable area.");
          return;
      }

      if (active && over && active.id !== over.id) {
          const taskId = active.id as string;
          const targetQuadrant = over.id as Quadrant; // Assuming over.id is the Quadrant enum value from the QuadrantColumn

          const taskToMove = tasks.find(task => task.id === taskId);

          // Check if the target is a valid quadrant and different from the current one
          // The check Object.values(Quadrant).includes(targetQuadrant) ensures over.id is a quadrant ID, not a task ID
          if (taskToMove && Object.values(Quadrant).includes(targetQuadrant) && taskToMove.quadrant !== targetQuadrant) {
              console.log(`Moving task ${taskId} from ${taskToMove.quadrant} to ${targetQuadrant}`);

              // Prepare the updated task data
              const updatedTaskData: TaskFormData = {
                  // Spread existing form-relevant data, potentially fetching full task if needed
                  id: taskToMove.id,
                  title: taskToMove.title,
                  description: taskToMove.description,
                  dueDate: taskToMove.dueDate,
                  monetaryImpact: taskToMove.monetaryImpact,
                  recurring: taskToMove.recurring,
                  frequency: taskToMove.frequency,
                  recurringUntil: taskToMove.recurringUntil,
                  // The crucial change: update the quadrant
                  quadrant: targetQuadrant,
              };

              // Call the updateTask function passed from the parent
              updateTask(updatedTaskData);
          } else {
              // Log why the update didn't happen if it wasn't a valid quadrant move
               if (taskToMove && !Object.values(Quadrant).includes(targetQuadrant)) {
                    console.log(`Drag ended over an invalid target (not a Quadrant): ${targetQuadrant}`);
               } else if (taskToMove && taskToMove.quadrant === targetQuadrant) {
                   console.log(`Drag ended in the same quadrant (${targetQuadrant}). No update needed.`);
               } else {
                   console.log("Drag end condition not met for update:", { taskId, targetId: over.id, taskQuadrant: taskToMove?.quadrant });
               }
          }
      } else {
           console.log("Drag ended without moving or active/over missing:", { activeId: active?.id, overId: over?.id });
      }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Use closestCenter strategy
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
        {Object.values(Quadrant).map((quadrant) => (
          <QuadrantColumn
            key={quadrant}
            quadrant={quadrant}
            tasks={getTasksForQuadrant(quadrant)}
            onToggleComplete={onToggleComplete}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            currencySymbol={currencySymbol}
            activeTaskId={activeId} // Pass active task ID for potential styling
          />
        ))}
      </div>
    </DndContext>
  );
}

