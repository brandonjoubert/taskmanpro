'use client';

import type { Task } from '@/interfaces/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRiskDisplayConfig } from '@/lib/risk';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Edit, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const riskConfig = getRiskDisplayConfig(task.riskLevel);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event if clicking the checkbox
    onToggleComplete?.(task.id);
  };

   const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };


  return (
    <Card className={cn("mb-2 transition-shadow hover:shadow-md", task.isComplete ? 'opacity-60' : '')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
         <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleComplete}
            className="h-6 w-6"
            aria-label={task.isComplete ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.isComplete ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </Button>
          <CardTitle className={cn("text-lg font-semibold", task.isComplete ? 'line-through' : '')}>{task.title}</CardTitle>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs font-medium text-white", riskConfig.colorClass)}
        >
          {riskConfig.label}
        </Badge>
      </CardHeader>
      {task.description && (
        <CardContent className="pb-3 pt-0">
          <CardDescription className={cn(task.isComplete ? 'line-through' : '')}>{task.description}</CardDescription>
        </CardContent>
      )}
      <CardFooter className="flex justify-between items-center pt-0 pb-3 text-xs text-muted-foreground">
         <div>
            {task.dueDate && (
                <span>Due: {formatDistanceToNow(task.dueDate, { addSuffix: true })}</span>
            )}
             {!task.dueDate && <span>No due date</span>}
        </div>
         <div className="flex space-x-1">
            {onEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEdit} aria-label="Edit task">
                    <Edit className="h-3 w-3" />
                </Button>
            )}
            {onDelete && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/90" onClick={handleDelete} aria-label="Delete task">
                    <Trash2 className="h-3 w-3" />
                </Button>
             )}
         </div>
      </CardFooter>
    </Card>
  );
}
