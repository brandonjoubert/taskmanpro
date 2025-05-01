
import type { Task } from '@/interfaces/task';
import { Quadrant } from '@/lib/constants';
import { QuadrantColumn } from './quadrant-column';

interface MatrixViewProps {
  tasks: Task[]; // Should now only receive incomplete tasks
  onToggleComplete?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  currencySymbol: string; // Added prop
}

export function MatrixView({ tasks, onToggleComplete, onEditTask, onDeleteTask, currencySymbol }: MatrixViewProps) {
  const getTasksForQuadrant = (quadrant: Quadrant) => {
    // Filter already happened in useTasks, but double-check just in case
    return tasks.filter((task) => task.quadrant === quadrant && !task.isComplete);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
      <QuadrantColumn
        quadrant={Quadrant.Do}
        tasks={getTasksForQuadrant(Quadrant.Do)}
        onToggleComplete={onToggleComplete}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        currencySymbol={currencySymbol} // Pass down
      />
      <QuadrantColumn
        quadrant={Quadrant.Decide}
        tasks={getTasksForQuadrant(Quadrant.Decide)}
        onToggleComplete={onToggleComplete}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        currencySymbol={currencySymbol} // Pass down
       />
      <QuadrantColumn
        quadrant={Quadrant.Delegate}
        tasks={getTasksForQuadrant(Quadrant.Delegate)}
        onToggleComplete={onToggleComplete}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        currencySymbol={currencySymbol} // Pass down
       />
      <QuadrantColumn
        quadrant={Quadrant.Delete}
        tasks={getTasksForQuadrant(Quadrant.Delete)}
        onToggleComplete={onToggleComplete}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        currencySymbol={currencySymbol} // Pass down
       />
    </div>
  );
}

