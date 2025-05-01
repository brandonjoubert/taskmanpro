
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/interfaces/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { frequencyConfig, CURRENCY_SYMBOL } from '@/lib/constants';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Edit, Trash2, Repeat, AlertTriangle, Info, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { calculateImpactScore } from '@/lib/risk'; // Import function to get impact score details

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  currencySymbol: string; // Added prop
  isDragging?: boolean; // Optional prop to indicate dragging state
}

// Function to determine badge color based on riskValue
const getRiskValueColorClass = (riskValue: number): string => {
    // Thresholds for color coding (adjust as needed)
    if (riskValue >= 15) return 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-100 border-green-300 dark:border-green-800/60'; // Critical Risk (e.g., High Impact * Do Quad)
    if (riskValue >= 8) return 'bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100 border-orange-300 dark:border-orange-800/60'; // High/Medium Risk
    return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800/60'; // Low Risk
};

export function TaskCard({
    task,
    onToggleComplete,
    onEdit,
    onDelete,
    currencySymbol = CURRENCY_SYMBOL,
    isDragging = false // Default dragging state to false
}: TaskCardProps) {
  const [isOverdue, setIsOverdue] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  // Recalculate impact score details using the current currency symbol in labels
  const impactScoreDetails = calculateImpactScore(task.monetaryImpact, currencySymbol);

   // Check for overdue status on the client side
   useEffect(() => {
     setCurrentTime(new Date());
     setIsOverdue(!!task.dueDate && task.dueDate < new Date() && !task.isComplete);
   }, [task.dueDate, task.isComplete]);


    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: dndIsDragging, // Use alias to avoid conflict with prop
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: dndIsDragging || isDragging ? 0.5 : 1, // Dim card when dragging
        zIndex: dndIsDragging || isDragging ? 10 : 'auto', // Bring to front when dragging
        cursor: dndIsDragging || isDragging ? 'grabbing' : 'grab', // Change cursor
    };


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
    ? `Repeats ${frequencyConfig[task.frequency].label.toLowerCase()}${task.recurringUntil ? ` until ${format(task.recurringUntil, 'PP')}` : ''}` // Shortened date format
    : '';

  const displayDueDate = task.dueDate && currentTime ? formatDistanceToNow(task.dueDate, { addSuffix: true, now: currentTime }) : 'No due date';
  const fullDueDate = task.dueDate ? format(task.dueDate, 'PPp') : ''; // Shortened date format with time
  const completedDate = task.completedAt && currentTime ? `Completed: ${formatDistanceToNow(task.completedAt, { addSuffix: true, now: currentTime })}` : '';
  const fullCompletedDate = task.completedAt ? format(task.completedAt, 'PPp') : ''; // Shortened date format with time

  const overdueClass = 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-100 border-red-300 dark:border-red-800/60';
  const riskValueColorClass = getRiskValueColorClass(task.riskValue); // Get color based on risk value

  return (
    <TooltipProvider delayDuration={300}>
        <Card
            ref={setNodeRef} // Assign ref for dnd-kit
            style={style} // Apply dragging styles
            className={cn(
                "mb-1.5 transition-shadow hover:shadow-lg", // Reduced bottom margin
                task.isComplete ? 'opacity-60' : '',
                isOverdue ? 'border-destructive/50 dark:border-destructive/70' : '',
                dndIsDragging || isDragging ? 'shadow-xl ring-2 ring-primary' : '', // Adjusted shadow
                "relative" // Needed for absolute positioning of drag handle
            )}
            // Do not spread attributes and listeners directly on Card if it interferes with existing events
            // Instead, apply them to a specific drag handle element
        >
            {/* Drag Handle */}
             <div
               {...attributes}
               {...listeners}
               className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 p-0.5 cursor-grab opacity-30 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring rounded" // Smaller padding
               aria-label="Drag task"
             >
               <GripVertical className="h-3.5 w-3.5 text-muted-foreground" /> {/* Smaller icon */}
             </div>

          {/* Card content needs padding adjustment due to handle */}
          <div className="pl-5"> {/* Reduced left padding */}
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-2"> {/* Reduced padding */}
                <div className="flex items-center space-x-1.5 flex-grow min-w-0"> {/* Reduced space */}
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleComplete}
                    className="h-5 w-5 flex-shrink-0" // Reduced size
                    aria-label={task.isComplete ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.isComplete ? <CheckSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-500" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />} {/* Smaller icon */}
                  </Button>
                  <div className="flex-grow min-w-0">
                      <CardTitle className={cn(
                          "text-base font-semibold break-words", // Reduced font size
                          task.isComplete ? 'line-through text-muted-foreground' : '',
                          isOverdue ? 'text-destructive dark:text-destructive/90' : ''
                        )}>
                          {isOverdue && <AlertTriangle className="h-3.5 w-3.5 mr-1 inline-block text-destructive" aria-label="Overdue" />} {/* Smaller icon */}
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
                                   <p>Est. Impact: {currencySymbol}{task.monetaryImpact.toLocaleString()}</p> {/* Use currencySymbol prop */}
                                   <p className="text-xs text-muted-foreground">({impactScoreDetails.label}, Score: {impactScoreDetails.score})</p>
                               </TooltipContent>
                           </Tooltip>
                  </div>
                </div>
                 {/* Display Risk Value in Badge */}
                 <Badge
                   className={cn(
                     "text-[10px] font-medium flex-shrink-0 ml-1.5 border px-1.5 py-0", // Smaller text, padding
                      isOverdue ? overdueClass : riskValueColorClass // Use overdue or risk value color
                   )}
                 >
                    {isOverdue ? 'OVERDUE' : `Risk: ${task.riskValue}`}
                 </Badge>
              </CardHeader>
              {task.description && (
                <CardContent className="pb-1.5 pt-0"> {/* Reduced padding */}
                  <CardDescription className={cn(
                      "text-xs break-words line-clamp-2", // Smaller text, limit lines
                      task.isComplete ? 'line-through text-muted-foreground' : '')}>
                      {task.description}
                  </CardDescription>
                </CardContent>
              )}
              <CardFooter className="flex justify-between items-center pt-0 pb-2 text-xs text-muted-foreground"> {/* Reduced padding */}
                 <div className="min-w-0">
                     {task.isComplete && task.completedAt ? (
                         <Tooltip>
                             <TooltipTrigger asChild>
                                 <span className="truncate cursor-help text-green-700 dark:text-green-400 text-[11px]"> {/* Smaller text */}
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
                                 <span className={cn(
                                     "truncate cursor-help text-[11px]", // Smaller text
                                     isOverdue ? 'text-destructive dark:text-destructive/90 font-medium' : ''
                                     )}>
                                     Due: {currentTime ? displayDueDate : 'Calculating...'}
                                 </span>
                             </TooltipTrigger>
                             <TooltipContent>
                                 <p>{fullDueDate}</p>
                                 {recurringInfo && <p className="mt-1 text-xs">{recurringInfo}</p>}
                             </TooltipContent>
                         </Tooltip>
                     ) : (
                        <span className="text-[11px]">No due date</span> // Smaller text
                     )}
                </div>
                 <div className="flex space-x-0.5 flex-shrink-0"> {/* Reduced space */}
                    {!task.isComplete && onEdit && (
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleEdit} aria-label="Edit task"> {/* Reduced size */}
                                    <Edit className="h-3 w-3" /> {/* Smaller icon */}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit Task</p></TooltipContent>
                         </Tooltip>
                    )}
                    {onDelete && (
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive/90" onClick={handleDelete} aria-label="Delete task"> {/* Reduced size */}
                                    <Trash2 className="h-3 w-3" /> {/* Smaller icon */}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete Task</p></TooltipContent>
                         </Tooltip>
                     )}
                 </div>
              </CardFooter>
           </div> {/* End pl-5 wrapper */}
        </Card>
    </TooltipProvider>
  );
}
