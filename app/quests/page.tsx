'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { QuestCard } from '@/components/quest/QuestCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';

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

export default function QuestsPage() {
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchQuests();
  }, [filter]);

  const fetchQuests = async () => {
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const res = await fetch(`/api/quests?${statusParam}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (questId: number) => {
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
        credentials: 'include',
      });
      if (res.ok) {
        fetchQuests();
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const handleFail = async (questId: number) => {
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' }),
        credentials: 'include',
      });
      if (res.ok) {
        fetchQuests();
      }
    } catch (error) {
      console.error('Error failing quest:', error);
    }
  };

  const filters = [
    { value: 'all', label: 'Всі' },
    { value: 'active', label: 'Активні' },
    { value: 'completed', label: 'Виконані' },
    { value: 'failed', label: 'Провалені' },
    { value: 'draft', label: 'Чернетки' },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      <Header 
        title="Квести"
        rightContent={
          <Link href="/quests/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Новий
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-background-tertiary text-text-secondary hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Quests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        ) : quests.length > 0 ? (
          <div className="space-y-4">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={() => handleComplete(quest.id)}
                onFail={() => handleFail(quest.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">Квестів не знайдено</p>
            <Link href="/quests/new">
              <Button>Створити перший квест</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
