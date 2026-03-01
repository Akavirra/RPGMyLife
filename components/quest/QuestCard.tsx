import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getDifficultyBadgeVariant } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { getDifficultyLabel, getQuestTypeLabel } from '@/lib/game/xp';
import { formatDate, getTimeRemaining, cn } from '@/lib/utils';
import { Calendar, Clock, Star, MapPin, Users } from 'lucide-react';
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

  return (
    <Card variant="glass" className="hover:border-amber-600/40 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{quest.title}</CardTitle>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {quest.description || 'Опис відсутній'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge variant={getStatusBadgeVariant(quest.status)}>
              {statusLabels[quest.status]}
            </Badge>
            <span className="text-amber-400 text-sm font-medium">
              {difficultyEmojis[quest.difficulty]}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
          {/* Quest type */}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {getQuestTypeLabel(quest.type)}
          </span>

          {/* Location */}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {location.name}
            </span>
          )}

          {/* Characters */}
          {characters.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {characters.length}
            </span>
          )}

          {/* Deadline */}
          {quest.deadline && quest.status === 'active' && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Clock className="w-4 h-4" />
              {getTimeRemaining(quest.deadline)}
            </span>
          )}
        </div>

        {/* XP Reward */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Нагорода:</span>
          <span className="text-amber-400 font-semibold">+{quest.xpReward} XP</span>
        </div>

        {/* Progress bar for active quests with deadline */}
        {quest.status === 'active' && quest.deadline && (
          <div className="mt-2">
            <div className="text-xs text-slate-500 mb-1">
              Залишилось: {getTimeRemaining(quest.deadline)}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <span className="text-xs text-slate-500">
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
