
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

// Updated riskLevelConfig with contrasting text/background and borders based on user request
// Low = Yellow, Medium/High = Orange, Critical = Green
export const riskLevelConfig: Record<RiskLevel, { label: string; quantity: number; colorClass: string; icon?: React.ComponentType<{ className?: string }> }> = {
  [RiskLevel.Low]: { label: 'Low Risk', quantity: 1, colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700/50' }, // Yellow
  [RiskLevel.Medium]: { label: 'Medium Risk', quantity: 2, colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-200 border-orange-200 dark:border-orange-700/50' }, // Orange
  [RiskLevel.High]: { label: 'High Risk', quantity: 3, colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-200 border-orange-200 dark:border-orange-700/50' }, // Orange
  [RiskLevel.Critical]: { label: 'Critical Risk', quantity: 4, colorClass: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200 border-green-200 dark:border-green-700/50' }, // Green
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
