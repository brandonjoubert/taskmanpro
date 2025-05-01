import { z } from 'zod';
import { Quadrant, Likelihood, Impact } from '@/lib/constants';

export const taskFormSchema = z.object({
  id: z.string().optional(), // Optional for creation, required for update
  title: z.string().min(1, { message: 'Title is required.' }).max(100, { message: 'Title must be 100 characters or less.' }),
  description: z.string().max(500, { message: 'Description must be 500 characters or less.' }).optional(),
  dueDate: z.date().nullable().optional(),
  quadrant: z.nativeEnum(Quadrant, { errorMap: () => ({ message: 'Please select a quadrant.' }) }),
  likelihood: z.nativeEnum(Likelihood, { errorMap: () => ({ message: 'Please select likelihood.' }) }),
  impact: z.nativeEnum(Impact, { errorMap: () => ({ message: 'Please select impact.' }) }),
  // isComplete and riskLevel will be handled separately or derived
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
