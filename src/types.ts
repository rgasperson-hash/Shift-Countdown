export type DayOfWeek = 
  | 'Saturday' 
  | 'Sunday' 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export interface WorkWeekConfig {
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  targetWeeklyHours: number; // typically 40
}

export interface ShiftPunches {
  priorHours: number; // hours worked earlier in the week before today
  punchIn: string; // "HH:MM" 24h format, e.g. "08:00"
  lunchOut: string; // "HH:MM", e.g. "12:00"
  lunchIn: string; // "HH:MM", e.g. "12:30"
  plannedLunchMinutes: number; // e.g. 30 if lunch punches not yet entered
}

export interface CalculationResult {
  // Target
  targetWeeklySeconds: number;
  priorSeconds: number;
  secondsNeededToday: number;
  
  // Today's segments (in seconds)
  morningWorkedSeconds: number;
  lunchDurationSeconds: number;
  afternoonWorkedSeconds: number;
  todayWorkedSeconds: number;
  
  // Total so far
  totalWorkedSeconds: number;
  remainingSecondsUntil40: number;
  
  // Clock-out time
  leaveTimeDate: Date | null;
  leaveTimeString: string;
  leaveTime12h: string;
  overtimeStartTimeString: string;
  overtimeStartTime12h: string;
  
  // Status flags
  hasPunchedIn: boolean;
  isOnLunch: boolean;
  hasPunchedBackFromLunch: boolean;
  isOvertime: boolean;
  isWithin15Min: boolean;
  isWithin5Min: boolean;
  isExactlyTarget: boolean;
  progressPercent: number;
}
