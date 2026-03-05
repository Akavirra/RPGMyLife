'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, User, Edit, Trash2, Upload, X, Shield } from 'lucide-react';
import type { Character, Guild, CharacterRelation } from '@/lib/db/schema';

const RELATION_LABELS: Record<CharacterRelation, string> = {
  acquaintance: 'Знайомий',
  friend: 'Друг',
  family: 'Сім\'я',
  enemy: 'Ворог',
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relation: '' as CharacterRelation | '',
    description: '',
    avatarUrl: '',
    guildId: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCharacters();
    fetchGuilds();
  }, []);

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuilds = async () => {
    try {
      const res = await fetch('/api/guilds', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds || []);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'character');

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatarUrl: data.url }));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCharacter ? `/api/characters/${editingCharacter.id}` : '/api/characters';
      const method = editingCharacter ? 'PATCH' : 'POST';

      const payload = {
        name: formData.name,
        relation: formData.relation || null,
        description: formData.description || null,
        avatarUrl: formData.avatarUrl || null,
        guildId: formData.guildId ? parseInt(formData.guildId) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save character');
      }

      setShowForm(false);
      setEditingCharacter(null);
      setFormData({
        name: '',
        relation: '',
        description: '',
        avatarUrl: '',
        guildId: '',
      });
      fetchCharacters();
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      relation: character.relation || '',
      description: character.description || '',
      avatarUrl: character.avatarUrl || '',
      guildId: character.guildId?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (characterId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цього персонажа?')) {
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const openNewForm = () => {
    setEditingCharacter(null);
    setFormData({
      name: '',
      relation: '',
      description: '',
      avatarUrl: '',
      guildId: '',
    });
    setShowForm(true);
  };

  const getRelationLabel = (relation: string | null) => {
    if (!relation) return null;
    return RELATION_LABELS[relation as CharacterRelation] || relation;
  };

  const getGuildName = (guildId: number | null) => {
    if (!guildId) return null;
    const guild = guilds.find(g => g.id === guildId);
    return guild?.name || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Герої" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header 
        title="Персонажі"
        rightContent={
          <Button size="sm" onClick={openNewForm} className="hidden md:flex">
            <Plus className="w-4 h-4 mr-1" />
            Новий герой
          </Button>
        }
      />
      
      <main className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto">
        {/* Mobile button - visible only on small screens */}
        <div className="md:hidden">
          <Button size="sm" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-1" />
            Новий
          </Button>
        </div>
        
        {/* New/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingCharacter ? 'Редагувати героя' : 'Новий герой'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Аватар
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {formData.avatarUrl ? (
                        <img 
                          src={formData.avatarUrl} 
                          alt="Avatar" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-accent-blue"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-background-secondary border-2 border-dashed border-text-muted flex items-center justify-center">
                          <User className="w-8 h-8 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          'Завантаження...'
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Завантажити
                          </>
                        )}
                      </Button>
                      {formData.avatarUrl && (
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Видалити
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Ім'я *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-notion"
                    required
                    placeholder="Ім'я героя"
                  />
                </div>

                {/* Relation */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Відношення
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value as CharacterRelation })}
                    className="input-notion"
                  >
                    <option value="">Оберіть відношення</option>
                    <option value="acquaintance">Знайомий</option>
                    <option value="friend">Друг</option>
                    <option value="family">Сім'я</option>
                    <option value="enemy">Ворог</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Опис
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-notion min-h-[100px]"
                    placeholder="Опис персонажа, його історія, особливості..."
                  />
                </div>

                {/* Guild */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Гільдія
                  </label>
                  <select
                    value={formData.guildId}
                    onChange={(e) => setFormData({ ...formData, guildId: e.target.value })}
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

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Збереження...' : 'Зберегти'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingCharacter(null);
                    }}
                  >
                    Скасувати
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Characters List */}
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {characters.map((character) => (
              <Card key={character.id} className="hover:shadow-notion-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {character.avatarUrl ? (
                        <img 
                          src={character.avatarUrl} 
                          alt={character.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="p-2 bg-accent-blue/10 rounded-lg">
                          <User className="w-5 h-5 text-accent-blue" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-text-primary">{character.name}</h3>
                        {character.relation && (
                          <Badge variant="info" className="mt-1">
                            {getRelationLabel(character.relation)}
                          </Badge>
                        )}
                        {character.guildId && (
                          <div className="flex items-center gap-1 mt-1 text-text-secondary text-sm">
                            <Shield className="w-3 h-3" />
                            {getGuildName(character.guildId)}
                          </div>
                        )}
                        {character.description && (
                          <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                            {character.description}
                          </p>
                        )}
                        <Badge variant="default" className="mt-2">
                          Репутація: {character.reputationLevel}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(character)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(character.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-4">Героїв ще немає</p>
            <Button onClick={openNewForm}>Створити першого героя</Button>
          </div>
        )}
      </main>
    </div>
  );
}
