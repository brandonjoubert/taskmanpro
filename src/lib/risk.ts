import { Impact, RiskLevel, riskLevelConfig } from './constants'; // Removed Likelihood
import type { Task } from '@/interfaces/task';

/**
 * Calculates the RiskLevel based on Impact.
 * Assumes a simplified model where likelihood is implicitly high or not considered.
 * Customize this logic as needed.
 */
export function calculateRiskLevel(impact: Impact): RiskLevel {
  switch (impact) {
      case Impact.High:
          return RiskLevel.Critical; // High impact alone is considered critical
      case Impact.Medium:
          return RiskLevel.High; // Medium impact is considered high risk
      case Impact.Low:
          return RiskLevel.Medium; // Low impact is considered medium risk
      default:
          return RiskLevel.Low; // Fallback, though should not happen with enum
  }
}

/**
 * Gets the display configuration (color, icon, label) for a given RiskLevel.
 */
export function getRiskDisplayConfig(riskLevel: RiskLevel) {
  return riskLevelConfig[riskLevel];
}

/**
 * Updates the risk level of a task based on its impact.
 */
export function updateTaskRiskLevel<T extends Task>(task: T): T {
  return {
    ...task,
    riskLevel: calculateRiskLevel(task.impact),
  };
}
