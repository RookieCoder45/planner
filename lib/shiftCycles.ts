/**
 * Shift Cycle Logic
 * 
 * You can define your shift patterns here.
 * For example: 6 on, 6 off rotation.
 */

const anchorDate = new Date("2026-01-05");

export const SHIFT_PATTERNS = {
  'I Shift': {
    // Define pattern start date and sequence
    name: 'I',
    start: anchorDate,
    sequence: [ 'Night', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off', 'Off', 'Off','Day', 'Day', 'Day',]
  },
  'J Shift': {
    // Define pattern start date and sequence
    name: 'J',
    start: anchorDate,
    sequence: ['Day', 'Day', 'Day', 'Night', 'Night', 'Night', 'Off', 'Off', 'Off','Off', 'Off', 'Off', ]
  },
  'K Shift': {
    name: 'K',
    // Define pattern start date and sequence
    start: anchorDate,
    sequence: [ 'Off', 'Off', 'Off', 'Day', 'Day', 'Day', 'Night', 'Night', 'Night','Off', 'Off', 'Off',]
  },

  'L Shift': {
    name: 'L',
    // Define pattern start date and sequence
    start: anchorDate,
    sequence: [ 'Off', 'Off', 'Off', 'Off', 'Off', 'Off', 'Day', 'Day', 'Day','Night', 'Night', 'Night']
  },
};

export const getShiftForDate = (date: Date, shiftName: string) => {
  const pattern = SHIFT_PATTERNS[shiftName as keyof typeof SHIFT_PATTERNS];
  if (!pattern) return null;

  // Create a copy of the date to avoid side effects and reset time to midnight for accurate day difference
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const startDate = new Date(pattern.start);
  startDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const sequenceLength = pattern.sequence.length;
  const index = ((diffDays % sequenceLength) + sequenceLength) % sequenceLength;

  return pattern.sequence[index];
};
