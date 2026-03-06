'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { QuestForm, QuestFormData } from '@/components/quest/QuestForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import type { Skill, Location, Guild, Character } from '@/lib/db/schema';

export default function NewQuestPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, locationsRes, guildsRes, charactersRes] = await Promise.all([
        fetch('/api/skills', { credentials: 'include' }),
        fetch('/api/locations', { credentials: 'include' }),
        fetch('/api/guilds', { credentials: 'include' }),
        fetch('/api/characters', { credentials: 'include' }),
      ]);

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.locations || []);
      }

      if (guildsRes.ok) {
        const guildsData = await guildsRes.json();
        setGuilds(guildsData.guilds || []);
      }

      if (charactersRes.ok) {
        const charactersData = await charactersRes.json();
        setCharacters(charactersData.characters || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: QuestFormData) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.type,
          difficulty: data.difficulty,
          deadline: data.deadline,
          locationId: data.locationId,
          guildId: data.guildId,
          skillIds: data.skillIds,
          characterIds: data.characterIds,
          isInfinite: data.isInfinite,
          durationMonths: data.durationMonths,
          durationWeeks: data.durationWeeks,
          subQuests: data.subQuests,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create quest');
      }

      router.push('/quests');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Новий квест" showBack />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header 
        title="Новий квест" 
        showBack 
        rightContent={
          <Link href="/quests">
            <Button variant="ghost" size="sm">
              Скасувати
            </Button>
          </Link>
        }
      />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
        {error && (
          <Card className="mb-4">
            <CardContent className="py-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </CardContent>
          </Card>
        )}
        <QuestForm 
          skills={skills}
          locations={locations}
          guilds={guilds}
          characters={characters}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </main>
    </div>
  );
}
