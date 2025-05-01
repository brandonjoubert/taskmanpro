import { z } from 'zod';
import { Quadrant, Impact, Frequency } from '@/lib/constants'; // Removed Likelihood

export const taskFormSchema = z.object({
  id: z.string().optional(), // Optional for creation, required for update
  title: z.string().min(1, { message: 'Title is required.' }).max(100, { message: 'Title must be 100 characters or less.' }),
  description: z.string().max(500, { message: 'Description must be 500 characters or less.' }).optional(),
  dueDate: z.date().nullable().optional(),
  quadrant: z.nativeEnum(Quadrant, { errorMap: () => ({ message: 'Please select a quadrant.' }) }),
  // likelihood: z.nativeEnum(Likelihood, { errorMap: () => ({ message: 'Please select likelihood.' }) }), // Removed likelihood
  impact: z.nativeEnum(Impact, { errorMap: () => ({ message: 'Please select impact.' }) }),

  // Recurrence fields
  recurring: z.boolean().default(false).optional(),
  frequency: z.nativeEnum(Frequency).nullable().optional(),
  recurringUntil: z.date().nullable().optional(),

  // isComplete and riskLevel will be handled separately or derived
})
.superRefine((data, ctx) => {
    // If recurring is true, frequency is required
    if (data.recurring && !data.frequency) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Frequency is required for recurring tasks.',
            path: ['frequency'],
        });
    }
    // If recurring is true, dueDate is required (can't recur without a starting date)
    if (data.recurring && !data.dueDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Due date is required for recurring tasks.',
            path: ['dueDate'],
        });
    }
    // recurringUntil date must be after the dueDate if both are set
    if (data.recurring && data.dueDate && data.recurringUntil && data.recurringUntil <= data.dueDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Recurring end date must be after the due date.',
            path: ['recurringUntil'],
        });
    }
    // If not recurring, frequency and recurringUntil should ideally be null/undefined (though optional handles this)
    // We can enforce clearing them here if needed, but the form logic should handle it too.
});


export type TaskFormData = z.infer<typeof taskFormSchema>;
