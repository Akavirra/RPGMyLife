'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Edit, Trash2, Trophy, Star } from 'lucide-react';
import type { Guild } from '@/lib/db/schema';

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuild, setEditingGuild] = useState<Guild | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      const res = await fetch('/api/guilds', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds || []);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingGuild ? `/api/guilds/${editingGuild.id}` : '/api/guilds';
      const method = editingGuild ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save guild');
      }

      setShowForm(false);
      setEditingGuild(null);
      setFormData({ name: '', description: '' });
      fetchGuilds();
    } catch (error) {
      console.error('Error saving guild:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (guild: Guild) => {
    setEditingGuild(guild);
    setFormData({ name: guild.name, description: guild.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (guildId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю гільдію?')) {
      return;
    }

    try {
      const res = await fetch(`/api/guilds/${guildId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchGuilds();
      }
    } catch (error) {
      console.error('Error deleting guild:', error);
    }
  };

  const openNewForm = () => {
    setEditingGuild(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Гільдії" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header 
        title="Гільдії"
        rightContent={
          <Button size="sm" onClick={openNewForm} className="hidden md:flex">
            <Plus className="w-4 h-4 mr-1" />
            Нова гільдія
          </Button>
        }
      />
      
      <main className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto">
        {/* Mobile button - visible only on small screens */}
        <div className="md:hidden">
          <Button size="sm" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-1" />
            Нова
          </Button>
        </div>

        {/* New/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingGuild ? 'Редагувати гільдію' : 'Нова гільдія'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Назва *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-notion"
                    required
                    placeholder="Назва гільдії"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Опис
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-notion"
                    rows={3}
                    placeholder="Опис гільдії"
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
                      setEditingGuild(null);
                    }}
                  >
                    Скасувати
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Guilds List */}
        {guilds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {guilds.map((guild) => (
              <Card key={guild.id} className="hover:shadow-notion-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent-purple/10 rounded-lg">
                        <Users className="w-5 h-5 text-accent-purple" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary">{guild.name}</h3>
                        {guild.description && (
                          <p className="text-text-secondary text-sm mt-1">{guild.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="purple">
                            <Star className="w-3 h-3 mr-1" />
                            Рівень {guild.level}
                          </Badge>
                          <Badge variant="info">
                            <Users className="w-3 h-3 mr-1" />
                            {guild.memberCount} учасників
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(guild)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(guild.id)}
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
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-4">Гільдій ще немає</p>
            <Button onClick={openNewForm}>Створити першу гільдію</Button>
          </div>
        )}
      </main>
    </div>
  );
}
