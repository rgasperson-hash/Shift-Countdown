import React from 'react';
import { 
  LogIn, 
  UtensilsCrossed, 
  Coffee, 
  Clock, 
  Plus, 
  Minus, 
  X,
  Sparkles
} from 'lucide-react';
import { ShiftPunches } from '../types';
import { secondsToTimeString, secondsTo12HourString, timeStringToSeconds } from '../utils/timeCalculations';

interface TimePunchesProps {
  punches: ShiftPunches;
  onChange: (punches: ShiftPunches) => void;
  currentTime: Date;
}

export const TimePunches: React.FC<TimePunchesProps> = ({
  punches,
  onChange,
  currentTime,
}) => {
  // Helper to format Date into "HH:MM"
  const getCurrentHHMM = () => {
    const h = currentTime.getHours().toString().padStart(2, '0');
    const m = currentTime.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSetNow = (field: 'punchIn' | 'lunchOut' | 'lunchIn') => {
    onChange({
      ...punches,
      [field]: getCurrentHHMM(),
    });
  };

  const handleClearField = (field: 'punchIn' | 'lunchOut' | 'lunchIn') => {
    onChange({
      ...punches,
      [field]: '',
    });
  };

  const handleAdjustMinutes = (field: 'punchIn' | 'lunchOut' | 'lunchIn', deltaMins: number) => {
    const currentVal = punches[field] || getCurrentHHMM();
    const currentSec = timeStringToSeconds(currentVal) ?? 8 * 3600;
    let newSec = currentSec + deltaMins * 60;
    // Keep in 24h cycle
    if (newSec < 0) newSec += 24 * 3600;
    newSec = newSec % (24 * 3600);

    onChange({
      ...punches,
      [field]: secondsToTimeString(newSec),
    });
  };

  const handlePlannedLunchChange = (minutes: number) => {
    onChange({
      ...punches,
      plannedLunchMinutes: minutes,
    });
  };

  // 12-hour formatted readouts
  const get12hDisplay = (timeStr: string) => {
    const sec = timeStringToSeconds(timeStr);
    if (sec === null) return null;
    return secondsTo12HourString(sec, false);
  };

  // Lunch duration calculation if punches exist
  const lunchOutSec = timeStringToSeconds(punches.lunchOut);
  const lunchInSec = timeStringToSeconds(punches.lunchIn);
  let actualLunchDurationMinutes: number | null = null;
  if (lunchOutSec !== null && lunchInSec !== null) {
    actualLunchDurationMinutes = Math.max(0, Math.round((lunchInSec - lunchOutSec) / 60));
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Today's Shift Time Punches
            </h2>
            <p className="text-xs text-slate-400">
              Type your punch times or tap "Now" on your phone
            </p>
          </div>
        </div>

        {/* Planned Lunch Selector (Used before punch back from lunch) */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 hidden xs:inline">Planned Lunch:</span>
          <div className="inline-flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            {[30, 45, 60, 0].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handlePlannedLunchChange(mins)}
                className={`min-h-[30px] px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  punches.plannedLunchMinutes === mins
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mins === 0 ? 'None' : `${mins}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Three Boxes Required by User */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* BOX 1: Punch In for Work */}
        <div className={`rounded-2xl border p-3.5 sm:p-4 space-y-2.5 transition-all ${
          punches.punchIn 
            ? 'bg-slate-950/90 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <label 
                  htmlFor="punch-in-input"
                  className="text-xs font-semibold text-white block cursor-pointer"
                >
                  Punched In
                </label>
                <span className="text-[10px] text-slate-400 block">Start of shift</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSetNow('punchIn')}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>Now</span>
            </button>
          </div>

          {/* Time Input Field */}
          <div className="relative">
            <input
              id="punch-in-input"
              type="time"
              value={punches.punchIn}
              onChange={(e) => onChange({ ...punches, punchIn: e.target.value })}
              className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base sm:text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all tabular-nums text-center"
            />
            {punches.punchIn && (
              <button
                type="button"
                onClick={() => handleClearField('punchIn')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                title="Clear time"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 12h Readout & Quick Steppers */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="font-mono text-emerald-400 font-medium">
              {get12hDisplay(punches.punchIn) || 'Tap to set time'}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustMinutes('punchIn', -5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="-5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes('punchIn', 5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="+5 minutes"
              >
                +5m
              </button>
            </div>
          </div>
        </div>

        {/* BOX 2: Punch Out for Lunch */}
        <div className={`rounded-2xl border p-3.5 sm:p-4 space-y-2.5 transition-all ${
          punches.lunchOut 
            ? 'bg-slate-950/90 border-blue-500/40 shadow-sm shadow-blue-500/5'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <label 
                  htmlFor="lunch-out-input"
                  className="text-xs font-semibold text-white block cursor-pointer"
                >
                  Lunch Punch Out
                </label>
                <span className="text-[10px] text-slate-400 block">Start of meal break</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSetNow('lunchOut')}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>Now</span>
            </button>
          </div>

          {/* Time Input Field */}
          <div className="relative">
            <input
              id="lunch-out-input"
              type="time"
              value={punches.lunchOut}
              onChange={(e) => onChange({ ...punches, lunchOut: e.target.value })}
              className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base sm:text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all tabular-nums text-center"
            />
            {punches.lunchOut && (
              <button
                type="button"
                onClick={() => handleClearField('lunchOut')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                title="Clear time"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 12h Readout & Quick Steppers */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="font-mono text-blue-400 font-medium">
              {get12hDisplay(punches.lunchOut) || 'Optional if no lunch'}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustMinutes('lunchOut', -5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="-5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes('lunchOut', 5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="+5 minutes"
              >
                +5m
              </button>
            </div>
          </div>
        </div>

        {/* BOX 3: Punch Back In from Lunch */}
        <div className={`rounded-2xl border p-3.5 sm:p-4 space-y-2.5 transition-all ${
          punches.lunchIn 
            ? 'bg-slate-950/90 border-indigo-500/40 shadow-sm shadow-indigo-500/5'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <label 
                  htmlFor="lunch-in-input"
                  className="text-xs font-semibold text-white block cursor-pointer"
                >
                  Lunch Punch Back In
                </label>
                <span className="text-[10px] text-slate-400 block">Resume afternoon shift</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSetNow('lunchIn')}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>Now</span>
            </button>
          </div>

          {/* Time Input Field */}
          <div className="relative">
            <input
              id="lunch-in-input"
              type="time"
              value={punches.lunchIn}
              onChange={(e) => onChange({ ...punches, lunchIn: e.target.value })}
              className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base sm:text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all tabular-nums text-center"
            />
            {punches.lunchIn && (
              <button
                type="button"
                onClick={() => handleClearField('lunchIn')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                title="Clear time"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 12h Readout & Quick Steppers */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="font-mono text-indigo-400 font-medium">
              {get12hDisplay(punches.lunchIn) || (
                actualLunchDurationMinutes !== null
                  ? `${actualLunchDurationMinutes}m lunch taken`
                  : 'Resume time'
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustMinutes('lunchIn', -5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="-5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes('lunchIn', 5)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="+5 minutes"
              >
                +5m
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information strip about lunch calculation */}
      {actualLunchDurationMinutes !== null && (
        <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
          <span>Actual Lunch Break Taken:</span>
          <span className="font-mono text-slate-200 font-medium">
            {actualLunchDurationMinutes} minutes ({punches.lunchOut} → {punches.lunchIn})
          </span>
        </div>
      )}
    </div>
  );
};
