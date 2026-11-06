import React, { useState } from 'react';
import { History, HelpCircle, ArrowRight, Check } from 'lucide-react';
import { decimalHoursToHhMm } from '../utils/timeCalculations';

interface PriorHoursInputProps {
  priorHours: number;
  targetWeeklyHours: number;
  onChange: (hours: number) => void;
}

export const PriorHoursInput: React.FC<PriorHoursInputProps> = ({
  priorHours,
  targetWeeklyHours,
  onChange,
}) => {
  const [mode, setMode] = useState<'decimal' | 'hhmm'>('decimal');
  
  // Local state for HH:MM inputs
  const currentTotalMins = Math.round(priorHours * 60);
  const currentH = Math.floor(currentTotalMins / 60);
  const currentM = currentTotalMins % 60;

  const hoursNeededToday = Math.max(0, targetWeeklyHours - priorHours);
  const neededFormatted = decimalHoursToHhMm(hoursNeededToday);

  const presets = [
    { label: '32h (4×8)', val: 32 },
    { label: '30h', val: 30 },
    { label: '28h', val: 28 },
    { label: '31.5h', val: 31.5 },
    { label: '0h', val: 0 },
  ];

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onChange(0);
    } else {
      onChange(Math.max(0, Math.min(100, Math.round(val * 100) / 100)));
    }
  };

  const handleHChange = (h: number) => {
    const total = h + currentM / 60;
    onChange(Math.round(total * 100) / 100);
  };

  const handleMChange = (m: number) => {
    const total = currentH + m / 60;
    onChange(Math.round(total * 100) / 100);
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
      {/* Title & Mode Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Hours Worked Prior to Today
            </h2>
            <p className="text-xs text-slate-400">
              Hours accumulated earlier this work week
            </p>
          </div>
        </div>

        {/* Input Format Toggle */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('decimal')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mode === 'decimal'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decimal (e.g. 32.5)
          </button>
          <button
            type="button"
            onClick={() => setMode('hhmm')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mode === 'hhmm'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hrs & Mins
          </button>
        </div>
      </div>

      {/* Main Input Box (Requested) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7">
          {mode === 'decimal' ? (
            <div className="space-y-1.5">
              <label 
                htmlFor="prior-hours-input"
                className="block text-xs font-semibold text-slate-300"
              >
                Enter Total Hours Worked Before Today
              </label>
              <div className="relative">
                <input
                  id="prior-hours-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="40"
                  value={priorHours === 0 ? '' : priorHours}
                  placeholder="e.g. 32.50"
                  onChange={handleDecimalChange}
                  className="w-full h-14 rounded-2xl bg-slate-950 border border-slate-700/90 px-4 text-xl sm:text-2xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 tabular-nums"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 font-mono text-sm">
                  hours ({decimalHoursToHhMm(priorHours)})
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Enter Hours & Minutes Before Today
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={currentH === 0 ? '' : currentH}
                    placeholder="32"
                    onChange={(e) => handleHChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-14 rounded-2xl bg-slate-950 border border-slate-700/90 px-4 text-xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 tabular-nums"
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
                    className="w-full h-14 rounded-2xl bg-slate-950 border border-slate-700/90 px-4 text-xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                    mins
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Quick:</span>
            {presets.map((preset) => {
              const isActive = Math.abs(priorHours - preset.val) < 0.01;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.val)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remaining Needed Today Calculation Card */}
        <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Hours Needed Today
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {neededFormatted}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ({hoursNeededToday.toFixed(2)} hrs to reach 40.0)
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Prior: {priorHours.toFixed(2)}h</span>
            <span className="text-slate-300">+ Today = 40.0h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
