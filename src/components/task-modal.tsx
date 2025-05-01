'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Optional for buttons inside if needed
} from "@/components/ui/dialog";
import { TaskForm } from './task-form';
import type { TaskFormData } from './task-form-schema';
import type { Task } from '@/interfaces/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialTaskData?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSubmit, initialTaskData }: TaskModalProps) {
  const isEditing = !!initialTaskData;
  const title = isEditing ? "Edit Task" : "Add New Task";
  const description = isEditing
    ? "Update the details of your task."
    : "Fill in the details for your new task, including its quadrant and risk level.";

  // Function to handle submission and then close the modal
  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onClose(); // Close modal after successful submission logic is handled by parent
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]"> {/* Adjust width as needed */}
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
            />
        </div>
         {/* DialogFooter can be used if buttons aren't part of TaskForm
         <DialogFooter>
             Add buttons here if needed
         </DialogFooter>
         */}
      </DialogContent>
    </Dialog>
  );
}
