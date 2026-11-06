import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ShieldCheck, 
  Smartphone, 
  Share, 
  PlusSquare, 
  X,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  isLastDay: boolean;
  dayName: string;
  dayIndex: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onReset,
  isLastDay,
  dayName,
  dayIndex,
}) => {
  const [showIconModal, setShowIconModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Zone with App Icon */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              title="View App Icon & Add to Home Screen instructions"
              className="relative group cursor-pointer focus:outline-none"
            >
              <img
                src="/apple-touch-icon.png"
                alt="ShiftCap App Icon"
                className="w-9 h-9 rounded-xl shadow-md border border-slate-700/80 object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  ShiftCap
                </span>
                <button
                  type="button"
                  onClick={() => setShowIconModal(true)}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  App Icon
                </button>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                40-Hour Cap Countdown
              </div>
            </div>
          </div>

          {/* Center / Status Zone */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{dayName}</span>
            <span aria-hidden="true">·</span>
            <span>Day {dayIndex} of 7</span>
            {isLastDay && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Last Day of Week
                </span>
              </>
            )}
          </div>

          {/* Actions Zone */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                soundManager.setEnabled(next);
                if (next) soundManager.playSoftChime();
                onToggleSound();
              }}
              title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              aria-label={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 shadow-sm hover:border-slate-600'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline">Alerts On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="hidden md:inline">Muted</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              title="Reset punches for today"
              aria-label="Reset shift punches"
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Reset Day</span>
            </button>
          </div>
        </div>
      </header>

      {/* Home Screen App Icon & Installation Modal */}
      {showIconModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowIconModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIconModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon showcase */}
            <div className="flex flex-col items-center space-y-3 pt-2">
              <div className="relative">
                <img
                  src="/apple-touch-icon.png"
                  alt="ShiftCap Home Screen Icon"
                  className="w-24 h-24 rounded-2xl shadow-2xl border border-slate-600/80 object-cover"
                />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 -z-10 blur-sm opacity-40" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">ShiftCap App Icon</h3>
                <p className="text-xs text-slate-400">
                  Favicon & iPhone Home Screen Icon Installed
                </p>
              </div>
            </div>

            {/* iOS Instructions */}
            <div className="bg-slate-950/80 rounded-2xl p-4 text-left space-y-2 border border-slate-800 text-xs text-slate-300">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>To Add to iPhone Home Screen:</span>
              </div>
              <ol className="space-y-1.5 text-slate-300 pl-1">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-slate-400">1.</span>
                  <span>In Safari, tap the <strong className="text-white">Share</strong> icon at the bottom.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-slate-400">2.</span>
                  <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-slate-400">3.</span>
                  <span>Tap <strong className="text-white">Add</strong>. ShiftCap will appear with this icon!</span>
                </li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowIconModal(false)}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
