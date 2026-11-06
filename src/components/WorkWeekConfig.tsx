import React from 'react';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { DayOfWeek, DAYS_OF_WEEK, WorkWeekConfig as WorkWeekConfigType } from '../types';
import { getWorkWeekDayStatus } from '../utils/timeCalculations';

interface WorkWeekConfigProps {
  config: WorkWeekConfigType;
  onChange: (updated: WorkWeekConfigType) => void;
  currentTime: Date;
}

export const WorkWeekConfig: React.FC<WorkWeekConfigProps> = ({
  config,
  onChange,
  currentTime,
}) => {
  const status = getWorkWeekDayStatus(config.startDay, currentTime);

  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = e.target.value as DayOfWeek;
    // Auto-calculate default end day (6 days after start)
    const startIndex = DAYS_OF_WEEK.indexOf(newStart);
    const defaultEndIndex = (startIndex + 6) % 7;
    const defaultEnd = DAYS_OF_WEEK[defaultEndIndex];

    onChange({
      ...config,
      startDay: newStart,
      endDay: defaultEnd,
    });
  };

  const handleEndDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      endDay: e.target.value as DayOfWeek,
    });
  };

  const setSaturdayFridayDefault = () => {
    onChange({
      ...config,
      startDay: 'Saturday',
      endDay: 'Friday',
    });
  };

  const isDefaultSatFri = config.startDay === 'Saturday' && config.endDay === 'Friday';

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
      {/* Header with Title and Day Status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Work Week Schedule
            </h2>
            <p className="text-xs text-slate-400">
              Programmable 7-day pay period cycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
            {status.dayName} · Day {status.dayIndex} of 7
          </div>
          {status.isLastDay && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Final Shift Day
            </span>
          )}
        </div>
      </div>

      {/* 2 Drop-Down Windows as requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Dropdown 1: Work Week Start Day */}
        <div className="space-y-1.5">
          <label 
            htmlFor="work-week-start"
            className="block text-xs font-semibold text-slate-300"
          >
            1. Work Week Starts On
          </label>
          <div className="relative">
            <select
              id="work-week-start"
              value={config.startDay}
              onChange={handleStartDayChange}
              className="w-full h-11 appearance-none rounded-xl bg-slate-950/90 border border-slate-700/80 px-3.5 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors cursor-pointer"
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
          <div className="text-[11px] text-slate-400">
            First day of your weekly payroll timesheet
          </div>
        </div>

        {/* Dropdown 2: Work Week Ends On */}
        <div className="space-y-1.5">
          <label 
            htmlFor="work-week-end"
            className="block text-xs font-semibold text-slate-300"
          >
            2. Work Week Ends On
          </label>
          <div className="relative">
            <select
              id="work-week-end"
              value={config.endDay}
              onChange={handleEndDayChange}
              className="w-full h-11 appearance-none rounded-xl bg-slate-950/90 border border-slate-700/80 px-3.5 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors cursor-pointer"
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
          <div className="text-[11px] text-slate-400">
            Final day to balance your 40.00 hours
          </div>
        </div>
      </div>

      {/* Preset shortcut button if not currently Sat-Fri */}
      {!isDefaultSatFri && (
        <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
          <span>Custom schedule: {config.startDay} – {config.endDay}</span>
          <button
            type="button"
            onClick={setSaturdayFridayDefault}
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Reset to Saturday – Friday
          </button>
        </div>
      )}
    </div>
  );
};
