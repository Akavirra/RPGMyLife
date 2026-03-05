import { cn } from '@/lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'xp' | 'skill' | 'health';
  animated?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-300',
  xp: 'bg-gradient-to-r from-accent-blue to-accent-purple',
  skill: 'bg-gradient-to-r from-accent-green to-emerald-400',
  health: 'bg-gradient-to-r from-red-400 to-red-500',
};

export function ProgressBar({
  className,
  value,
  max = 100,
  showLabel = false,
  variant = 'default',
  animated = false,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="h-2 w-full bg-background-tertiary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-notion',
            variantStyles[variant],
            animated && 'progress-shimmer'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-text-secondary flex justify-between">
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
        <span className="text-accent-blue font-medium">Рівень {level}</span>
        <span className="text-text-secondary">
          {xpProgress} / {xpNeeded} XP
        </span>
      </div>
      <ProgressBar value={xpProgress} max={xpNeeded} variant="xp" animated />
    </div>
  );
}

// Helper function to get XP for level
function getXpForLevel(level: number): number {
  const levelMinusOne = level - 1;
  return levelMinusOne * levelMinusOne * 100;
}
