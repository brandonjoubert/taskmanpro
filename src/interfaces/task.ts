import type { Quadrant, Likelihood, Impact, RiskLevel, Frequency } from '@/lib/constants';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  quadrant: Quadrant;
  likelihood: Likelihood;
  impact: Impact;
  riskLevel: RiskLevel;
  isComplete: boolean;
  createdAt: Date;
  completedAt?: Date | null; // Added field to track completion time

  // Recurrence fields
  recurring: boolean; // Is this task recurring?
  frequency?: Frequency | null; // How often does it recur? (null if not recurring)
  recurringUntil?: Date | null; // Date until which it recurs (null for indefinite)

  // Optional properties for future expansion
  // recurringRule?: string; // e.g., 'daily', 'weekly', 'monthly:15'
  // tags?: string[];
}

