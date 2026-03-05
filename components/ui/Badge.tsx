import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-background-tertiary text-text-secondary',
  success: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-100 text-red-600 border border-red-200',
  info: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
  purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20',
  outline: 'border border-border text-text-secondary',
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
