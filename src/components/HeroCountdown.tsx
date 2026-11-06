import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Hourglass, 
  Coffee, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { CalculationResult } from '../types';
import { formatDigitalClock, formatDuration } from '../utils/timeCalculations';

interface HeroCountdownProps {
  calc: CalculationResult;
  currentTime: Date;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({ calc, currentTime }) => {
  const countdown = formatDigitalClock(calc.remainingSecondsUntil40);

  // Status badge logic
  let badgeColor = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let badgeLabel = 'Ready to Punch In';
  let badgeIcon = <Hourglass className="w-3.5 h-3.5" />;

  if (calc.hasPunchedIn) {
    if (calc.isOvertime) {
      badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800/80 shadow-rose-950/50 shadow-md';
      badgeLabel = '40 Hours Exceeded · Overtime Warning';
      badgeIcon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
    } else if (calc.isWithin5Min) {
      badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/80 shadow-amber-950/50 shadow-md';
      badgeLabel = 'Leave Now · Clock-Out Imminent';
      badgeIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />;
    } else if (calc.isWithin15Min) {
      badgeColor = 'bg-amber-900/50 text-amber-200 border-amber-800/60';
      badgeLabel = 'Final 15 Minutes · Wrap Up Shift';
      badgeIcon = <Zap className="w-3.5 h-3.5 text-amber-300" />;
    } else if (calc.isOnLunch) {
      badgeColor = 'bg-blue-950/70 text-blue-300 border-blue-800/60';
      badgeLabel = 'On Lunch Break · Shift Paused';
      badgeIcon = <Coffee className="w-3.5 h-3.5 text-blue-400" />;
    } else {
      badgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      badgeLabel = 'Clocked In · Accumulating Live Hours';
      badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  }

  // Live hours worked string with seconds
  const liveWorkedFormatted = formatDuration(calc.totalWorkedSeconds);
  const liveWorkedDecimal = (calc.totalWorkedSeconds / 3600).toFixed(3);

  // Today's worked portion formatted
  const todayWorkedFormatted = formatDuration(calc.todayWorkedSeconds);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl transition-all">
      {/* Background ambient glow */}
      <div 
        aria-hidden="true" 
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${
          calc.isOvertime 
            ? 'bg-rose-500/15' 
            : calc.isWithin5Min 
            ? 'bg-amber-500/15' 
            : 'bg-emerald-500/12'
        }`}
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-teal-500/10"
      />

      <div className="relative z-10 space-y-6">
        {/* Top Status & Live Clock Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium tracking-tight ${badgeColor}`}>
            {badgeIcon}
            <span>{badgeLabel}</span>
          </div>

          <div className="text-xs text-slate-400 tabular-nums flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Now: {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* Centerpiece: Clock-Out Departure Time & Countdown */}
        <div className="text-center sm:text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Departure Callout */}
          <div className="md:col-span-7 space-y-1.5">
            <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Target Clock-Out Time (40.0h)
            </div>
            
            {calc.hasPunchedIn ? (
              <div className="flex items-baseline justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white tabular-nums">
                  {calc.leaveTime12h}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  (24h: {calc.leaveTimeString})
                </span>
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-slate-400 py-1">
                --:-- --
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-400">
              {calc.hasPunchedIn ? (
                <>
                  Leave at or before <span className="text-slate-200 font-semibold">{calc.leaveTime12h}</span> to finish your 40.00-hour work week.
                </>
              ) : (
                <>Enter your punch-in time below to calculate your departure moment.</>
              )}
            </p>
          </div>

          {/* Countdown Clock Pod */}
          <div className="md:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              {calc.isOvertime ? 'Time Over 40 Hours' : 'Countdown to Clock-Out'}
            </span>

            {calc.hasPunchedIn ? (
              <div className="space-y-1">
                <div className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight tabular-nums ${
                  calc.isOvertime 
                    ? 'text-rose-400' 
                    : calc.isWithin5Min 
                    ? 'text-amber-400' 
                    : 'text-emerald-400'
                }`}>
                  {calc.isOvertime ? '+' : '-'} {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {countdown.hours}h {countdown.minutes}m {countdown.seconds}s {calc.isOvertime ? 'past cap' : 'remaining'}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-mono text-slate-600">
                --:--:--
              </div>
            )}
          </div>
        </div>

        {/* Live Hours Worked Up To This Point Ticker (The User's Explicit Request) */}
        <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Total Hours Worked This Week</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Live Second Ticker
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums tracking-tight mt-0.5">
                {liveWorkedFormatted}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({liveWorkedDecimal} / 40.000 hrs)
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
              <div>Prior shifts: <span className="text-slate-200 font-medium">{calc.priorSeconds / 3600} hrs</span></div>
              <div>Today's shift: <span className="text-emerald-300 font-medium">{todayWorkedFormatted}</span></div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-800/90 overflow-hidden p-0.5 relative">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  calc.isOvertime
                    ? 'bg-rose-500'
                    : calc.isWithin5Min
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, calc.progressPercent))}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>0h</span>
              <span className="font-semibold text-slate-300">
                {calc.progressPercent.toFixed(1)}% of 40h Completed
              </span>
              <span>40.0h</span>
            </div>
          </div>
        </div>

        {/* 40h 01m Overtime Protection Callout */}
        {calc.hasPunchedIn && (
          <div className={`rounded-2xl p-3.5 border transition-all ${
            calc.isOvertime 
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
          }`}>
            <div className="flex items-start gap-3 text-xs">
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                calc.isOvertime ? 'text-rose-400' : 'text-amber-400'
              }`} />
              <div className="space-y-0.5">
                <div className="font-semibold tracking-tight text-white flex items-center gap-1.5">
                  <span>Overtime Threshold Window (40h 01m)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    60-Sec Rule
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  Clocking out at <strong className="text-white font-mono">{calc.overtimeStartTime12h}</strong> or later registers as <strong>40 hours and 1 minute</strong>.
                  Punch out between <strong className="text-emerald-300 font-mono">{calc.leaveTime12h}</strong> and <strong className="text-amber-300 font-mono">{calc.overtimeStartTime12h}</strong> to guarantee zero overtime flags.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
