'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskFormSchema, type TaskFormData } from './task-form-schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Quadrant, Likelihood, Impact, quadrantConfig } from '@/lib/constants';
import type { Task } from '@/interfaces/task';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Task | null; // Task for editing, null/undefined for creating
  onCancel?: () => void;
  submitButtonText?: string;
}

export function TaskForm({ onSubmit, initialData = null, onCancel, submitButtonText = "Save Task" }: TaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate || null,
      quadrant: initialData?.quadrant || Quadrant.Decide, // Sensible default
      likelihood: initialData?.likelihood || Likelihood.Low,
      impact: initialData?.impact || Impact.Low,
    },
  });

   // Handle hydration mismatch for defaultValues potentially differing server/client
   useEffect(() => {
      if (initialData) {
        form.reset({
          id: initialData.id,
          title: initialData.title,
          description: initialData.description || '',
          dueDate: initialData.dueDate || null,
          quadrant: initialData.quadrant,
          likelihood: initialData.likelihood,
          impact: initialData.impact,
        });
      }
   }, [initialData, form]);


  const handleFormSubmit = (data: TaskFormData) => {
      const submitData: TaskFormData = {
          ...data,
          id: initialData?.id // Include ID if editing
      }
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Prepare presentation slides" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about the task..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
               <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                 {field.value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => field.onChange(null)}
                    aria-label="Clear date"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quadrant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eisenhower Quadrant *</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                 <FormControl>
                   <SelectTrigger>
                     <SelectValue placeholder="Select the urgency and importance" />
                   </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                   {Object.values(Quadrant).map((quad) => (
                     <SelectItem key={quad} value={quad}>
                       {quadrantConfig[quad].title} ({quadrantConfig[quad].description})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField
              control={form.control}
              name="likelihood"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Likelihood (if not done/fails) *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {Object.values(Likelihood).map((level) => (
                         <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                             <FormControl>
                               <RadioGroupItem value={level} />
                             </FormControl>
                             <FormLabel className="font-normal">{level}</FormLabel>
                         </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Impact (if not done/fails) *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                       {Object.values(Impact).map((level) => (
                         <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                             <FormControl>
                               <RadioGroupItem value={level} />
                             </FormControl>
                             <FormLabel className="font-normal">{level}</FormLabel>
                         </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
