import { Quadrant, impactScoreConfig, quadrantConfig } from './constants';
import type { Task } from '@/interfaces/task';

/**
 * Calculates the Impact Score (1-5) based on the monetary impact value.
 * Uses the ranges defined in constants.ts.
 */
export function calculateImpactScore(monetaryImpact: number): number {
  // Find the first configuration where the monetary impact is less than the upper bound
  // or where the upper bound is null (infinity).
  const config = impactScoreConfig.find(
    (level) => monetaryImpact < (level.upperBound ?? Infinity)
  );

  // Default to the lowest score if something goes wrong (e.g., negative impact)
  return config?.score ?? 1;
}

/**
 * Gets the score associated with a given Quadrant.
 */
export function getQuadrantScore(quadrant: Quadrant): number {
  return quadrantConfig[quadrant].score;
}

/**
 * Calculates the final Risk Value by multiplying Impact Score and Quadrant Score.
 */
export function calculateRiskValue(monetaryImpact: number, quadrant: Quadrant): number {
  const impactScore = calculateImpactScore(monetaryImpact);
  const quadrantScore = getQuadrantScore(quadrant);
  return impactScore * quadrantScore;
}


/**
 * Updates the risk value of a task based on its monetary impact and quadrant.
 */
export function updateTaskRiskValue<T extends Task>(task: T): T {
  return {
    ...task,
    riskValue: calculateRiskValue(task.monetaryImpact, task.quadrant),
  };
}

// Removed previous functions related to Likelihood and RiskLevel
