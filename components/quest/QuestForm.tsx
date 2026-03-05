'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateXpReward, getDifficultyLabel, getQuestTypeLabel } from '@/lib/game/xp';
import { cn } from '@/lib/utils';
import { Star, Calendar, MapPin, Users, Zap, Loader2 } from 'lucide-react';
import type { Location, Character, Skill } from '@/lib/db/schema';

interface QuestFormProps {
  onSubmit: (data: QuestFormData) => Promise<void>;
  locations?: Location[];
  characters?: Character[];
  skills?: Skill[];
  initialData?: Partial<QuestFormData>;
  isLoading?: boolean;
}

export interface QuestFormData {
  title: string;
  description: string;
  type: 'once' | 'daily' | 'weekly' | 'chain';
  difficulty: number;
  deadline: string | null;
  locationId: number | null;
  characterIds: number[];
  skillIds: number[];
}

const questTypes = [
  { value: 'once', label: 'Одноразовий', description: 'Виконай один раз' },
  { value: 'daily', label: 'Щоденний', description: 'Поновлюється щодня' },
  { value: 'weekly', label: 'Тижневий', description: 'Поновлюється щотижня' },
  { value: 'chain', label: 'Ланцюговий', description: 'Частина ланцюжка' },
];

export function QuestForm({
  onSubmit,
  locations = [],
  characters = [],
  skills = [],
  initialData,
  isLoading = false,
}: QuestFormProps) {
  const [formData, setFormData] = useState<QuestFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'once',
    difficulty: initialData?.difficulty || 1,
    deadline: initialData?.deadline || null,
    locationId: initialData?.locationId || null,
    characterIds: initialData?.characterIds || [],
    skillIds: initialData?.skillIds || [],
  });

  const [previewXp, setPreviewXp] = useState(calculateXpReward(formData.difficulty, formData.type));

  useEffect(() => {
    setPreviewXp(calculateXpReward(formData.difficulty, formData.type));
  }, [formData.difficulty, formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Назва квесту *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Введи назву квесту"
          className="input-notion"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Опис
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Опиши деталі квесту..."
          rows={4}
          className="input-notion resize-none"
        />
      </div>

      {/* Quest Type */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Тип квесту
        </label>
        <div className="grid grid-cols-2 gap-3">
          {questTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value as QuestFormData['type'] })}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                formData.type === type.value
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'border-border bg-background-tertiary hover:bg-gray-100'
              )}
            >
              <div className="font-medium text-text-primary">{type.label}</div>
              <div className="text-xs text-text-secondary">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Складність
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFormData({ ...formData, difficulty: level })}
              className={cn(
                'flex-1 p-3 rounded-lg border flex flex-col items-center transition-all',
                formData.difficulty === level
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'border-border bg-background-tertiary hover:bg-gray-100'
              )}
            >
              <div className="text-lg mb-1">{level} ⭐</div>
              <div className="text-xs text-text-secondary">{getDifficultyLabel(level)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Дедлайн
        </label>
        <input
          type="datetime-local"
          value={formData.deadline || ''}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value || null })}
          className="input-notion"
        />
      </div>

      {/* Location */}
      {locations.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Локація
          </label>
          <select
            value={formData.locationId || ''}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value ? Number(e.target.value) : null })}
            className="input-notion"
          >
            <option value="">Без локації</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Characters */}
      {characters.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Персонажі
          </label>
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => {
                  const newIds = formData.characterIds.includes(char.id)
                    ? formData.characterIds.filter((id) => id !== char.id)
                    : [...formData.characterIds, char.id];
                  setFormData({ ...formData, characterIds: newIds });
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition-all',
                  formData.characterIds.includes(char.id)
                    ? 'border-accent-blue bg-accent-blue/5 text-accent-blue'
                    : 'border-border bg-background-tertiary text-text-secondary hover:bg-gray-100'
                )}
              >
                {char.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Zap className="w-4 h-4 inline mr-1" />
            Навички
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => {
                  const newIds = formData.skillIds.includes(skill.id)
                    ? formData.skillIds.filter((id) => id !== skill.id)
                    : [...formData.skillIds, skill.id];
                  setFormData({ ...formData, skillIds: newIds });
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition-all',
                  formData.skillIds.includes(skill.id)
                    ? 'border-accent-purple bg-accent-purple/5 text-accent-purple'
                    : 'border-border bg-background-tertiary text-text-secondary hover:bg-gray-100'
                )}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* XP Preview */}
      <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-text-primary">Очікувана нагорода:</span>
          <span className="text-2xl font-bold text-accent-blue">+{previewXp} XP</span>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !formData.title}
        isLoading={isLoading}
      >
        {isLoading ? 'Створення...' : 'Створити квест'}
      </Button>
    </form>
  );
}
