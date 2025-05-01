
'use client';

import type { Task } from '@/interfaces/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// Removed getRiskDisplayConfig import as it's no longer used directly for display
import { frequencyConfig, impactScoreConfig, CURRENCY_SYMBOL } from '@/lib/constants';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Edit, Trash2, Repeat, AlertTriangle, Info } from 'lucide-react'; // Added AlertTriangle, Info
import { useState, useEffect } from 'react';
import { calculateImpactScore } from '@/lib/risk'; // Import function to get impact score details

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

// Function to determine badge color based on riskValue
const getRiskValueColorClass = (riskValue: number): string => {
    // Thresholds for color coding (adjust as needed)
    if (riskValue >= 15) return 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-100 border-green-300 dark:border-green-800/60'; // Critical Risk (e.g., High Impact * Do Quad)
    if (riskValue >= 8) return 'bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100 border-orange-300 dark:border-orange-800/60'; // High/Medium Risk
    return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800/60'; // Low Risk
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  // Removed riskConfig as we now use riskValue directly
  const [isOverdue, setIsOverdue] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const impactScoreDetails = impactScoreConfig.find(level => task.monetaryImpact < (level.upperBound ?? Infinity)) ?? impactScoreConfig[0];


   // Check for overdue status on the client side
   useEffect(() => {
     setCurrentTime(new Date());
     setIsOverdue(!!task.dueDate && task.dueDate < new Date() && !task.isComplete);
   }, [task.dueDate, task.isComplete]);


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

  const displayDueDate = task.dueDate && currentTime ? formatDistanceToNow(task.dueDate, { addSuffix: true, now: currentTime }) : 'No due date';
  const fullDueDate = task.dueDate ? format(task.dueDate, 'PPP p') : '';
  const completedDate = task.completedAt && currentTime ? `Completed: ${formatDistanceToNow(task.completedAt, { addSuffix: true, now: currentTime })}` : '';
  const fullCompletedDate = task.completedAt ? format(task.completedAt, 'PPP p') : '';

  const overdueClass = 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-100 border-red-300 dark:border-red-800/60';
  const riskValueColorClass = getRiskValueColorClass(task.riskValue); // Get color based on risk value

  return (
    <TooltipProvider delayDuration={300}>
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
                  <CardTitle className={cn(
                      "text-lg font-semibold break-words",
                      task.isComplete ? 'line-through text-muted-foreground' : '',
                      isOverdue ? 'text-destructive dark:text-destructive/90' : ''
                    )}>
                      {isOverdue && <AlertTriangle className="h-4 w-4 mr-1 inline-block text-destructive" aria-label="Overdue" />}
                      {task.title}
                  </CardTitle>
                   {task.recurring && (
                       <Tooltip>
                           <TooltipTrigger asChild>
                               <Repeat className="h-3 w-3 ml-1 inline-block text-muted-foreground cursor-help" />
                           </TooltipTrigger>
                           <TooltipContent>
                               <p>{recurringInfo || 'Recurring task'}</p>
                           </TooltipContent>
                       </Tooltip>
                    )}
                     {/* Tooltip for Monetary Impact */}
                     <Tooltip>
                           <TooltipTrigger asChild>
                               <span className="ml-1 inline-block text-muted-foreground cursor-help">
                                   <Info className="h-3 w-3"/>
                               </span>
                           </TooltipTrigger>
                           <TooltipContent side="bottom" align="start">
                               <p>Est. Impact: {CURRENCY_SYMBOL}{task.monetaryImpact.toLocaleString()}</p>
                               <p className="text-xs text-muted-foreground">({impactScoreDetails.label}, Score: {impactScoreDetails.score})</p>
                           </TooltipContent>
                       </Tooltip>
              </div>
            </div>
             {/* Display Risk Value in Badge */}
             <Badge
               className={cn(
                 "text-xs font-medium flex-shrink-0 ml-2 border",
                  isOverdue ? overdueClass : riskValueColorClass // Use overdue or risk value color
               )}
             >
                {isOverdue ? 'OVERDUE' : `Risk: ${task.riskValue}`}
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
