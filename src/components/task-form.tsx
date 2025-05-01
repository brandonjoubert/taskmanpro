'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Label } from '@/components/ui/label'; // Import Label for Checkbox
import { cn } from '@/lib/utils';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Quadrant, Likelihood, Impact, Frequency, quadrantConfig, frequencyConfig } from '@/lib/constants'; // Import Frequency and config
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
      recurring: initialData?.recurring || false,
      frequency: initialData?.frequency || null,
      recurringUntil: initialData?.recurringUntil || null,
    },
  });

  // Watch the 'recurring' field to conditionally show/hide frequency and recurringUntil fields
  const isRecurring = useWatch({
      control: form.control,
      name: 'recurring',
      defaultValue: initialData?.recurring || false
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
          recurring: initialData.recurring,
          frequency: initialData.frequency || null,
          recurringUntil: initialData.recurringUntil || null,
        });
      } else {
          // Ensure defaults are applied correctly for new tasks on client
          form.reset({
              title: '',
              description: '',
              dueDate: null,
              quadrant: Quadrant.Decide,
              likelihood: Likelihood.Low,
              impact: Impact.Low,
              recurring: false,
              frequency: null,
              recurringUntil: null,
            });
      }
   }, [initialData, form]);


  const handleFormSubmit = (data: TaskFormData) => {
      const submitData: TaskFormData = {
          ...data,
          id: initialData?.id, // Include ID if editing
          // Ensure frequency and recurringUntil are null if not recurring
          frequency: data.recurring ? data.frequency : null,
          recurringUntil: data.recurring ? data.recurringUntil : null,
      };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* --- Standard Task Fields --- */}
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
                <Textarea placeholder="Add more details about the task..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date {isRecurring ? '*' : ''}</FormLabel> {/* Add asterisk if recurring */}
                   <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined} // Handle null
                          onSelect={(date) => field.onChange(date ?? null)} // Ensure null is passed if cleared
                          // Allow past dates if editing a recurring task? Maybe not needed.
                          // disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                   {isRecurring && !field.value && <FormDescription className="text-destructive">Due date is required for recurring tasks.</FormDescription>}
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
        </div>

        {/* --- Risk Assessment Fields --- */}
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
                      className="flex flex-wrap gap-x-4 gap-y-2" // Use flex-wrap for better responsiveness
                    >
                      {Object.values(Likelihood).map((level) => (
                         <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                             <FormControl>
                               <RadioGroupItem value={level} id={`likelihood-${level}`} />
                             </FormControl>
                             <Label htmlFor={`likelihood-${level}`} className="font-normal">{level}</Label>
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
                      className="flex flex-wrap gap-x-4 gap-y-2" // Use flex-wrap
                    >
                       {Object.values(Impact).map((level) => (
                         <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                             <FormControl>
                               <RadioGroupItem value={level} id={`impact-${level}`} />
                             </FormControl>
                             <Label htmlFor={`impact-${level}`} className="font-normal">{level}</Label>
                         </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* --- Recurrence Fields --- */}
        <FormField
            control={form.control}
            name="recurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false} // Ensure boolean
                    onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked); // Ensure boolean value
                        field.onChange(isChecked);
                        // Optionally reset frequency and recurringUntil when unchecked
                        if (!isChecked) {
                            form.setValue('frequency', null);
                            form.setValue('recurringUntil', null);
                        } else if (!form.getValues('dueDate')) {
                            // If checking and no due date, maybe prompt user or show validation?
                             form.trigger('dueDate'); // Trigger validation
                        }
                    }}
                    id="recurring-checkbox"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label htmlFor="recurring-checkbox">
                    Make this task recurring?
                  </Label>
                  <FormDescription>
                    If checked, specify the frequency below. Requires a due date.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {isRecurring && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 ml-4"> {/* Indent recurring options */}
                <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Frequency *</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value as Frequency ?? null)} // Ensure correct type or null
                                value={field.value ?? ""} // Handle null value for Select
                                // defaultValue={field.value ?? undefined} // Handle null default
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(Frequency).map((freq) => (
                                        <SelectItem key={freq} value={freq}>
                                            {frequencyConfig[freq].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             {!field.value && <FormDescription className="text-destructive">Frequency is required.</FormDescription>}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="recurringUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Recur Until (Optional)</FormLabel>
                       <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Never</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined} // Handle null
                              onSelect={(date) => field.onChange(date ?? null)} // Ensure null is passed if cleared
                              disabled={(date) => {
                                const dueDate = form.getValues('dueDate');
                                // Disable dates on or before the due date if due date exists
                                return dueDate ? date <= dueDate : false;
                              }}
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
                            aria-label="Clear recurring end date"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                       <FormDescription>Leave blank for the task to recur indefinitely.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
          )}


        {/* --- Submit/Cancel Buttons --- */}
        <div className="flex justify-end space-x-2 pt-4">
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
