

export enum Quadrant {
  Do = 'Do', // Urgent & Important
  Decide = 'Decide', // Important & Not Urgent
  Delegate = 'Delegate', // Urgent & Not Important
  Delete = 'Delete', // Not Urgent & Not Important
}

// Enum for recurrence frequency
export enum Frequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  BiMonthly = 'BiMonthly', // Every 2 months
  Annually = 'Annually',
  BiAnnually = 'BiAnnually', // Every 2 years
}


// --- Configuration ---

export const CURRENCY_SYMBOL = '$'; // Default currency symbol

// Define display properties for quadrants
export const quadrantConfig: Record<Quadrant, { title: string; description: string; score: number }> = {
  [Quadrant.Do]: { title: 'Do', description: 'Urgent & Important', score: 4 },
  [Quadrant.Decide]: { title: 'Decide', description: 'Important, Not Urgent', score: 3 },
  [Quadrant.Delegate]: { title: 'Delegate', description: 'Urgent, Not Important', score: 2 },
  [Quadrant.Delete]: { title: 'Delete', description: 'Not Urgent, Not Important', score: 1 },
};

// Define monetary impact levels and their scores as a function
// The upper bound is exclusive (e.g., 0-100 means >= 0 AND < 100)
// This allows dynamic label generation based on the currency symbol
export const getImpactScoreConfig = (currencySymbol: string = CURRENCY_SYMBOL): Array<{ upperBound: number | null; score: number; label: string }> => [
    { upperBound: 100, score: 1, label: `Very Low (< ${currencySymbol}100)` },    // Score 1 for impact < 100
    { upperBound: 1000, score: 2, label: `Low (${currencySymbol}100 - ${currencySymbol}999)` },   // Score 2 for impact 100 - 999
    { upperBound: 5000, score: 3, label: `Medium (${currencySymbol}1k - ${currencySymbol}5k)` },  // Score 3 for impact 1000 - 4999
    { upperBound: 20000, score: 4, label: `High (${currencySymbol}5k - ${currencySymbol}20k)` },  // Score 4 for impact 5000 - 19999
    { upperBound: null, score: 5, label: `Critical (>= ${currencySymbol}20k)` }, // Score 5 for impact >= 20000 (null upperBound means infinity)
].sort((a, b) => a.score - b.score); // Ensure sorted by score for easy lookup

// Export the default configuration using the default symbol
export const impactScoreConfig = getImpactScoreConfig();


// Display names for Frequency enum
export const frequencyConfig: Record<Frequency, { label: string }> = {
    [Frequency.Daily]: { label: 'Daily' },
    [Frequency.Weekly]: { label: 'Weekly' },
    [Frequency.Monthly]: { label: 'Monthly' },
    [Frequency.BiMonthly]: { label: 'Every 2 Months' },
    [Frequency.Annually]: { label: 'Annually' },
    [Frequency.BiAnnually]: { label: 'Every 2 Years' },
};


// Removed RiskLevel enum and riskLevelConfig
