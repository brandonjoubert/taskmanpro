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
  BiAnnually = 'BiAnnually', // Every 2 years (or twice a year? Clarify - assuming every 2 years)
                             // Let's assume BiAnnually means every 2 years for now.
                             // If it means twice a year (every 6 months), adjust logic.
}


// Define display properties (e.g., colors, icons) for each level/quadrant
// Tailwind classes are used for colors to respect the theme

export const quadrantConfig: Record<Quadrant, { title: string; description: string }> = {
  [Quadrant.Do]: { title: 'Do', description: 'Urgent & Important' },
  [Quadrant.Decide]: { title: 'Decide', description: 'Important, Not Urgent' },
  [Quadrant.Delegate]: { title: 'Delegate', description: 'Urgent, Not Important' },
  [Quadrant.Delete]: { title: 'Delete', description: 'Not Urgent, Not Important' },
};

export const riskLevelConfig: Record<RiskLevel, { label: string; colorClass: string; icon?: React.ComponentType<{ className?: string }> }> = {
  [RiskLevel.Low]: { label: 'Low Risk', colorClass: 'bg-green-500' }, // Using direct colors for distinction, consider theme vars if needed
  [RiskLevel.Medium]: { label: 'Medium Risk', colorClass: 'bg-yellow-500' },
  [RiskLevel.High]: { label: 'High Risk', colorClass: 'bg-orange-500' },
  [RiskLevel.Critical]: { label: 'Critical Risk', colorClass: 'bg-red-600' }, // Use accent potentially: 'bg-accent'
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
