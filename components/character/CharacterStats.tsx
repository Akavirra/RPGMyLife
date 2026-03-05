'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar, XpProgress } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { getLevelTitle, getXpForNextLevel } from '@/lib/game/level';
import { User, Zap, Trophy, Target, Star, Flame } from 'lucide-react';

interface UserData {
  id: number;
  firstName: string;
  username?: string | null;
  avatarUrl?: string | null;
  level: number;
  totalXp: number;
}

interface SkillData {
  id: number;
  name: string;
  level: number;
  xp: number;
}

interface CharacterStatsProps {
  user: UserData;
  skills?: SkillData[];
  activeQuestsCount?: number;
  completedQuestsCount?: number;
}

export function CharacterStats({
  user,
  skills = [],
  activeQuestsCount = 0,
  completedQuestsCount = 0,
}: CharacterStatsProps) {
  const nextLevelXp = getXpForNextLevel(user.level);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Avatar and Level - Enhanced with gamification */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.firstName}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-accent-blue/30 object-cover"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background-tertiary border-4 border-accent-blue/30 flex items-center justify-center">
              <User className="w-12 h-12 md:w-14 md:h-14 text-accent-blue" />
            </div>
          )}
          {/* Level Badge with glow */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg level-up">
            {user.level}
          </div>
          {/* Level Title Badge */}
          <div className="absolute -top-2 -left-2">
            <Badge variant="info" className="badge-pulse text-xs">
              <Star className="w-3 h-3 mr-1" />
              {getLevelTitle(user.level)}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            {user.firstName}
          </h2>
          {user.username && (
            <p className="text-text-secondary">@{user.username}</p>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <Badge variant="purple">
              <Zap className="w-3 h-3 mr-1" />
              {user.totalXp} XP
            </Badge>
          </div>
        </div>
      </div>

      {/* XP Progress - Enhanced with shimmer */}
      <Card>
        <CardContent className="pt-4">
          <XpProgress
            currentXp={user.totalXp}
            nextLevelXp={nextLevelXp}
            level={user.level}
          />
        </CardContent>
      </Card>

      {/* Stats Grid - Enhanced with icons and colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{user.totalXp}</p>
              <p className="text-sm text-text-secondary">Всього XP</p>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{activeQuestsCount}</p>
              <p className="text-sm text-text-secondary">Активних</p>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{completedQuestsCount}</p>
              <p className="text-sm text-text-secondary">Виконано</p>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{skills.length}</p>
              <p className="text-sm text-text-secondary">Навичок</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills - Enhanced with animations */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Навички
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((skill) => {
              const skillNextLevelXp = getXpForNextLevel(skill.level);
              return (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{skill.name}</span>
                      <Badge variant="purple" className="text-xs">
                        Рівень {skill.level}
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar
                    value={skill.xp}
                    max={skillNextLevelXp}
                    variant="skill"
                    animated
                  />
                  <p className="text-xs text-text-muted flex justify-between">
                    <span>{skill.xp} XP</span>
                    <span>{skillNextLevelXp} XP</span>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
