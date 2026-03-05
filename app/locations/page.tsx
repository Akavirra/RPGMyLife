'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import type { Location } from '@/lib/db/schema';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingLocation ? `/api/locations/${editingLocation.id}` : '/api/locations';
      const method = editingLocation ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save location');
      }

      setShowForm(false);
      setEditingLocation(null);
      setFormData({ name: '', description: '' });
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ name: location.name, description: location.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (locationId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю локацію?')) {
      return;
    }

    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const openNewForm = () => {
    setEditingLocation(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Локації" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header 
        title="Локації"
        rightContent={
          <Button size="sm" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-1" />
            Нова
          </Button>
        }
      />
      
      <main className="p-4 space-y-4">
        {/* New/Edit Form */}
        {showForm && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingLocation ? 'Редагувати локацію' : 'Нова локація'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Назва *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                    placeholder="Назва локації"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Опис
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                    rows={3}
                    placeholder="Опис локації"
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
                      setEditingLocation(null);
                    }}
                  >
                    Скасувати
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Locations List */}
        {locations.length > 0 ? (
          <div className="space-y-3">
            {locations.map((location) => (
              <Card key={location.id} variant="glass">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-medium">{location.name}</h3>
                        {location.description && (
                          <p className="text-slate-400 text-sm mt-1">{location.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(location.id)}
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
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Локацій ще немає</p>
            <Button onClick={openNewForm}>Створити першу локацію</Button>
          </div>
        )}
      </main>
    </div>
  );
}
