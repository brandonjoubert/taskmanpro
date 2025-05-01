
export enum Quadrant {
  Do = 'Do', // Urgent & Important
  Decide = 'Decide', // Important & Not Urgent
  Delegate = 'Delegate', // Urgent & Not Important
  Delete = 'Delete', // Not Urgent & Not Important
}

export enum Likelihood {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum Impact {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
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


// Define display properties (e.g., colors, icons) for each level/quadrant
// Tailwind classes are used for colors to respect the theme

export const quadrantConfig: Record<Quadrant, { title: string; description: string }> = {
  [Quadrant.Do]: { title: 'Do', description: 'Urgent & Important' },
  [Quadrant.Decide]: { title: 'Decide', description: 'Important, Not Urgent' },
  [Quadrant.Delegate]: { title: 'Delegate', description: 'Urgent, Not Important' },
  [Quadrant.Delete]: { title: 'Delete', description: 'Not Urgent, Not Important' },
};

// Updated riskLevelConfig with contrasting text/background and borders for better visibility
// Low = Yellow, Medium/High = Orange, Critical = Green
export const riskLevelConfig: Record<RiskLevel, { label: string; quantity: number; colorClass: string; icon?: React.ComponentType<{ className?: string }> }> = {
  [RiskLevel.Low]: { label: 'Low Risk', quantity: 1, colorClass: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800/60' }, // Yellow
  [RiskLevel.Medium]: { label: 'Medium Risk', quantity: 2, colorClass: 'bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100 border-orange-300 dark:border-orange-800/60' }, // Orange
  [RiskLevel.High]: { label: 'High Risk', quantity: 3, colorClass: 'bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100 border-orange-300 dark:border-orange-800/60' }, // Orange (Same as Medium for this scheme)
  [RiskLevel.Critical]: { label: 'Critical Risk', quantity: 4, colorClass: 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-100 border-green-300 dark:border-green-800/60' }, // Green
};


// Display names for Frequency enum
export const frequencyConfig: Record<Frequency, { label: string }> = {
    [Frequency.Daily]: { label: 'Daily' },
    [Frequency.Weekly]: { label: 'Weekly' },
    [Frequency.Monthly]: { label: 'Monthly' },
    [Frequency.BiMonthly]: { label: 'Every 2 Months' },
    [Frequency.Annually]: { label: 'Annually' },
    [Frequency.BiAnnually]: { label: 'Every 2 Years' },
};

