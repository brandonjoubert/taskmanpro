import { Likelihood, Impact, RiskLevel, riskLevelConfig } from './constants';
import type { Task } from '@/interfaces/task';

/**
 * Calculates the RiskLevel based on Likelihood and Impact.
 * Customize this logic as needed.
 */
export function calculateRiskLevel(likelihood: Likelihood, impact: Impact): RiskLevel {
  if (likelihood === Likelihood.High && impact === Impact.High) {
    return RiskLevel.Critical;
  }
  if (likelihood === Likelihood.High || impact === Impact.High) {
    return RiskLevel.High;
  }
  if (likelihood === Likelihood.Medium && impact === Impact.Medium) {
    return RiskLevel.High;
  }
    if (likelihood === Likelihood.Medium || impact === Impact.Medium) {
    return RiskLevel.Medium;
  }
  return RiskLevel.Low;
}

/**
 * Gets the display configuration (color, icon, label) for a given RiskLevel.
 */
export function getRiskDisplayConfig(riskLevel: RiskLevel) {
  return riskLevelConfig[riskLevel];
}

/**
 * Updates the risk level of a task based on its likelihood and impact.
 */
export function updateTaskRiskLevel<T extends Task>(task: T): T {
  return {
    ...task,
    riskLevel: calculateRiskLevel(task.likelihood, task.impact),
  };
}
