'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CharacterStats } from '@/components/character/CharacterStats';
import { QuestCard } from '@/components/quest/QuestCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, Scroll, Trophy } from 'lucide-react';

interface UserData {
  id: number;
  firstName: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
}

interface QuestData {
  id: number;
  title: string;
  description: string | null;
  status: string;
  type: string;
  difficulty: number;
  xpReward: number;
  deadline: string | null;
  createdAt: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user data
      const userRes = await fetch('/api/auth/telegram', {
        credentials: 'include',
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch quests
      const questsRes = await fetch('/api/quests?status=active', {
        credentials: 'include',
      });
      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData.quests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If not logged in, show welcome screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Life RPG" />
        
        <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-amber-400 font-cinzel">
              Life RPG
            </h1>
            <p className="text-slate-400 max-w-xs mx-auto">
              Перетвори своє життя на пригоду. Створюй квести, розвивай навички, досягай цілей.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Увійди через Telegram, щоб почати:
              </p>
              <div id="telegram-login-container">
                {/* Telegram login button will be rendered here */}
                <p className="text-xs text-slate-600">
                  Завантаж додаток через Telegram бот
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuestsCount = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Life RPG" />
      
      <main className="p-4 space-y-6">
        {/* Character Stats */}
        <CharacterStats
          user={user}
          activeQuestsCount={activeQuests.length}
          completedQuestsCount={completedQuestsCount}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quests/new">
            <Button className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Новий квест
            </Button>
          </Link>
          <Link href="/quests">
            <Button variant="secondary" className="w-full" size="lg">
              <Scroll className="w-5 h-5 mr-2" />
              Всі квести
            </Button>
          </Link>
        </div>

        {/* Active Quests Preview */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Активні квести
            </CardTitle>
            <Link href="/quests">
              <Button variant="ghost" size="sm">
                Дивитись всі
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeQuests.length > 0 ? (
              <div className="space-y-3">
                {activeQuests.slice(0, 3).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  Квестів ще немає
                </p>
                <Link href="/quests/new">
                  <Button variant="outline" size="sm" className="mt-3">
                    Створити перший квест
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
