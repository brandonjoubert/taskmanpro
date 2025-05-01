'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TaskForm } from './task-form';
import type { TaskFormData } from './task-form-schema';
import type { Task } from '@/interfaces/task';
// import { CURRENCY_SYMBOL } from '@/lib/constants'; // Import if needed

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialTaskData?: Task | null;
  // currencySymbol?: string; // Optional: If form needs dynamic currency
}

export function TaskModal({
    isOpen,
    onClose,
    onSubmit,
    initialTaskData,
    // currencySymbol = CURRENCY_SYMBOL // Default or passed prop
}: TaskModalProps) {
  const isEditing = !!initialTaskData;
  const title = isEditing ? "Edit Task" : "Add New Task";
  const description = isEditing
    ? "Update the details of your task."
    : "Fill in the details, quadrant, and estimated monetary impact.";

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
           <TaskForm
             onSubmit={handleSubmit}
             initialData={initialTaskData}
             onCancel={onClose}
             submitButtonText={isEditing ? "Save Changes" : "Add Task"}
             // Pass currency symbol if needed by TaskForm implementation
             // currencySymbol={currencySymbol}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
