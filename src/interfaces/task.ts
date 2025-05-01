import type { Quadrant, Frequency } from '@/lib/constants';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  quadrant: Quadrant;
  monetaryImpact: number; // Monetary value of impact if task fails or is not done
  riskValue: number; // Calculated Risk Value (Impact Score * Quadrant Score)
  isComplete: boolean;
  createdAt: Date;
  completedAt?: Date | null; // Added field to track completion time

  // Recurrence fields
  recurring: boolean; // Is this task recurring?
  frequency?: Frequency | null; // How often does it recur? (null if not recurring)
  recurringUntil?: Date | null; // Date until which it recurs (null for indefinite)

  // Removed impact: Impact;
  // Removed riskLevel: RiskLevel;

  // Optional properties for future expansion
  // recurringRule?: string; // e.g., 'daily', 'weekly', 'monthly:15'
  // tags?: string[];
}
