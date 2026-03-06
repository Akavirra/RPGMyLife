'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { QuestCard } from '@/components/quest/QuestCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import type { Quest, Guild } from '@/lib/db/schema';

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [guildsMap, setGuildsMap] = useState<Record<number, Guild>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      let url = '/api/quests';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const [questsRes, guildsRes] = await Promise.all([
        fetch(url, {
          credentials: 'include',
        }),
        fetch('/api/guilds', { credentials: 'include' }),
      ]);

      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData.quests || []);
      }

      if (guildsRes.ok) {
        const guildsData = await guildsRes.json();
        const guildsList = guildsData.guilds || [];
        setGuilds(guildsList);
        // Create a map for quick lookup
        const map: Record<number, Guild> = {};
        guildsList.forEach((g: Guild) => {
          map[g.id] = g;
        });
        setGuildsMap(map);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        fetchData();
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
        fetchData();
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
            <Button size="sm" className="hidden md:flex">
              <Plus className="w-4 h-4 mr-1" />
              Новий квест
            </Button>
            <Button size="sm" className="md:hidden">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest as any}
                guild={quest.guildId ? guildsMap[quest.guildId] : null}
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
