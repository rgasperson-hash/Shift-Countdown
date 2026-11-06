import React, { useState } from 'react';
import { 
  AlertTriangle, 
  BarChart3, 
  Check, 
  Copy, 
  Clock, 
  Calendar, 
  Coffee, 
  LogOut,
  Info
} from 'lucide-react';
import { CalculationResult, ShiftPunches, WorkWeekConfig } from '../types';
import { formatDuration } from '../utils/timeCalculations';

interface CalculatedInsightsProps {
  calc: CalculationResult;
  punches: ShiftPunches;
  config: WorkWeekConfig;
}

export const CalculatedInsights: React.FC<CalculatedInsightsProps> = ({
  calc,
  punches,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  const liveWorkedFormatted = formatDuration(calc.totalWorkedSeconds);
  const liveWorkedDecimal = (calc.totalWorkedSeconds / 3600).toFixed(3);
  const todayWorkedFormatted = formatDuration(calc.todayWorkedSeconds);

  const copyTimesheetReport = () => {
    const text = `=== SHIFTCAP 40-HOUR WORK WEEK REPORT ===
Work Week: ${config.startDay} through ${config.endDay}
Prior Hours Logged: ${punches.priorHours} hrs
Punched In: ${punches.punchIn || 'N/A'}
Lunch Punch Out: ${punches.lunchOut || 'N/A'}
Lunch Punch Back In: ${punches.lunchIn || 'N/A'}
Planned Lunch: ${punches.plannedLunchMinutes} mins
Calculated Departure (40h): ${calc.leaveTime12h} (${calc.leaveTimeString})
Overtime Warning (40h 01m): ${calc.overtimeStartTime12h}
Current Live Total: ${(calc.totalWorkedSeconds / 3600).toFixed(2)} hrs / 40.00 hrs
Timestamp: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
==========================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Shift Calculations & Details
            </h2>
            <p className="text-xs text-slate-400">
              Live accumulated hours, progress, overtime window, and breakdown
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyTimesheetReport}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-950/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-medium active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Report Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Timesheet Log</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Live Hours Worked Up To This Point Ticker */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Total Hours Worked Up Into This Point</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Live Second Ticker
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums tracking-tight mt-1">
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

        {/* 40-Hour Progress Bar */}
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
            <span>0.0h</span>
            <span className="font-semibold text-slate-300">
              {calc.progressPercent.toFixed(1)}% of 40h Completed
            </span>
            <span>40.0h</span>
          </div>
        </div>
      </div>

      {/* 2. 40h 01m Overtime Protection Window Callout */}
      {calc.hasPunchedIn && (
        <div className={`rounded-2xl p-4 border transition-all ${
          calc.isOvertime 
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
        }`}>
          <div className="flex items-start gap-3 text-xs">
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
              calc.isOvertime ? 'text-rose-400' : 'text-amber-400'
            }`} />
            <div className="space-y-1">
              <div className="font-semibold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                <span>The 40h 01m Overtime Cutoff Window</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  60-Second Buffer
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                To avoid an unauthorized overtime flag on your timesheet, clock out at <strong className="text-emerald-300 font-mono">{calc.leaveTime12h}</strong>.
                At <strong className="text-white font-mono">{calc.overtimeStartTime12h}</strong> (exactly 1 minute later), you reach <strong className="text-amber-300">40 hours and 1 minute</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Shift Breakdown & Chronological Segments */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Shift Breakdown & Chronological Segments</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Prior Days */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Prior Days</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {punches.priorHours.toFixed(2)}h
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {formatDuration(calc.priorSeconds)}
            </div>
          </div>

          {/* Morning Shift */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Morning Shift</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {(calc.morningWorkedSeconds / 3600).toFixed(2)}h
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {punches.punchIn || '--'} → {punches.lunchOut || 'Lunch'}
            </div>
          </div>

          {/* Meal Break */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
              <Coffee className="w-3 h-3" />
              <span>Meal Break</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              {(calc.lunchDurationSeconds / 60).toFixed(0)}m
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {punches.lunchOut || '--'} → {punches.lunchIn || '--'}
            </div>
          </div>

          {/* Clock-Out Target */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              <span>Clock-Out</span>
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
              {calc.leaveTime12h}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Target: 40h 00m
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
