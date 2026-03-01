import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-600/80 text-slate-200',
  success: 'bg-green-600/20 text-green-400 border border-green-600/30',
  warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30',
  danger: 'bg-red-600/20 text-red-400 border border-red-600/30',
  info: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  outline: 'border border-slate-600 text-slate-400',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Quest status badge helper
export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active':
      return 'info';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'draft':
      return 'outline';
    default:
      return 'default';
  }
}

// Difficulty badge helper
export function getDifficultyBadgeVariant(difficulty: number): BadgeVariant {
  switch (difficulty) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    case 3:
      return 'warning';
    case 4:
      return 'danger';
    case 5:
      return 'danger';
    default:
      return 'default';
  }
}
