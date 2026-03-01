import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar, XpProgress } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { getLevelTitle, getXpForNextLevel } from '@/lib/game/level';
import { cn } from '@/lib/utils';
import { User, Zap, Trophy, Target } from 'lucide-react';

interface UserData {
  id: number;
  firstName: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
}

interface SkillData {
  id: number;
  name: string;
  description: string | null;
  xp: number;
  level: number;
  iconUrl: string | null;
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
              className="w-24 h-24 rounded-full border-4 border-amber-500/50"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500/50 flex items-center justify-center">
              <User className="w-12 h-12 text-amber-500" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
            {user.level}
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-amber-400 font-cinzel">
            {user.firstName}
          </h2>
          {user.username && (
            <p className="text-slate-400">@{user.username}</p>
          )}
          <Badge variant="outline" className="mt-2">
            {getLevelTitle(user.level)}
          </Badge>
        </div>
      </div>

      {/* XP Progress */}
      <Card variant="glass">
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
        <Card variant="glass">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{user.totalXp}</p>
              <p className="text-sm text-slate-400">Всього XP</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{activeQuestsCount}</p>
              <p className="text-sm text-slate-400">Активних квестів</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{completedQuestsCount}</p>
              <p className="text-sm text-slate-400">Виконано</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{skills.length}</p>
              <p className="text-sm text-slate-400">Навичок</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Навички</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((skill) => {
              const skillNextLevelXp = getXpForNextLevel(skill.level);
              return (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{skill.name}</span>
                    <Badge variant="outline">Рівень {skill.level}</Badge>
                  </div>
                  <ProgressBar
                    value={skill.xp}
                    max={skillNextLevelXp}
                    variant="skill"
                  />
                  <p className="text-xs text-slate-500">
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
