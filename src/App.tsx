import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TopOutput } from './components/TopOutput';
import { AllInputsBox } from './components/AllInputsBox';
import { CalculatedInsights } from './components/CalculatedInsights';
import { LunchPlannerBox } from './components/LunchPlannerBox';
import { 
  WorkWeekConfig as WorkWeekConfigType, 
  ShiftPunches as ShiftPunchesType 
} from './types';
import { calculateShift, getWorkWeekDayStatus } from './utils/timeCalculations';
import { soundManager } from './utils/audio';

const STORAGE_KEY_CONFIG = 'shiftcap_workweek_config_v2';
const STORAGE_KEY_PUNCHES = 'shiftcap_shift_punches_v2';
const STORAGE_KEY_SOUND = 'shiftcap_sound_enabled_v2';

export default function App() {
  // Current time state updating every second
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Work week configuration (Defaults to Saturday through Friday as requested)
  const [config, setConfig] = useState<WorkWeekConfigType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      startDay: 'Saturday',
      endDay: 'Friday',
      targetWeeklyHours: 40,
    };
  });

  // Shift punches (Defaults with realistic Friday morning numbers)
  const [punches, setPunches] = useState<ShiftPunchesType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUNCHES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      priorHours: 32.0, // 4 previous days x 8 hours
      punchIn: '08:00',
      lunchOut: '12:00',
      lunchIn: '12:30',
      plannedLunchMinutes: 30,
    };
  });

  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PUNCHES, JSON.stringify(punches));
    } catch {}
  }, [punches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
      soundManager.setEnabled(soundEnabled);
    } catch {}
  }, [soundEnabled]);

  // Master 1-second clock loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate live results
  const calc = calculateShift(punches, config, currentTime);
  const weekStatus = getWorkWeekDayStatus(config.startDay, currentTime);

  // Sound notification trigger ref (triggers once per event)
  const triggered5mRef = useRef(false);
  const triggeredTargetRef = useRef(false);

  useEffect(() => {
    if (!soundEnabled || !calc.hasPunchedIn) return;

    if (calc.isWithin5Min && !calc.isOvertime && !triggered5mRef.current) {
      soundManager.playSoftChime();
      triggered5mRef.current = true;
    }

    if (calc.isOvertime && !triggeredTargetRef.current) {
      soundManager.playClockOutAlert();
      triggeredTargetRef.current = true;
    }

    if (!calc.isWithin5Min && !calc.isOvertime) {
      triggered5mRef.current = false;
      triggeredTargetRef.current = false;
    }
  }, [calc.isWithin5Min, calc.isOvertime, calc.hasPunchedIn, soundEnabled]);

  const handleResetDay = () => {
    if (window.confirm('Reset shift punches for today? Your prior weekly hours and schedule will be saved.')) {
      setPunches((prev) => ({
        ...prev,
        punchIn: '',
        lunchOut: '',
        lunchIn: '',
      }));
    }
  };

  const handleApplyLunch = (lunchMinutes: number, suggestedLunchIn?: string) => {
    setPunches((prev) => ({
      ...prev,
      plannedLunchMinutes: lunchMinutes,
      ...(suggestedLunchIn ? { lunchIn: suggestedLunchIn } : {}),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-safe">
      {/* Header with sound toggle and day status */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onReset={handleResetDay}
        isLastDay={weekStatus.isLastDay}
        dayName={weekStatus.dayName}
        dayIndex={weekStatus.dayIndex}
      />

      {/* Main Container - Structured into the clear sections requested */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        {/* 1. TOP SECTION: Countdown and Time to Punch Out */}
        <TopOutput 
          calc={calc} 
          currentTime={currentTime} 
        />

        {/* 2. MIDDLE SECTION: The Box with ALL the input points */}
        <AllInputsBox
          config={config}
          onConfigChange={setConfig}
          punches={punches}
          onPunchesChange={setPunches}
          currentTime={currentTime}
        />

        {/* 3. CALCULATED DETAILS & TIMELINE */}
        <CalculatedInsights
          calc={calc}
          punches={punches}
          config={config}
        />

        {/* 4. BOTTOM BOX: Target Departure & Required Lunch Calculator */}
        <LunchPlannerBox
          punches={punches}
          config={config}
          onApplyLunch={handleApplyLunch}
        />

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pt-3 pb-6 space-y-1">
          <p>ShiftCap · 40-Hour Work Week Clock-Out Countdown</p>
          <p className="text-[11px] text-slate-600">
            Work Week: {config.startDay} through {config.endDay} · Reverse lunch calculator active
          </p>
        </footer>
      </main>
    </div>
  );
}
