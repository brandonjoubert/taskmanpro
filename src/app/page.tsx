
'use client';

import { useState } from 'react';
import { MatrixView } from '@/components/matrix-view';
import { TaskModal } from '@/components/task-modal';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/use-tasks';
import type { TaskFormData } from '@/components/task-form-schema';
import type { Task } from '@/interfaces/task';
import { PlusCircle, ListChecks, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { CompletedTasksView } from '@/components/completed-tasks-view'; // Import CompletedTasksView

type ViewMode = 'matrix' | 'completed';

export default function Home() {
  const {
      tasks, // These are now the incomplete tasks
      completedTasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete
  } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('matrix'); // State for current view

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (data: TaskFormData) => {
    if (editingTask && data.id) {
      updateTask(data);
    } else {
      addTask(data);
    }
    handleCloseModal(); // Close modal after submit
  };

   const handleDeleteTask = (id: string) => {
       // Add confirmation dialog here if desired
        deleteTask(id);
   }

   const handleToggleComplete = (id: string) => {
       toggleTaskComplete(id);
       // Optionally switch back to matrix view or stay in completed view
   }

  return (
    <div className="flex flex-col h-screen bg-background">
       {/* Header */}
      <header className="flex items-center justify-between p-4 border-b shadow-sm gap-2">
        <h1 className="text-2xl font-bold text-primary mr-auto">Risk Quadrant Scheduler</h1>
        <div className="flex items-center gap-2">
           {currentView === 'matrix' ? (
             <Button variant="outline" onClick={() => setCurrentView('completed')}>
               <ListChecks className="mr-2 h-4 w-4" /> View Completed
             </Button>
           ) : (
             <Button variant="outline" onClick={() => setCurrentView('matrix')}>
               <LayoutGrid className="mr-2 h-4 w-4" /> View Matrix
             </Button>
           )}
          <Button onClick={() => handleOpenModal()}>
             <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
          </Button>
        </div>
      </header>

       {/* Main Content Area */}
      <main className="flex-grow overflow-auto">
         {isLoading ? (
             // Skeleton Loading State
            <div className={`grid ${currentView === 'matrix' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 p-4 h-full`}>
                {currentView === 'matrix' ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
                            <Skeleton className="h-6 w-3/5 rounded" />
                            <Skeleton className="h-4 w-4/5 rounded" />
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                            </div>
                        </div>
                    ))
                ) : (
                    // Skeleton for completed list
                    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
                        <Skeleton className="h-6 w-2/5 rounded mb-4" />
                        {[...Array(5)].map((_, i) => (
                             <Skeleton key={i} className="h-20 w-full rounded" />
                        ))}
                    </div>
                )}
            </div>
         ) : (
             // Actual View based on currentView state
              currentView === 'matrix' ? (
                 <MatrixView
                     tasks={tasks} // Pass incomplete tasks
                     onToggleComplete={handleToggleComplete} // Use updated handler
                     onEditTask={handleOpenModal}
                     onDeleteTask={handleDeleteTask}
                 />
              ) : (
                 <CompletedTasksView
                    tasks={completedTasks}
                    onToggleComplete={handleToggleComplete} // Can reuse toggle to mark as incomplete
                    onDeleteTask={handleDeleteTask} // Allow deletion from completed view
                  />
              )
         )}
      </main>

      {/* Modal for Adding/Editing Tasks */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialTaskData={editingTask}
      />
    </div>
  );
}
