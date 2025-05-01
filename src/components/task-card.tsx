'use client';

import type { Task } from '@/interfaces/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip
import { getRiskDisplayConfig } from '@/lib/risk';
import { frequencyConfig } from '@/lib/constants'; // Import frequencyConfig
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Edit, Trash2, Repeat } from 'lucide-react'; // Import Repeat icon

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

  const recurringInfo = task.recurring && task.frequency
    ? `Repeats ${frequencyConfig[task.frequency].label.toLowerCase()}${task.recurringUntil ? ` until ${format(task.recurringUntil, 'PPP')}` : ''}`
    : '';


  return (
    <TooltipProvider delayDuration={300}>
        <Card className={cn("mb-2 transition-shadow hover:shadow-md", task.isComplete ? 'opacity-60' : '')}>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center space-x-2 flex-grow min-w-0"> {/* Ensure title can shrink */}
             <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleComplete}
                className="h-6 w-6 flex-shrink-0" // Prevent checkbox from shrinking
                aria-label={task.isComplete ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.isComplete ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </Button>
              <div className="flex-grow min-w-0"> {/* Allow title and recurrence icon to wrap/shrink */}
                  <CardTitle className={cn("text-lg font-semibold break-words", task.isComplete ? 'line-through' : '')}> {/* Allow title to break words */}
                      {task.title}
                  </CardTitle>
                   {task.recurring && (
                       <Tooltip>
                           <TooltipTrigger asChild>
                               <Repeat className="h-3 w-3 ml-1 inline-block text-muted-foreground cursor-help" />
                           </TooltipTrigger>
                           <TooltipContent>
                               <p>{recurringInfo}</p>
                           </TooltipContent>
                       </Tooltip>
                    )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium text-white flex-shrink-0 ml-2", riskConfig.colorClass)} // Prevent badge shrinking, add margin
            >
              {riskConfig.label} ({riskConfig.quantity})
            </Badge>
          </CardHeader>
          {task.description && (
            <CardContent className="pb-3 pt-0">
              <CardDescription className={cn("break-words", task.isComplete ? 'line-through' : '')}>{task.description}</CardDescription>
            </CardContent>
          )}
          <CardFooter className="flex justify-between items-center pt-0 pb-3 text-xs text-muted-foreground">
             <div className="min-w-0"> {/* Allow due date text to shrink/wrap */}
                {task.dueDate ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="truncate cursor-help"> {/* Truncate if too long */}
                                Due: {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{format(task.dueDate, 'PPP p')}</p> {/* Show full date/time on hover */}
                            {recurringInfo && <p className="mt-1 text-xs">{recurringInfo}</p>}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                   <span>No due date</span>
                )}
            </div>
             <div className="flex space-x-1 flex-shrink-0"> {/* Prevent buttons shrinking */}
                {onEdit && (
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEdit} aria-label="Edit task">
                                <Edit className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit Task</p></TooltipContent>
                     </Tooltip>
                )}
                {onDelete && (
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/90" onClick={handleDelete} aria-label="Delete task">
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete Task</p></TooltipContent>
                     </Tooltip>
                 )}
             </div>
          </CardFooter>
        </Card>
    </TooltipProvider>
  );
}
