
'use client';

import { useState } from 'react';
import { MatrixView } from '@/components/matrix-view';
import { TaskModal } from '@/components/task-modal';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/use-tasks';
import type { TaskFormData } from '@/components/task-form-schema';
import type { Task } from '@/interfaces/task';
import { PlusCircle, ListChecks, LayoutGrid, Settings } from 'lucide-react'; // Added Settings
import { Skeleton } from '@/components/ui/skeleton';
import { CompletedTasksView } from '@/components/completed-tasks-view';
import { Input } from '@/components/ui/input'; // Added Input for currency
import { Label } from '@/components/ui/label'; // Added Label
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Added Popover for settings
import { CURRENCY_SYMBOL } from '@/lib/constants'; // Import default currency symbol

type ViewMode = 'matrix' | 'completed';

export default function Home() {
  const {
      tasks,
      completedTasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete
  } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('matrix');
  const [currencySymbol, setCurrencySymbol] = useState(CURRENCY_SYMBOL); // State for currency symbol

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
    handleCloseModal();
  };

   const handleDeleteTask = (id: string) => {
        deleteTask(id);
   }

   const handleToggleComplete = (id: string) => {
       toggleTaskComplete(id);
   }

   // NOTE: This simple currency setting is not persisted.
   // For persistence, you'd need localStorage or a backend.
   const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setCurrencySymbol(event.target.value || '$'); // Default back to '$' if empty
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
          {/* Settings Popover */}
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="ghost" size="icon">
                 <Settings className="h-5 w-5" />
                 <span className="sr-only">Settings</span>
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-60">
               <div className="grid gap-4">
                 <div className="space-y-2">
                   <h4 className="font-medium leading-none">Settings</h4>
                   <p className="text-sm text-muted-foreground">
                     Adjust application settings.
                   </p>
                 </div>
                 <div className="grid gap-2">
                   <Label htmlFor="currency-symbol">Currency Symbol</Label>
                   <Input
                     id="currency-symbol"
                     value={currencySymbol}
                     onChange={handleCurrencyChange}
                     maxLength={3} // Limit symbol length
                     className="h-8"
                   />
                 </div>
               </div>
             </PopoverContent>
           </Popover>
        </div>
      </header>

       {/* Main Content Area */}
      <main className="flex-grow overflow-auto">
         {isLoading ? (
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
                    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
                        <Skeleton className="h-6 w-2/5 rounded mb-4" />
                        {[...Array(5)].map((_, i) => (
                             <Skeleton key={i} className="h-20 w-full rounded" />
                        ))}
                    </div>
                )}
            </div>
         ) : (
              currentView === 'matrix' ? (
                 <MatrixView
                     tasks={tasks}
                     onToggleComplete={handleToggleComplete}
                     onEditTask={handleOpenModal}
                     onDeleteTask={handleDeleteTask}
                     // Pass currencySymbol if needed by child components, though constants might be enough
                     // currencySymbol={currencySymbol}
                 />
              ) : (
                 <CompletedTasksView
                    tasks={completedTasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    // currencySymbol={currencySymbol}
                  />
              )
         )}
      </main>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialTaskData={editingTask}
        // Pass currencySymbol if needed by the form
        // currencySymbol={currencySymbol}
      />
    </div>
  );
}
