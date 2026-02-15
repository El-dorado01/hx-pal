/**
 * Parse duration strings to comparable numeric values (in days)
 * Handles various formats: days, weeks, months, years
 * Returns null for uncertain/unknown durations
 */

export interface ParsedDuration {
  value: number | null; // null for uncertain durations
  originalString: string;
  isUncertain: boolean;
}

const UNCERTAIN_KEYWORDS = [
  'not sure',
  'unsure',
  'unknown',
  'uncertain',
  "don't know",
  'dont know',
  'unclear',
  '?',
];

const TIME_UNITS: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
  hour: 1 / 24,
  hours: 1 / 24,
  minute: 1 / (24 * 60),
  minutes: 1 / (24 * 60),
};

export function parseDuration(durationString: string): ParsedDuration {
  const normalized = durationString.toLowerCase().trim();

  // Check for uncertain keywords
  const isUncertain = UNCERTAIN_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );

  if (isUncertain) {
    return {
      value: null,
      originalString: durationString,
      isUncertain: true,
    };
  }

  // Try to extract number and unit
  // Matches patterns like "3 days", "2 weeks", "1 month", etc.
  const match = normalized.match(/(\d+\.?\d*)\s*(\w+)/);

  if (!match) {
    // If no match, treat as uncertain
    return {
      value: null,
      originalString: durationString,
      isUncertain: true,
    };
  }

  const [, numberStr, unit] = match;
  const number = parseFloat(numberStr);

  // Find matching time unit
  const multiplier = TIME_UNITS[unit] || TIME_UNITS[unit + 's'] || null;

  if (multiplier === null) {
    // Unknown unit, treat as uncertain
    return {
      value: null,
      originalString: durationString,
      isUncertain: true,
    };
  }

  return {
    value: number * multiplier,
    originalString: durationString,
    isUncertain: false,
  };
}

/**
 * Sort complaints by duration (earliest first, uncertain last)
 */
export function sortComplaintsByDuration<
  T extends { duration: string; order?: number },
>(complaints: T[]): T[] {
  return [...complaints].sort((a, b) => {
    const aDuration = parseDuration(a.duration);
    const bDuration = parseDuration(b.duration);

    // Uncertain durations go last
    if (aDuration.isUncertain && !bDuration.isUncertain) return 1;
    if (!aDuration.isUncertain && bDuration.isUncertain) return -1;
    if (aDuration.isUncertain && bDuration.isUncertain) {
      // Both uncertain, maintain original order
      return (a.order || 0) - (b.order || 0);
    }

    // Both have values, sort by duration (longest first = earliest onset)
    const aValue = aDuration.value || 0;
    const bValue = bDuration.value || 0;

    if (aValue !== bValue) {
      return bValue - aValue; // Descending order (longest duration first)
    }

    // Same duration, maintain original order
    return (a.order || 0) - (b.order || 0);
  });
}
