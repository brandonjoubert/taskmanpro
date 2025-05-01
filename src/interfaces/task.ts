import type { Quadrant, Likelihood, Impact, RiskLevel } from '@/lib/constants';

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
  // Optional properties for future expansion
  // recurringRule?: string; // e.g., 'daily', 'weekly', 'monthly:15'
  // tags?: string[];
}
