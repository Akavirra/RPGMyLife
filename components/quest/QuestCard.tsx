import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getDifficultyBadgeVariant } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { getDifficultyLabel, getQuestTypeLabel } from '@/lib/game/xp';
import { formatDate, getTimeRemaining, cn } from '@/lib/utils';
import { Calendar, Clock, Star, MapPin, Users, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { Quest, Location, Character } from '@/lib/db/schema';

interface QuestCardProps {
  quest: Quest;
  location?: Location | null;
  characters?: Character[];
  onComplete?: () => void;
  onFail?: () => void;
  isLoading?: boolean;
}

const difficultyEmojis = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export function QuestCard({
  quest,
  location,
  characters = [],
  onComplete,
  onFail,
  isLoading = false,
}: QuestCardProps) {
  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    active: 'Активний',
    completed: 'Виконано',
    failed: 'Провалено',
  };

  const statusColors: Record<string, string> = {
    draft: 'outline',
    active: 'info',
    completed: 'success',
    failed: 'danger',
  };

  return (
    <Card hover className={cn('transition-all duration-200 hover:shadow-notion-lg', quest.status === 'completed' ? 'opacity-75' : '')}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg md:text-xl">{quest.title}</CardTitle>
            <p className="text-sm md:text-base text-text-secondary mt-1 line-clamp-2 md:line-clamp-3">
              {quest.description || 'Опис відсутній'}
            </p>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:ml-4">
            <Badge variant={statusColors[quest.status] as any}>
              {statusLabels[quest.status]}
            </Badge>
            <div className="flex items-center gap-1">
              {difficultyEmojis[quest.difficulty].split('').map((emoji, i) => (
                <span key={i} className="text-sm">{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4">
        {/* Meta info */}
        <div className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base text-text-secondary">
          {/* Quest type */}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent-purple" />
            {getQuestTypeLabel(quest.type)}
          </span>

          {/* Location */}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-accent-blue" />
              {location.name}
            </span>
          )}

          {/* Characters */}
          {characters.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-accent-green" />
              {characters.length}
            </span>
          )}

          {/* Deadline */}
          {quest.deadline && quest.status === 'active' && (
            <span className="flex items-center gap-1 text-accent-purple">
              <Clock className="w-4 h-4" />
              {getTimeRemaining(quest.deadline)}
            </span>
          )}
        </div>

        {/* XP Reward - Enhanced */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Нагорода:</span>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-blue" />
            <span className="text-accent-blue font-semibold">+{quest.xpReward} XP</span>
          </div>
        </div>

        {/* Progress bar for active quests with deadline */}
        {quest.status === 'active' && quest.deadline && (
          <div className="mt-2">
            <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Залишилось: {getTimeRemaining(quest.deadline)}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(quest.createdAt)}
        </span>
        
        <div className="flex gap-2">
          {quest.status === 'active' && (
            <>
              {onComplete && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={onComplete}
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Виконати
                </Button>
              )}
              {onFail && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onFail}
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Провалено
                </Button>
              )}
            </>
          )}
          <Link href={`/quests/${quest.id}`}>
            <Button size="sm" variant="ghost">
              Детальніше
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
