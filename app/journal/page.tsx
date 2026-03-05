'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { BookOpen, Plus, Lock, Unlock, Smile, Meh, Frown, Sparkles, Coffee, X, Edit2, Trash2 } from 'lucide-react';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

type MoodType = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';

const moodIcons: Record<MoodType, React.ReactNode> = {
  happy: <Smile className="w-5 h-5 text-yellow-500" />,
  neutral: <Meh className="w-5 h-5 text-gray-400" />,
  sad: <Frown className="w-5 h-5 text-blue-400" />,
  excited: <Sparkles className="w-5 h-5 text-purple-500" />,
  tired: <Coffee className="w-5 h-5 text-amber-600" />,
};

const moodLabels: Record<MoodType, string> = {
  happy: 'Щасливий',
  neutral: 'Нейтральний',
  sad: 'Сумний',
  excited: 'Збуджений',
  tired: 'Втомлений',
};

export default function JournalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [password, setPasswordState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMood, setFormMood] = useState<MoodType>('neutral');
  const [formTags, setFormTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkPasswordStatus();
  }, []);

  const checkPasswordStatus = async () => {
    try {
      const res = await fetch('/api/journal', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHasPassword(data.hasPassword);
        if (!data.hasPassword) {
          setIsAuthenticated(true); // Allow access to set password
        }
      }
    } catch (error) {
      console.error('Error checking password status:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async () => {
    setError('');
    try {
      const res = await fetch('/api/journal/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        fetchEntries();
      } else {
        const data = await res.json();
        setError(data.error || 'Невірний пароль');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('Помилка перевірки пароля');
    }
  };

  const handleSetPassword = async () => {
    setError('');
    if (newPassword.length < 4) {
      setError('Пароль повинен бути мінімум 4 символи');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    try {
      const res = await fetch('/api/journal/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
        credentials: 'include',
      });

      if (res.ok) {
        setHasPassword(true);
        setIsAuthenticated(true);
        fetchEntries();
      } else {
        const data = await res.json();
        setError(data.error || 'Помилка встановлення пароля');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      setError('Помилка встановлення пароля');
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journal', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleCreateEntry = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      setError('Заголовок та вміст обов\'язкові');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const tags = formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          mood: formMood,
          tags,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchEntries();
      } else {
        const data = await res.json();
        setError(data.error || 'Помилка створення запису');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      setError('Помилка створення запису');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !formTitle.trim() || !formContent.trim()) {
      setError('Заголовок та вміст обов\'язкові');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const tags = formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const res = await fetch(`/api/journal/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          mood: formMood,
          tags,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        setEditingEntry(null);
        resetForm();
        fetchEntries();
      } else {
        const data = await res.json();
        setError(data.error || 'Помилка оновлення запису');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setError('Помилка оновлення запису');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей запис?')) {
      return;
    }

    try {
      const res = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormMood((entry.mood as MoodType) || 'neutral');
    setFormTags(entry.tags?.join(', ') || '');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormMood('neutral');
    setFormTags('');
    setError('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  // Password not set - show set password form
  if (!hasPassword) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Журнал" />
        <main className="p-4 md:p-6 lg:p-8 max-w-md mx-auto">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-accent-purple" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Створення пароля для журналу
              </h2>
              <p className="text-text-secondary text-sm">
                Встановіть пароль для захисту вашого особистого щоденника
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Мінімум 4 символи"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Підтвердження пароля
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Повторіть пароль"
                />
              </div>
              <Button onClick={handleSetPassword} className="w-full">
                Встановити пароль
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Password required - show password input
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-primary">
        <Header title="Журнал" />
        <main className="p-4 md:p-6 lg:p-8 max-w-md mx-auto">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-accent-purple" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Вхід до журналу
              </h2>
              <p className="text-text-secondary text-sm">
                Введіть пароль для доступу до вашого щоденника
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPasswordState(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Введіть пароль"
                  autoFocus
                />
              </div>
              <Button onClick={verifyPassword} className="w-full">
                <Unlock className="w-4 h-4 mr-2" />
                Розблокувати
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Main journal view
  return (
    <div className="min-h-screen bg-background-primary">
      <Header 
        title="Журнал"
        rightContent={
          <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Новий запис</span>
          </Button>
        }
      />

      <main className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-3xl mx-auto">
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {entry.mood && moodIcons[entry.mood as MoodType]}
                      <h3 className="font-semibold text-text-primary truncate">
                        {entry.title}
                      </h3>
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-3 mb-2">
                      {entry.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{formatDate(entry.createdAt)}</span>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-background-tertiary rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-accent-purple" />
            </div>
            <p className="text-text-secondary mb-4">Записів ще немає</p>
            <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Створити перший запис
            </Button>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingEntry}
        onClose={() => { setShowCreateModal(false); setEditingEntry(null); resetForm(); }}
        title={editingEntry ? 'Редагувати запис' : 'Новий запис'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Заголовок *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Про що ви думаєте?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Настрій
            </label>
            <div className="flex gap-2">
              {(Object.keys(moodIcons) as MoodType[]).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormMood(mood)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    formMood === mood 
                      ? 'bg-accent-blue/20 ring-2 ring-accent-blue' 
                      : 'hover:bg-background-tertiary'
                  }`}
                >
                  {moodIcons[mood]}
                  <span className="text-xs text-text-muted">{moodLabels[mood]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Вміст *
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
              placeholder="Розкажіть про свій день..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Теги (через кому)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="робота, відпочинок, сім'я"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setShowCreateModal(false); setEditingEntry(null); resetForm(); }}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Збереження...' : editingEntry ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
