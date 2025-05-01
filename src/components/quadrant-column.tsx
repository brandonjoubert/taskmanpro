
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '@/interfaces/task';
import type { Quadrant } from '@/lib/constants';
import { quadrantConfig } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TaskCard } from './task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QuadrantColumnProps {
  quadrant: Quadrant;
  tasks: Task[]; // Should receive only incomplete tasks for this quadrant
  onToggleComplete?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  currencySymbol: string; // Added prop
  activeTaskId?: string | null; // ID of the task currently being dragged
}

export function QuadrantColumn({
    quadrant,
    tasks,
    onToggleComplete,
    onEditTask,
    onDeleteTask,
    currencySymbol,
    activeTaskId
}: QuadrantColumnProps) {
  const config = quadrantConfig[quadrant];
  // Explicitly filter for incomplete tasks just to be safe, though parent should handle this
  const incompleteTasksInQuadrant = tasks.filter(task => !task.isComplete);
  const taskIds = incompleteTasksInQuadrant.map(task => task.id);

  const { setNodeRef, isOver } = useDroppable({
    id: quadrant, // Use the Quadrant enum value as the ID for the droppable area
  });

   const isDraggingOver = isOver; // isOver indicates if a draggable is currently over this droppable

  return (
    <Card
        ref={setNodeRef} // Assign the ref from useDroppable to the Card element
        className={cn(
            "flex flex-col h-full shadow-md transition-colors duration-200",
            isDraggingOver ? "bg-accent/20 border-accent" : "", // Style when dragging over
        )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0 overflow-hidden">
        <ScrollArea className="h-full pr-3">
          <SortableContext
            items={taskIds} // Provide the IDs of the sortable items (tasks)
            strategy={verticalListSortingStrategy} // Use vertical list sorting strategy
          >
            {incompleteTasksInQuadrant.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isDraggingOver ? "Drop task here" : "No tasks in this quadrant."}
              </p>
            ) : (
              incompleteTasksInQuadrant.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  currencySymbol={currencySymbol} // Pass down
                  isDragging={task.id === activeTaskId} // Indicate if this card is being dragged
                />
              ))
            )}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
