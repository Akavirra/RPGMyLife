'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateXpReward, calculateDifficulty, getDifficultyLabel, getQuestTypeLabel } from '@/lib/game/xp';
import { cn } from '@/lib/utils';
import { Star, Calendar, MapPin, Users, Zap, Loader2, Plus, X, Building2 } from 'lucide-react';
import type { Location, Character, Skill, Guild } from '@/lib/db/schema';

interface SubQuest {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  deadline: string | null;
}

interface QuestFormProps {
  onSubmit: (data: QuestFormData) => Promise<void>;
  locations?: Location[];
  characters?: Character[];
  skills?: Skill[];
  guilds?: Guild[];
  initialData?: Partial<QuestFormData>;
  isLoading?: boolean;
}

export interface QuestFormData {
  title: string;
  description: string;
  type: 'once' | 'daily' | 'weekly';
  difficulty: number;
  deadline: string | null;
  locationId: number | null;
  guildId: number | null;
  characterIds: number[];
  skillIds: number[];
  // Daily/Weekly specific
  isInfinite: boolean;
  durationMonths: number | null;
  durationWeeks: number | null;
  // Sub-quests for 'once' type
  subQuests: SubQuest[];
}

const questTypes = [
  { value: 'once', label: 'Одноразовий', description: 'Виконай один раз' },
  { value: 'daily', label: 'Щоденний', description: 'Поновлюється щодня' },
  { value: 'weekly', label: 'Тижневий', description: 'Поновлюється щотижня' },
];

export function QuestForm({
  onSubmit,
  locations = [],
  characters = [],
  skills = [],
  guilds = [],
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
    guildId: initialData?.guildId || null,
    characterIds: initialData?.characterIds || [],
    skillIds: initialData?.skillIds || [],
    isInfinite: initialData?.isInfinite ?? true,
    durationMonths: initialData?.durationMonths || null,
    durationWeeks: initialData?.durationWeeks || null,
    subQuests: initialData?.subQuests || [],
  });

  const [newSubQuest, setNewSubQuest] = useState<SubQuest>({
    id: '',
    title: '',
    description: '',
    difficulty: 1,
    deadline: null,
  });

  const [previewXp, setPreviewXp] = useState(0);
  const [calculatedDifficulty, setCalculatedDifficulty] = useState(1);

  useEffect(() => {
    // Calculate difficulty based on various factors
    const newDifficulty = calculateDifficulty(formData.difficulty, {
      linkedCharactersCount: formData.characterIds.length,
      hasLocation: !!formData.locationId,
      subQuestsCount: formData.subQuests.length,
      isLimitedDuration: !formData.isInfinite && (!!formData.durationMonths || !!formData.durationWeeks),
      hasGuild: !!formData.guildId,
    });
    setCalculatedDifficulty(newDifficulty);
    setPreviewXp(calculateXpReward(newDifficulty, formData.type));
  }, [formData.difficulty, formData.type, formData.characterIds.length, formData.locationId, formData.subQuests.length, formData.isInfinite, formData.durationMonths, formData.durationWeeks, formData.guildId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addSubQuest = () => {
    if (!newSubQuest.title.trim()) return;
    setFormData({
      ...formData,
      subQuests: [...formData.subQuests, { ...newSubQuest, id: Date.now().toString() }],
    });
    setNewSubQuest({
      id: '',
      title: '',
      description: '',
      difficulty: 1,
      deadline: null,
    });
  };

  const removeSubQuest = (id: string) => {
    setFormData({
      ...formData,
      subQuests: formData.subQuests.filter((sq) => sq.id !== id),
    });
  };

  // Show deadline only for 'once' type quests
  const showDeadline = formData.type === 'once';
  // Show duration settings for daily/weekly quests
  const showDurationSettings = formData.type === 'daily' || formData.type === 'weekly';
  // Show sub-quests only for 'once' type quests
  const showSubQuests = formData.type === 'once';

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
        <div className="grid grid-cols-3 gap-3">
          {questTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value as QuestFormData['type'] })}
              className={cn(
                'p-3 rounded-lg border text-center transition-all',
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

      {/* Duration Settings (Daily/Weekly only) */}
      {showDurationSettings && (
        <Card className="bg-accent-purple/5 border-accent-purple/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Налаштування повторень</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Infinite toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Безкінечний квест</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isInfinite: !formData.isInfinite })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.isInfinite ? 'bg-accent-purple' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    formData.isInfinite ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Duration inputs (when not infinite) */}
            {!formData.isInfinite && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Місяці
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={formData.durationMonths || ''}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="0"
                    className="input-notion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Тижні
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={formData.durationWeeks || ''}
                    onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="0"
                    className="input-notion"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Складність (базова)
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

      {/* Deadline (Only for 'once' type) */}
      {showDeadline && (
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
      )}

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

      {/* Guild */}
      {guilds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Гільдія
          </label>
          <select
            value={formData.guildId || ''}
            onChange={(e) => setFormData({ ...formData, guildId: e.target.value ? Number(e.target.value) : null })}
            className="input-notion"
          >
            <option value="">Без гільдії</option>
            {guilds.map((guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
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

      {/* Sub-quests (Only for 'once' type) */}
      {showSubQuests && (
        <Card className="bg-accent-green/5 border-accent-green/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Етапи квесту (підквести)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing sub-quests */}
            {formData.subQuests.length > 0 && (
              <div className="space-y-2">
                {formData.subQuests.map((sq) => (
                  <div key={sq.id} className="flex items-center justify-between p-3 bg-background-primary rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{sq.title}</div>
                      {sq.description && (
                        <div className="text-xs text-text-secondary">{sq.description}</div>
                      )}
                      <div className="text-xs text-accent-purple mt-1">
                        Складність: {sq.difficulty} ⭐
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubQuest(sq.id)}
                      className="p-1 text-text-secondary hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new sub-quest */}
            <div className="space-y-3 p-3 bg-background-tertiary rounded-lg">
              <input
                type="text"
                value={newSubQuest.title}
                onChange={(e) => setNewSubQuest({ ...newSubQuest, title: e.target.value })}
                placeholder="Назва етапу"
                className="input-notion"
              />
              <textarea
                value={newSubQuest.description}
                onChange={(e) => setNewSubQuest({ ...newSubQuest, description: e.target.value })}
                placeholder="Опис етапу"
                rows={2}
                className="input-notion resize-none"
              />
              <div className="flex items-center gap-3">
                <select
                  value={newSubQuest.difficulty}
                  onChange={(e) => setNewSubQuest({ ...newSubQuest, difficulty: parseInt(e.target.value) })}
                  className="input-notion flex-1"
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      Складність: {d} ⭐
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={addSubQuest}
                  variant="secondary"
                  size="sm"
                  disabled={!newSubQuest.title.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Додати
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* XP Preview */}
      <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-primary">Розрахункова складність:</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent-purple">{calculatedDifficulty} ⭐</span>
            <span className="text-sm text-text-secondary">
              ({getDifficultyLabel(calculatedDifficulty)})
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-primary">Очікувана нагорода:</span>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-blue" />
            <span className="text-2xl font-bold text-accent-blue">+{previewXp} XP</span>
          </div>
        </div>
        {formData.type !== 'once' && (
          <div className="mt-2 text-xs text-text-secondary">
            * Нагорода за кожне виконання
          </div>
        )}
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
