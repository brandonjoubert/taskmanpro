'use client';

import { useState } from 'react';
import { MatrixView } from '@/components/matrix-view';
import { TaskModal } from '@/components/task-modal';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/use-tasks';
import type { TaskFormData } from '@/components/task-form-schema';
import type { Task } from '@/interfaces/task';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export default function Home() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleTaskComplete } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-background">
       {/* Header */}
      <header className="flex items-center justify-between p-4 border-b shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Risk Quadrant Scheduler</h1>
        <Button onClick={() => handleOpenModal()}>
           <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </header>

       {/* Main Content Area */}
      <main className="flex-grow overflow-auto">
         {isLoading ? (
             // Skeleton Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
                        <Skeleton className="h-6 w-3/5 rounded" />
                        <Skeleton className="h-4 w-4/5 rounded" />
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-16 w-full rounded" />
                            <Skeleton className="h-16 w-full rounded" />
                        </div>
                    </div>
                ))}
            </div>
         ) : (
             // Actual Matrix View
             <MatrixView
                 tasks={tasks}
                 onToggleComplete={toggleTaskComplete}
                 onEditTask={handleOpenModal} // Pass the function directly
                 onDeleteTask={handleDeleteTask}
            />
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
