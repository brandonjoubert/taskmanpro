import { Quadrant, getImpactScoreConfig, quadrantConfig, CURRENCY_SYMBOL } from './constants';
import type { Task } from '@/interfaces/task';

/**
 * Calculates the Impact Score (1-5) based on the monetary impact value.
 * Uses the ranges defined in constants.ts.
 * Returns both the score and the dynamically generated label.
 */
export function calculateImpactScore(monetaryImpact: number, currencySymbol: string = CURRENCY_SYMBOL): { score: number; label: string } {
  const impactConfig = getImpactScoreConfig(currencySymbol);
  // Find the first configuration where the monetary impact is less than the upper bound
  // or where the upper bound is null (infinity).
  const config = impactConfig.find(
    (level) => monetaryImpact < (level.upperBound ?? Infinity)
  );

  // Default to the lowest score if something goes wrong (e.g., negative impact)
  return {
      score: config?.score ?? impactConfig[0].score,
      label: config?.label ?? impactConfig[0].label
  };
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
  // We only need the score part for the risk value calculation
  const impactScore = calculateImpactScore(monetaryImpact).score;
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
