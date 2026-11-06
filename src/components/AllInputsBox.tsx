import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  History, 
  LogIn, 
  UtensilsCrossed, 
  Coffee, 
  Clock, 
  X, 
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  WorkWeekConfig, 
  ShiftPunches 
} from '../types';
import { 
  decimalHoursToHhMm, 
  getWorkWeekDayStatus, 
  secondsToTimeString, 
  secondsTo12HourString, 
  timeStringToSeconds 
} from '../utils/timeCalculations';

interface AllInputsBoxProps {
  config: WorkWeekConfig;
  onConfigChange: (config: WorkWeekConfig) => void;
  punches: ShiftPunches;
  onPunchesChange: (punches: ShiftPunches) => void;
  currentTime: Date;
}

export const AllInputsBox: React.FC<AllInputsBoxProps> = ({
  config,
  onConfigChange,
  punches,
  onPunchesChange,
  currentTime,
}) => {
  const [priorMode, setPriorMode] = useState<'decimal' | 'hhmm'>('decimal');
  const weekStatus = getWorkWeekDayStatus(config.startDay, currentTime);

  // Helper for HH:MM inputs
  const currentTotalMins = Math.round(punches.priorHours * 60);
  const currentH = Math.floor(currentTotalMins / 60);
  const currentM = currentTotalMins % 60;

  const hoursNeededToday = Math.max(0, config.targetWeeklyHours - punches.priorHours);
  const neededFormatted = decimalHoursToHhMm(hoursNeededToday);

  const presets = [
    { label: '32h (4×8)', val: 32 },
    { label: '30h', val: 30 },
    { label: '28h', val: 28 },
    { label: '31.5h', val: 31.5 },
    { label: '0h', val: 0 },
  ];

  // Work week change handlers
  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = e.target.value as DayOfWeek;
    const startIndex = DAYS_OF_WEEK.indexOf(newStart);
    const defaultEndIndex = (startIndex + 6) % 7;
    const defaultEnd = DAYS_OF_WEEK[defaultEndIndex];

    onConfigChange({
      ...config,
      startDay: newStart,
      endDay: defaultEnd,
    });
  };

  const handleEndDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({
      ...config,
      endDay: e.target.value as DayOfWeek,
    });
  };

  // Prior hours change handlers
  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onPunchesChange({ ...punches, priorHours: 0 });
    } else {
      onPunchesChange({
        ...punches,
        priorHours: Math.max(0, Math.min(100, Math.round(val * 100) / 100)),
      });
    }
  };

  const handleHChange = (h: number) => {
    const total = h + currentM / 60;
    onPunchesChange({
      ...punches,
      priorHours: Math.round(total * 100) / 100,
    });
  };

  const handleMChange = (m: number) => {
    const total = currentH + m / 60;
    onPunchesChange({
      ...punches,
      priorHours: Math.round(total * 100) / 100,
    });
  };

  // Punch time handlers
  const getCurrentHHMM = () => {
    const h = currentTime.getHours().toString().padStart(2, '0');
    const m = currentTime.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSetNow = (field: 'punchIn' | 'lunchOut' | 'lunchIn') => {
    onPunchesChange({
      ...punches,
      [field]: getCurrentHHMM(),
    });
  };

  const handleClearField = (field: 'punchIn' | 'lunchOut' | 'lunchIn') => {
    onPunchesChange({
      ...punches,
      [field]: '',
    });
  };

  const handleAdjustMinutes = (field: 'punchIn' | 'lunchOut' | 'lunchIn', deltaMins: number) => {
    const currentVal = punches[field] || getCurrentHHMM();
    const currentSec = timeStringToSeconds(currentVal) ?? 8 * 3600;
    let newSec = currentSec + deltaMins * 60;
    if (newSec < 0) newSec += 24 * 3600;
    newSec = newSec % (24 * 3600);

    onPunchesChange({
      ...punches,
      [field]: secondsToTimeString(newSec),
    });
  };

  const get12hDisplay = (timeStr: string) => {
    const sec = timeStringToSeconds(timeStr);
    if (sec === null) return null;
    return secondsTo12HourString(sec, false);
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Box Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Shift & Schedule Inputs
            </h2>
            <p className="text-xs text-slate-400">
              Configure your work week, prior hours, and punch times
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden xs:flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{weekStatus.dayName} · Day {weekStatus.dayIndex} of 7</span>
        </div>
      </div>

      {/* INPUT POINT 1: WORK WEEK PROGRAMMABLE (2 Drop-Down Windows) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            1. Work Week Schedule (2 Drop-Down Windows)
          </span>
          <span className="text-slate-400">
            Default: Saturday through Friday
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown 1 */}
          <div className="space-y-1">
            <label htmlFor="input-start-day" className="block text-[11px] font-medium text-slate-400">
              Starts On:
            </label>
            <div className="relative">
              <select
                id="input-start-day"
                value={config.startDay}
                onChange={handleStartDayChange}
                className="w-full h-11 appearance-none rounded-xl bg-slate-950 border border-slate-700/80 px-3.5 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors cursor-pointer"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={`start-${day}`} value={day} className="bg-slate-900 text-white">
                    {day}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dropdown 2 */}
          <div className="space-y-1">
            <label htmlFor="input-end-day" className="block text-[11px] font-medium text-slate-400">
              Ends On:
            </label>
            <div className="relative">
              <select
                id="input-end-day"
                value={config.endDay}
                onChange={handleEndDayChange}
                className="w-full h-11 appearance-none rounded-xl bg-slate-950 border border-slate-700/80 px-3.5 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors cursor-pointer"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={`end-${day}`} value={day} className="bg-slate-900 text-white">
                    {day}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT POINT 2: PRIOR HOURS WORKED BEFORE PUNCHING IN TODAY */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-teal-400" />
            2. Hours Worked Before Punching In Today
          </span>

          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setPriorMode('decimal')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                priorMode === 'decimal' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decimal
            </button>
            <button
              type="button"
              onClick={() => setPriorMode('hhmm')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                priorMode === 'hhmm' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hrs & Mins
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8">
            {priorMode === 'decimal' ? (
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="40"
                  value={punches.priorHours === 0 ? '' : punches.priorHours}
                  placeholder="e.g. 32.50"
                  onChange={handleDecimalChange}
                  className="w-full h-12 rounded-xl bg-slate-950 border border-slate-700 px-3.5 text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all tabular-nums"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 font-mono text-xs">
                  hours ({decimalHoursToHhMm(punches.priorHours)})
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={currentH === 0 ? '' : currentH}
                    placeholder="32"
                    onChange={(e) => handleHChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-12 rounded-xl bg-slate-950 border border-slate-700 px-3.5 text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                    hours
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={currentM === 0 ? '' : currentM}
                    placeholder="30"
                    onChange={(e) => handleMChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-12 rounded-xl bg-slate-950 border border-slate-700 px-3.5 text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                    mins
                  </span>
                </div>
              </div>
            )}

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {presets.map((preset) => {
                const isActive = Math.abs(punches.priorHours - preset.val) < 0.01;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onPunchesChange({ ...punches, priorHours: preset.val })}
                    className={`min-h-[28px] px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-4 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-center sm:text-left">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
              Needed Today to hit 40h
            </span>
            <span className="text-xl font-mono font-bold text-white tabular-nums block mt-0.5">
              {neededFormatted}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({hoursNeededToday.toFixed(2)} hrs)
            </span>
          </div>
        </div>
      </div>

      {/* INPUT POINT 3: THE THREE SHIFT PUNCH TIME BOXES */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            3. Today's Punch Times (The Three Boxes)
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Planned Lunch:</span>
            <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {[30, 45, 60, 0].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onPunchesChange({ ...punches, plannedLunchMinutes: mins })}
                  className={`min-h-[26px] px-1.5 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
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

        {/* The 3 punch boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Box 1: Punch In */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">1</span>
                Punched In
              </span>
              <button
                type="button"
                onClick={() => handleSetNow('punchIn')}
                className="min-h-[28px] px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Now
              </button>
            </div>

            <div className="relative">
              <input
                type="time"
                value={punches.punchIn}
                onChange={(e) => onPunchesChange({ ...punches, punchIn: e.target.value })}
                className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base font-mono font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {punches.punchIn && (
                <button
                  type="button"
                  onClick={() => handleClearField('punchIn')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-slate-500 hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-emerald-400 font-mono text-[11px]">
                {get12hDisplay(punches.punchIn) || 'Set time'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('punchIn', -5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('punchIn', 5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  +5
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: Punch Out for Lunch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">2</span>
                Lunch Out
              </span>
              <button
                type="button"
                onClick={() => handleSetNow('lunchOut')}
                className="min-h-[28px] px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Now
              </button>
            </div>

            <div className="relative">
              <input
                type="time"
                value={punches.lunchOut}
                onChange={(e) => onPunchesChange({ ...punches, lunchOut: e.target.value })}
                className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base font-mono font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {punches.lunchOut && (
                <button
                  type="button"
                  onClick={() => handleClearField('lunchOut')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-slate-500 hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-blue-400 font-mono text-[11px]">
                {get12hDisplay(punches.lunchOut) || 'Optional'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('lunchOut', -5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('lunchOut', 5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  +5
                </button>
              </div>
            </div>
          </div>

          {/* Box 3: Punch Back In from Lunch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">3</span>
                Lunch Back In
              </span>
              <button
                type="button"
                onClick={() => handleSetNow('lunchIn')}
                className="min-h-[28px] px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Now
              </button>
            </div>

            <div className="relative">
              <input
                type="time"
                value={punches.lunchIn}
                onChange={(e) => onPunchesChange({ ...punches, lunchIn: e.target.value })}
                className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-base font-mono font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              {punches.lunchIn && (
                <button
                  type="button"
                  onClick={() => handleClearField('lunchIn')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-slate-500 hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-indigo-400 font-mono text-[11px]">
                {get12hDisplay(punches.lunchIn) || 'Resume'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('lunchIn', -5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes('lunchIn', 5)}
                  className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
