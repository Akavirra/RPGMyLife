import { cn } from '@/lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'xp' | 'skill' | 'health';
}

const variantStyles: Record<string, string> = {
  default: 'bg-slate-700',
  xp: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/30',
  skill: 'bg-gradient-to-r from-purple-500 to-pink-400 shadow-lg shadow-purple-500/30',
  health: 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-lg shadow-green-500/30',
};

export function ProgressBar({
  className,
  value,
  max = 100,
  showLabel = false,
  variant = 'default',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-slate-400 flex justify-between">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// XP Progress specific component
interface XpProgressProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
}

export function XpProgress({ currentXp, nextLevelXp, level }: XpProgressProps) {
  const xpForCurrentLevel = getXpForLevel(level);
  const xpProgress = currentXp - xpForCurrentLevel;
  const xpNeeded = nextLevelXp - xpForCurrentLevel;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-amber-400 font-medium">Рівень {level}</span>
        <span className="text-slate-400">
          {xpProgress} / {xpNeeded} XP
        </span>
      </div>
      <ProgressBar value={xpProgress} max={xpNeeded} variant="xp" />
    </div>
  );
}

// Helper function to get XP for level
function getXpForLevel(level: number): number {
  const levelMinusOne = level - 1;
  return levelMinusOne * levelMinusOne * 100;
}
