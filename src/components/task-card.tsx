

'use client';

import type { Task } from '@/interfaces/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getRiskDisplayConfig } from '@/lib/risk';
import { frequencyConfig } from '@/lib/constants';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Edit, Trash2, Repeat, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for overdue
import { useState, useEffect } from 'react'; // Import useEffect and useState for client-side date check

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void; // Note: Will be hidden for completed tasks
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const riskConfig = getRiskDisplayConfig(task.riskLevel);
  const [isOverdue, setIsOverdue] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

   // Check for overdue status on the client side after hydration
   useEffect(() => {
     setCurrentTime(new Date()); // Set current time on client
     // Check if task has a due date, it's in the past, and the task is not complete
     setIsOverdue(!!task.dueDate && task.dueDate < new Date() && !task.isComplete);
   }, [task.dueDate, task.isComplete]); // Re-run if dueDate or completion status changes


  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Display relative due date only if currentTime is available (client-side)
  const displayDueDate = task.dueDate && currentTime ? formatDistanceToNow(task.dueDate, { addSuffix: true, now: currentTime }) : 'No due date';
  const fullDueDate = task.dueDate ? format(task.dueDate, 'PPP p') : '';
  // Display relative completed date only if currentTime is available
  const completedDate = task.completedAt && currentTime ? `Completed: ${formatDistanceToNow(task.completedAt, { addSuffix: true, now: currentTime })}` : '';
  const fullCompletedDate = task.completedAt ? format(task.completedAt, 'PPP p') : '';

  // Define the style for the overdue badge - Use darker reds
  const overdueClass = 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-100 border-red-300 dark:border-red-800/60';


  return (
    <TooltipProvider delayDuration={300}>
        {/* Apply red border if overdue */}
        <Card className={cn("mb-2 transition-shadow hover:shadow-md", task.isComplete ? 'opacity-60' : '', isOverdue ? 'border-destructive/50 dark:border-destructive/70' : '')}>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center space-x-2 flex-grow min-w-0">
             <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleComplete}
                className="h-6 w-6 flex-shrink-0"
                aria-label={task.isComplete ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.isComplete ? <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-500" /> : <Square className="h-4 w-4 text-muted-foreground" />}
              </Button>
              <div className="flex-grow min-w-0">
                  {/* Apply red text color if overdue */}
                  <CardTitle className={cn(
                      "text-lg font-semibold break-words",
                      task.isComplete ? 'line-through text-muted-foreground' : '',
                      isOverdue ? 'text-destructive dark:text-destructive/90' : ''
                    )}>
                      {/* Show overdue icon if applicable */}
                      {isOverdue && <AlertTriangle className="h-4 w-4 mr-1 inline-block text-destructive" aria-label="Overdue" />}
                      {task.title}
                  </CardTitle>
                   {task.recurring && ( // Always show recurrence icon if recurring
                       <Tooltip>
                           <TooltipTrigger asChild>
                               <Repeat className="h-3 w-3 ml-1 inline-block text-muted-foreground cursor-help" />
                           </TooltipTrigger>
                           <TooltipContent>
                               <p>{recurringInfo || 'Recurring task'}</p>
                           </TooltipContent>
                       </Tooltip>
                    )}
              </div>
            </div>
             {/* Conditionally apply overdue style or risk color */}
             <Badge
               // Remove variant="outline" - colors are now fully controlled by colorClass
               className={cn(
                 "text-xs font-medium flex-shrink-0 ml-2 border", // Base badge styles
                  isOverdue ? overdueClass : riskConfig.colorClass // Apply specific color classes
               )}
             >
                {/* Show 'OVERDUE' label or risk label */}
                {isOverdue ? 'OVERDUE' : riskConfig.label} ({riskConfig.quantity})
             </Badge>
          </CardHeader>
          {task.description && (
            <CardContent className="pb-3 pt-0">
              <CardDescription className={cn("break-words", task.isComplete ? 'line-through text-muted-foreground' : '')}>{task.description}</CardDescription>
            </CardContent>
          )}
          <CardFooter className="flex justify-between items-center pt-0 pb-3 text-xs text-muted-foreground">
             <div className="min-w-0">
                 {task.isComplete && task.completedAt ? (
                     <Tooltip>
                         <TooltipTrigger asChild>
                             {/* Show loading indicator until client time is ready */}
                             <span className="truncate cursor-help text-green-700 dark:text-green-400">
                                 {currentTime ? completedDate : 'Calculating...'}
                             </span>
                         </TooltipTrigger>
                         <TooltipContent>
                             <p>{fullCompletedDate}</p>
                             {task.dueDate && <p className="mt-1 text-xs">Originally due: {fullDueDate}</p>}
                         </TooltipContent>
                     </Tooltip>
                 ) : task.dueDate ? (
                     <Tooltip>
                         <TooltipTrigger asChild>
                             {/* Show loading indicator until client time is ready */}
                             {/* Apply red text color if overdue */}
                             <span className={cn("truncate cursor-help", isOverdue ? 'text-destructive dark:text-destructive/90 font-medium' : '')}>
                                 Due: {currentTime ? displayDueDate : 'Calculating...'}
                             </span>
                         </TooltipTrigger>
                         <TooltipContent>
                             <p>{fullDueDate}</p>
                             {recurringInfo && <p className="mt-1 text-xs">{recurringInfo}</p>}
                         </TooltipContent>
                     </Tooltip>
                 ) : (
                    <span>No due date</span>
                 )}
            </div>
             <div className="flex space-x-1 flex-shrink-0">
                {/* Only show Edit button if task is NOT complete */}
                {!task.isComplete && onEdit && (
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

