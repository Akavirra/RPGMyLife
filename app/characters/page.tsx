'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, User, Edit, Trash2 } from 'lucide-react';
import type { Character } from '@/lib/db/schema';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharacters();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCharacter ? `/api/characters/${editingCharacter.id}` : '/api/characters';
      const method = editingCharacter ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save character');
      }

      setShowForm(false);
      setEditingCharacter(null);
      setFormData({ name: '', role: '' });
      fetchCharacters();
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({ name: character.name, role: character.role || '' });
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
    setFormData({ name: '', role: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Герої" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header 
        title="Герої"
        rightContent={
          <Button size="sm" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-1" />
            Новий
          </Button>
        }
      />
      
      <main className="p-4 space-y-4">
        {/* New/Edit Form */}
        {showForm && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingCharacter ? 'Редагувати героя' : 'Новий герой'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Ім'я *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                    placeholder="Ім'я героя"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Роль
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Наприклад: союзник, ворог, наставник"
                  />
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
          <div className="space-y-3">
            {characters.map((character) => (
              <Card key={character.id} variant="glass">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-medium">{character.name}</h3>
                        {character.role && (
                          <p className="text-slate-400 text-sm mt-1">{character.role}</p>
                        )}
                        <Badge variant="info" className="mt-2">
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
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Героїв ще немає</p>
            <Button onClick={openNewForm}>Створити першого героя</Button>
          </div>
        )}
      </main>
    </div>
  );
}
