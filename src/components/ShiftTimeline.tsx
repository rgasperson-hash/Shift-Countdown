import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Briefcase,
  Coffee,
  LogOut
} from 'lucide-react';
import { CalculationResult, ShiftPunches, WorkWeekConfig } from '../types';
import { formatDuration } from '../utils/timeCalculations';

interface ShiftTimelineProps {
  calc: CalculationResult;
  punches: ShiftPunches;
  config: WorkWeekConfig;
}

export const ShiftTimeline: React.FC<ShiftTimelineProps> = ({
  calc,
  punches,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    const text = `=== SHIFTCAP 40-HOUR WORK WEEK REPORT ===
Work Week: ${config.startDay} through ${config.endDay}
Prior Hours Logged: ${punches.priorHours} hrs
Punched In: ${punches.punchIn || 'N/A'}
Lunch Punch Out: ${punches.lunchOut || 'N/A'}
Lunch Punch Back In: ${punches.lunchIn || 'N/A'}
Calculated Departure (40h): ${calc.leaveTime12h} (${calc.leaveTimeString})
Overtime Warning (40h 01m): ${calc.overtimeStartTime12h}
Current Live Total: ${(calc.totalWorkedSeconds / 3600).toFixed(2)} hrs / 40.00 hrs
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
==========================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
      {/* Title & Copy Action */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Shift Breakdown & Timeline
            </h2>
            <p className="text-xs text-slate-400">
              Clear breakdown of how your 40.00 hours are reached
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copySummary}
          className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Timesheet Log</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {/* Step 1: Prior Hours */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Prior Days</span>
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {punches.priorHours.toFixed(2)}h
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {formatDuration(calc.priorSeconds)}
          </div>
        </div>

        {/* Step 2: Morning Shift */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Morning Shift</span>
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {(calc.morningWorkedSeconds / 3600).toFixed(2)}h
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {punches.punchIn || '--'} → {punches.lunchOut || 'Lunch'}
          </div>
        </div>

        {/* Step 3: Lunch Break */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            <span>Meal Break</span>
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {(calc.lunchDurationSeconds / 60).toFixed(0)}m
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {punches.lunchOut || '--'} → {punches.lunchIn || '--'}
          </div>
        </div>

        {/* Step 4: Afternoon Shift to Cap */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
            <LogOut className="w-3 h-3" />
            <span>Clock-Out</span>
          </div>
          <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
            {calc.leaveTime12h}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Target: 40h 00m
          </div>
        </div>
      </div>

      {/* Helpful Punch Tip */}
      <div className="text-[11px] text-slate-400 bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 leading-relaxed">
        💡 <strong className="text-slate-300">Overtime Rule Tip:</strong> Most electronic punch clocks round or flag overtime at <strong>40.02 hours</strong> or <strong>40 hours and 1 minute</strong>. Walking to the punch clock 1-2 minutes before {calc.leaveTime12h} guarantees you punch out smoothly within standard 40-hour limits.
      </div>
    </div>
  );
};
