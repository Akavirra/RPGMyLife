'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CharacterStats } from '@/components/character/CharacterStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
  level: number;
  xp: number;
}

export default function CharacterPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [activeQuestsCount, setActiveQuestsCount] = useState(0);
  const [completedQuestsCount, setCompletedQuestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, skillsRes, questsRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/skills', { credentials: 'include' }),
        fetch('/api/quests', { credentials: 'include' }),
      ]);

      if (userRes.ok) {
        const userResult = await userRes.json();
        setUserData(userResult.user);
      }

      if (skillsRes.ok) {
        const skillsResult = await skillsRes.json();
        setSkillData(skillsResult.skills || []);
      }

      if (questsRes.ok) {
        const questsResult = await questsRes.json();
        const allQuests = questsResult.quests || [];
        setActiveQuestsCount(allQuests.filter((q: any) => q.status === 'active').length);
        setCompletedQuestsCount(allQuests.filter((q: any) => q.status === 'completed').length);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Персонаж" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Персонаж" />
        <div className="p-4 text-center text-slate-400">
          Не вдалося завантажити дані персонажа
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Персонаж" />
      
      <main className="p-4 space-y-6">
        {/* Character Stats */}
        <CharacterStats
          user={userData}
          skills={skillData}
          activeQuestsCount={activeQuestsCount}
          completedQuestsCount={completedQuestsCount}
        />

        {/* Skills Section */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Навички</CardTitle>
          </CardHeader>
          <CardContent>
            {skillData.length > 0 ? (
              <div className="space-y-4">
                {skillData.map((skill) => {
                  const xpForNextLevel = (skill.level + 1) * 100;
                  const progress = (skill.xp / xpForNextLevel) * 100;
                  
                  return (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200 font-medium">{skill.name}</span>
                        <Badge variant="warning">Рівень {skill.level}</Badge>
                      </div>
                      <ProgressBar value={progress} />
                      <p className="text-xs text-slate-500">
                        {skill.xp} / {xpForNextLevel} XP
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">
                Навички ще не створені
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
