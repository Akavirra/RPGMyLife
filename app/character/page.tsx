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
      <div className="min-h-screen bg-background-primary">
        <Header title="Персонаж" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Персонаж" />
        <div className="p-4 text-center text-text-secondary">
          Не вдалося завантажити дані персонажа
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header title="Персонаж" />
      
      <main className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Character Stats */}
        <CharacterStats
          user={userData}
          skills={skillData}
          activeQuestsCount={activeQuestsCount}
          completedQuestsCount={completedQuestsCount}
        />

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Навички</CardTitle>
          </CardHeader>
          <CardContent>
            {skillData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {skillData.map((skill) => {
                  const xpForNextLevel = (skill.level + 1) * 100;
                  const progress = (skill.xp / xpForNextLevel) * 100;
                  
                  return (
                    <div key={skill.id} className="space-y-2 p-4 bg-background-tertiary rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">{skill.name}</span>
                        <Badge variant="warning">Рівень {skill.level}</Badge>
                      </div>
                      <ProgressBar value={progress} />
                      <p className="text-sm text-text-muted">
                        {skill.xp} / {xpForNextLevel} XP
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-4">
                Навички ще не створені
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
