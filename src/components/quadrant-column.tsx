
import type { Task } from '@/interfaces/task';
import type { Quadrant } from '@/lib/constants';
import { quadrantConfig } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TaskCard } from './task-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuadrantColumnProps {
  quadrant: Quadrant;
  tasks: Task[]; // Should receive only incomplete tasks for this quadrant
  onToggleComplete?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  currencySymbol: string; // Added prop
}

export function QuadrantColumn({ quadrant, tasks, onToggleComplete, onEditTask, onDeleteTask, currencySymbol }: QuadrantColumnProps) {
  const config = quadrantConfig[quadrant];
  // Explicitly filter for incomplete tasks just to be safe, though parent should handle this
  const incompleteTasksInQuadrant = tasks.filter(task => !task.isComplete);

  return (
    <Card className="flex flex-col h-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0 overflow-hidden">
        <ScrollArea className="h-full pr-3">
            {incompleteTasksInQuadrant.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">No tasks in this quadrant.</p>
            ) : (
             incompleteTasksInQuadrant.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  currencySymbol={currencySymbol} // Pass down
                 />
             ))
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

