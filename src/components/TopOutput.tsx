import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Hourglass, 
  Coffee, 
  Zap,
  Clock
} from 'lucide-react';
import { CalculationResult } from '../types';
import { formatDigitalClock } from '../utils/timeCalculations';

interface TopOutputProps {
  calc: CalculationResult;
  currentTime: Date;
}

export const TopOutput: React.FC<TopOutputProps> = ({ calc, currentTime }) => {
  const countdown = formatDigitalClock(calc.remainingSecondsUntil40);

  // Status badge styling
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
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
      badgeLabel = 'Clocked In · On Track to 40h';
      badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${
          calc.isOvertime 
            ? 'bg-rose-500/15' 
            : calc.isWithin5Min 
            ? 'bg-amber-500/15' 
            : 'bg-emerald-500/15'
        }`}
      />

      <div className="relative z-10 space-y-5">
        {/* Top Status & Live Clock Bar */}
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

        {/* The Two Primary Output Points Requested by User */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          {/* Output 1: Time to Punch Out */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Punch-Out Departure Time</span>
              </div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white tabular-nums mt-1">
                {calc.hasPunchedIn ? calc.leaveTime12h : '--:-- --'}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
              <span>{calc.hasPunchedIn ? `24-Hour: ${calc.leaveTimeString}` : 'Enter punch in below'}</span>
              {calc.hasPunchedIn && (
                <span className="text-amber-400">Overtime: {calc.overtimeStartTime12h}</span>
              )}
            </div>
          </div>

          {/* Output 2: Countdown to Punch Out */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {calc.isOvertime ? 'Overtime Elapsed' : 'Countdown to Punch Out'}
              </div>
              <div className={`text-3xl sm:text-5xl font-mono font-bold tracking-tight tabular-nums mt-1 ${
                calc.isOvertime 
                  ? 'text-rose-400' 
                  : calc.isWithin5Min 
                  ? 'text-amber-400' 
                  : 'text-emerald-400'
              }`}>
                {calc.hasPunchedIn ? (
                  `${calc.isOvertime ? '+' : '-'} ${countdown.hours}:${countdown.minutes}:${countdown.seconds}`
                ) : (
                  '--:--:--'
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono pt-1 border-t border-slate-800/60">
              {calc.hasPunchedIn ? (
                calc.isOvertime 
                  ? 'Exceeded 40.00 hours - clock out immediately'
                  : `${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s remaining until 40.00h`
              ) : (
                'Waiting for today\'s shift times'
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
