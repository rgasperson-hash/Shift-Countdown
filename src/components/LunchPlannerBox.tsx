import React, { useState } from 'react';
import { 
  Coffee, 
  ArrowRight, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Calculator,
  Compass
} from 'lucide-react';
import { ShiftPunches, WorkWeekConfig } from '../types';
import { 
  calculateRequiredLunchForDesiredLeave, 
  timeStringToSeconds, 
  secondsToTimeString, 
  secondsTo12HourString 
} from '../utils/timeCalculations';

interface LunchPlannerBoxProps {
  punches: ShiftPunches;
  config: WorkWeekConfig;
  onApplyLunch: (lunchMinutes: number, suggestedLunchIn?: string) => void;
}

export const LunchPlannerBox: React.FC<LunchPlannerBoxProps> = ({
  punches,
  config,
  onApplyLunch,
}) => {
  // Default to 4:30 PM (16:30) or a sensible afternoon time
  const [desiredLeaveTime, setDesiredLeaveTime] = useState<string>('16:30');
  const [applied, setApplied] = useState<boolean>(false);

  const result = calculateRequiredLunchForDesiredLeave(
    punches.punchIn,
    punches.priorHours,
    config.targetWeeklyHours,
    desiredLeaveTime,
    punches.lunchOut
  );

  const handleApply = () => {
    if (result.status === 'feasible' || result.status === 'exact_zero') {
      onApplyLunch(
        result.requiredLunchMinutes,
        result.suggestedLunchIn24h || undefined
      );
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  const handleAdjustMinutes = (deltaMins: number) => {
    const currentSec = timeStringToSeconds(desiredLeaveTime) || 16.5 * 3600;
    let newSec = currentSec + deltaMins * 60;
    if (newSec < 0) newSec += 24 * 3600;
    newSec = newSec % (24 * 3600);
    setDesiredLeaveTime(secondsToTimeString(newSec));
    setApplied(false);
  };

  const setPresetTime = (timeStr: string) => {
    setDesiredLeaveTime(timeStr);
    setApplied(false);
  };

  // Quick preset departures
  const presets = [
    { label: '3:30 PM', time: '15:30' },
    { label: '4:00 PM', time: '16:00' },
    { label: '4:30 PM', time: '16:30' },
    { label: '5:00 PM', time: '17:00' },
    { label: '5:30 PM', time: '17:30' },
  ];

  // Calculate earliest possible departure with 0 lunch
  const punchInSec = timeStringToSeconds(punches.punchIn);
  const neededTodaySec = Math.max(0, (config.targetWeeklyHours - punches.priorHours) * 3600);
  const earliestPossibleLeave12h = punchInSec 
    ? secondsTo12HourString(punchInSec + neededTodaySec, false) 
    : '--:--';

  return (
    <section className="rounded-3xl border border-teal-800/60 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Box Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm shadow-teal-500/10">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Target Departure & Lunch Calculator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                Reverse Planner
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Input the time you want to leave today — we'll calculate how long of a lunch you need to take
            </p>
          </div>
        </div>

        {punches.punchIn && (
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            In at: <span className="text-slate-200 font-medium">{secondsTo12HourString(punchInSec || 0, false)}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Input on Left, Calculated Lunch on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Desired Departure Input */}
        <div className="md:col-span-6 space-y-3.5">
          <div className="space-y-1.5">
            <label 
              htmlFor="desired-leave-input"
              className="block text-xs font-semibold text-slate-200"
            >
              What Time Do You Want to Leave Today?
            </label>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="desired-leave-input"
                  type="time"
                  value={desiredLeaveTime}
                  onChange={(e) => {
                    setDesiredLeaveTime(e.target.value);
                    setApplied(false);
                  }}
                  className="w-full h-13 rounded-2xl bg-slate-950 border border-slate-700 px-4 text-xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-center transition-all tabular-nums"
                />
              </div>

              {/* +/- 15 min quick steppers */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(15)}
                  className="min-h-[24px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
                  title="Add 15 minutes to desired leave time"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-15)}
                  className="min-h-[24px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
                  title="Subtract 15 minutes from desired leave time"
                >
                  -15m
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-0.5">
              <span>Selected Departure: <strong className="text-teal-400">{result.desiredLeaveTime12}</strong></span>
              <span>24h: {result.desiredLeaveTime24}</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 block font-medium">Quick Departure Presets:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {presets.map((p) => {
                const isSelected = desiredLeaveTime === p.time;
                return (
                  <button
                    key={p.time}
                    type="button"
                    onClick={() => setPresetTime(p.time)}
                    className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Lunch Result Card */}
        <div className="md:col-span-6 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center justify-between">
              <span>Required Lunch Duration</span>
              {result.status === 'feasible' && (
                <span className="text-[10px] text-slate-400 lowercase font-normal">
                  to leave at {result.desiredLeaveTime12}
                </span>
              )}
            </div>

            {/* Main Result Number */}
            {result.status === 'feasible' ? (
              <div className="mt-2 space-y-1">
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight tabular-nums">
                  {result.formattedLunchDuration}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Take a <strong className="text-teal-300">{result.formattedLunchDuration}</strong> lunch break today, and you will hit exactly 40.00 hours at <strong className="text-white font-mono">{result.desiredLeaveTime12}</strong>.
                </p>
              </div>
            ) : result.status === 'exact_zero' ? (
              <div className="mt-2 space-y-1">
                <div className="text-3xl font-mono font-bold text-white">
                  0 Minutes
                </div>
                <p className="text-xs text-amber-300">
                  Take no lunch break at all (straight through) to leave at <strong className="text-white">{result.desiredLeaveTime12}</strong>.
                </p>
              </div>
            ) : result.status === 'too_early' ? (
              <div className="mt-2 space-y-2">
                <div className="text-2xl font-mono font-bold text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Departure Too Early</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Leaving at <strong className="text-rose-300">{result.desiredLeaveTime12}</strong> is <strong className="text-rose-400">{result.deficitMinutes} minutes too early</strong> to reach 40.00 hours (even with 0 lunch).
                </p>
                <div className="text-xs text-slate-400 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 font-mono">
                  Earliest possible departure with 0 lunch: <strong className="text-emerald-400">{earliestPossibleLeave12h}</strong>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-400">
                Please enter your punch-in time in the input box above to calculate required lunch duration.
              </div>
            )}
          </div>

          {/* Action Button & Punch Back In recommendation */}
          {(result.status === 'feasible' || result.status === 'exact_zero') && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              {/* If lunchOut is filled, give the exact punch-back-in time! */}
              {result.suggestedLunchIn12h ? (
                <div className="text-xs text-slate-300 bg-teal-950/30 border border-teal-800/40 rounded-xl p-2.5 flex items-center justify-between">
                  <span>If you punch out for lunch at <strong className="text-white font-mono">{punches.lunchOut}</strong>:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Punch back in at {result.suggestedLunchIn12h}
                  </span>
                </div>
              ) : null}

              {/* 1-Tap Apply to Shift */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-950/50 active:scale-[0.98]"
              >
                {applied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Applied to Today's Shift & Countdown!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply This Lunch ({result.formattedLunchDuration}) to Shift</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
