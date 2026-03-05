'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar, XpProgress } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { getLevelTitle, getXpForNextLevel } from '@/lib/game/level';
import { User, Zap, Trophy, Target } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Avatar and Level */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.firstName}
              className="w-24 h-24 rounded-full border-4 border-accent-blue/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-background-tertiary border-4 border-accent-blue/30 flex items-center justify-center">
              <User className="w-12 h-12 text-accent-blue" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user.level}
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-text-primary">
            {user.firstName}
          </h2>
          {user.username && (
            <p className="text-text-secondary">@{user.username}</p>
          )}
          <Badge variant="outline" className="mt-2">
            {getLevelTitle(user.level)}
          </Badge>
        </div>
      </div>

      {/* XP Progress */}
      <Card>
        <CardContent className="pt-4">
          <XpProgress
            currentXp={user.totalXp}
            nextLevelXp={nextLevelXp}
            level={user.level}
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
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

        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{activeQuestsCount}</p>
              <p className="text-sm text-text-secondary">Активних квестів</p>
            </div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{skills.length}</p>
              <p className="text-sm text-text-secondary">Навичок</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Навички</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((skill) => {
              const skillNextLevelXp = getXpForNextLevel(skill.level);
              return (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{skill.name}</span>
                    <Badge variant="outline">Рівень {skill.level}</Badge>
                  </div>
                  <ProgressBar
                    value={skill.xp}
                    max={skillNextLevelXp}
                    variant="skill"
                  />
                  <p className="text-xs text-text-muted">
                    {skill.xp} / {skillNextLevelXp} XP
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
