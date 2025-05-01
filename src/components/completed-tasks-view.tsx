
import type { Task } from '@/interfaces/task';
import { TaskCard } from './task-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompletedTasksViewProps {
  tasks: Task[];
  onToggleComplete?: (id: string) => void; // Mark as incomplete
  onDeleteTask?: (id: string) => void; // Allow deletion
}

export function CompletedTasksView({ tasks, onToggleComplete, onDeleteTask }: CompletedTasksViewProps) {
  return (
    <div className="p-4 h-full">
      <Card className="flex flex-col h-full shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-2 pt-0 overflow-hidden">
          <ScrollArea className="h-full pr-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completed tasks found (or they are older than 30 days).</p>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete} // Re-use toggle to mark as incomplete
                  onEdit={undefined} // No editing directly from completed view
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
