import { ShiftPunches, CalculationResult, WorkWeekConfig } from '../types';

/**
 * Parses "HH:MM" string to seconds from midnight.
 * Returns null if invalid or empty.
 */
export function timeStringToSeconds(timeStr: string): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 3600 + minutes * 60;
}

/**
 * Converts seconds from midnight to a 24-hour "HH:MM" string.
 */
export function secondsToTimeString(totalSeconds: number): string {
  const normalized = Math.max(0, Math.floor(totalSeconds)) % (24 * 3600);
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts seconds from midnight to a 12-hour "H:MM:SS AM/PM" or "H:MM AM/PM" string.
 */
export function secondsTo12HourString(totalSeconds: number, includeSeconds = true): string {
  const normalized = Math.max(0, Math.floor(totalSeconds)) % (24 * 3600);
  const hours24 = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const seconds = normalized % 60;
  
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');

  return includeSeconds 
    ? `${hours12}:${minStr}:${secStr} ${period}`
    : `${hours12}:${minStr} ${period}`;
}

/**
 * Formats a duration in seconds into "HHh MMm SSs" or "-HHh MMm SSs"
 */
export function formatDuration(seconds: number, showSign = false): string {
  const isNegative = seconds < 0;
  const absSec = Math.abs(Math.floor(seconds));
  
  const h = Math.floor(absSec / 3600);
  const m = Math.floor((absSec % 3600) / 60);
  const s = absSec % 60;

  const sign = isNegative ? '-' : showSign ? '+' : '';
  return `${sign}${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Formats a duration into standard digital clock format: "00:00:00"
 */
export function formatDigitalClock(seconds: number): {
  isNegative: boolean;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const isNegative = seconds < 0;
  const absSec = Math.abs(Math.floor(seconds));
  
  const h = Math.floor(absSec / 3600);
  const m = Math.floor((absSec % 3600) / 60);
  const s = absSec % 60;

  return {
    isNegative,
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  };
}

/**
 * Converts decimal hours to hours & minutes string, e.g. 7.75 -> "7h 45m"
 */
export function decimalHoursToHhMm(decimalHours: number): string {
  const totalMins = Math.round(decimalHours * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
}

/**
 * Gets the current time of day in seconds from midnight.
 */
export function getCurrentTimeSeconds(nowDate: Date = new Date()): number {
  return (
    nowDate.getHours() * 3600 +
    nowDate.getMinutes() * 60 +
    nowDate.getSeconds()
  );
}

/**
 * Master calculation function that calculates live hours worked and exact clock out time.
 */
export function calculateShift(
  punches: ShiftPunches,
  config: WorkWeekConfig,
  currentDate: Date = new Date()
): CalculationResult {
  const targetWeeklySeconds = config.targetWeeklyHours * 3600;
  const priorSeconds = Math.max(0, punches.priorHours * 3600);
  const secondsNeededToday = Math.max(0, targetWeeklySeconds - priorSeconds);

  const nowSeconds = getCurrentTimeSeconds(currentDate);

  const punchInSec = timeStringToSeconds(punches.punchIn);
  const lunchOutSec = timeStringToSeconds(punches.lunchOut);
  const lunchInSec = timeStringToSeconds(punches.lunchIn);

  const hasPunchedIn = punchInSec !== null;
  const hasPunchedLunchOut = lunchOutSec !== null;
  const hasPunchedBackFromLunch = lunchInSec !== null;

  // Determine if currently on lunch
  const isOnLunch = hasPunchedLunchOut && !hasPunchedBackFromLunch && (nowSeconds >= (lunchOutSec || 0));

  // 1. Calculate Morning Worked Seconds
  let morningWorkedSeconds = 0;
  if (hasPunchedIn) {
    if (hasPunchedLunchOut) {
      morningWorkedSeconds = Math.max(0, lunchOutSec! - punchInSec!);
    } else {
      // Still in morning shift
      morningWorkedSeconds = Math.max(0, nowSeconds - punchInSec!);
    }
  }

  // 2. Lunch duration
  let lunchDurationSeconds = 0;
  if (hasPunchedLunchOut && hasPunchedBackFromLunch) {
    lunchDurationSeconds = Math.max(0, lunchInSec! - lunchOutSec!);
  } else if (hasPunchedLunchOut && !hasPunchedBackFromLunch) {
    lunchDurationSeconds = Math.max(0, nowSeconds - lunchOutSec!);
  } else {
    // Planned lunch
    lunchDurationSeconds = Math.max(0, (punches.plannedLunchMinutes || 30) * 60);
  }

  // 3. Afternoon Worked Seconds
  let afternoonWorkedSeconds = 0;
  if (hasPunchedBackFromLunch) {
    afternoonWorkedSeconds = Math.max(0, nowSeconds - lunchInSec!);
  }

  // 4. Today Worked Seconds up to this moment
  let todayWorkedSeconds = 0;
  if (hasPunchedIn) {
    if (hasPunchedBackFromLunch) {
      todayWorkedSeconds = morningWorkedSeconds + afternoonWorkedSeconds;
    } else if (hasPunchedLunchOut) {
      todayWorkedSeconds = morningWorkedSeconds;
    } else {
      todayWorkedSeconds = morningWorkedSeconds;
    }
  }

  // 5. Total Worked this week so far
  const totalWorkedSeconds = priorSeconds + todayWorkedSeconds;
  const remainingSecondsUntil40 = targetWeeklySeconds - totalWorkedSeconds;

  // 6. Calculate Projected Clock Out Time
  let leaveTimeSec: number | null = null;

  if (hasPunchedIn) {
    if (hasPunchedBackFromLunch) {
      // User is in afternoon shift
      // Needed in afternoon = secondsNeededToday - morningWorkedSeconds
      const afternoonNeeded = Math.max(0, secondsNeededToday - morningWorkedSeconds);
      leaveTimeSec = lunchInSec! + afternoonNeeded;
    } else if (hasPunchedLunchOut) {
      // User is currently at lunch
      const afternoonNeeded = Math.max(0, secondsNeededToday - morningWorkedSeconds);
      // If lunch has already lasted longer than planned, use current time as resume
      const plannedLunchSec = Math.max(lunchDurationSeconds, (punches.plannedLunchMinutes || 30) * 60);
      const estimatedLunchIn = lunchOutSec! + plannedLunchSec;
      leaveTimeSec = estimatedLunchIn + afternoonNeeded;
    } else {
      // User hasn't taken lunch yet
      // Projected leave time = punchIn + secondsNeededToday + planned lunch
      const plannedLunchSec = (punches.plannedLunchMinutes || 30) * 60;
      leaveTimeSec = punchInSec! + secondsNeededToday + plannedLunchSec;
    }
  }

  let leaveTimeString = '--:--';
  let leaveTime12h = '--:--';
  let overtimeStartTimeString = '--:--';
  let overtimeStartTime12h = '--:--';
  let leaveTimeDate: Date | null = null;

  if (leaveTimeSec !== null) {
    leaveTimeString = secondsToTimeString(leaveTimeSec);
    leaveTime12h = secondsTo12HourString(leaveTimeSec, false);
    
    // Exactly 1 minute (60 seconds) later is the hard overtime threshold (40h 01m)
    const overtimeSec = leaveTimeSec + 60;
    overtimeStartTimeString = secondsToTimeString(overtimeSec);
    overtimeStartTime12h = secondsTo12HourString(overtimeSec, false);

    leaveTimeDate = new Date(currentDate);
    leaveTimeDate.setHours(0, 0, 0, 0);
    leaveTimeDate.setSeconds(leaveTimeSec);
  }

  const isOvertime = remainingSecondsUntil40 <= 0;
  const isWithin15Min = !isOvertime && remainingSecondsUntil40 <= 15 * 60 && hasPunchedIn;
  const isWithin5Min = !isOvertime && remainingSecondsUntil40 <= 5 * 60 && hasPunchedIn;
  const isExactlyTarget = Math.abs(remainingSecondsUntil40) < 5;

  const progressPercent = Math.min(
    100,
    Math.max(0, (totalWorkedSeconds / targetWeeklySeconds) * 100)
  );

  return {
    targetWeeklySeconds,
    priorSeconds,
    secondsNeededToday,
    morningWorkedSeconds,
    lunchDurationSeconds,
    afternoonWorkedSeconds,
    todayWorkedSeconds,
    totalWorkedSeconds,
    remainingSecondsUntil40,
    leaveTimeDate,
    leaveTimeString,
    leaveTime12h,
    overtimeStartTimeString,
    overtimeStartTime12h,
    hasPunchedIn,
    isOnLunch,
    hasPunchedBackFromLunch,
    isOvertime,
    isWithin15Min,
    isWithin5Min,
    isExactlyTarget,
    progressPercent,
  };
}

/**
 * Returns current day of week name (e.g. "Friday")
 */
export function getCurrentDayName(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Calculates which day of the pay week today is, given startDay.
 * For example: if startDay is Saturday and today is Friday, returns { dayNumber: 7, isLastDay: true }
 */
export function getWorkWeekDayStatus(startDay: string, todayDate: Date = new Date()): {
  dayName: string;
  dayIndex: number; // 1 to 7
  isLastDay: boolean;
} {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayName = getCurrentDayName(todayDate);
  
  const startIndex = days.indexOf(startDay);
  const todayIndexInDays = days.indexOf(todayName);
  
  let dayOffset = todayIndexInDays - startIndex;
  if (dayOffset < 0) dayOffset += 7;

  const dayIndex = dayOffset + 1; // 1-indexed (1 to 7)
  const isLastDay = dayIndex === 7;

  return {
    dayName: todayName,
    dayIndex,
    isLastDay,
  };
}
