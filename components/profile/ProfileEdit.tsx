'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/components/AuthProvider';
import { Upload, X, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  username: string | null;
  firstName: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEdit({ isOpen, onClose }: ProfileEditProps) {
  const { user: authUser, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Original user data (for cancel functionality)
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // UI state
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && authUser) {
      setOriginalData(authUser);
      setUsername(authUser.username || '');
      setFirstName(authUser.firstName);
      setAvatarUrl(authUser.avatarUrl);
      setAvatarPreview(authUser.avatarUrl);
      setErrors([]);
      setSuccessMessage('');
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, authUser]);
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return (
      username !== (originalData.username || '') ||
      firstName !== originalData.firstName ||
      avatarUrl !== originalData.avatarUrl ||
      currentPassword !== '' ||
      newPassword !== '' ||
      confirmPassword !== ''
    );
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors([{ field: 'avatar', message: 'Дозволені формати: JPEG, PNG, WEBP, GIF' }]);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors([{ field: 'avatar', message: 'Розмір файлу не повинен перевищувати 5MB' }]);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors([]);
    }
  };
  
  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validate password
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Пароль повинен містити мінімум 8 символів';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return 'Пароль повинен містити великі та малі літери, цифри та спеціальні символи';
    }
    return null;
  };
  
  // Get error for field
  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };
  
  // Handle profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');
    setLoading(true);
    
    try {
      // Check if there's a file to upload
      const file = fileInputRef.current?.files?.[0];
      
      if (file) {
        // Use multipart form data for file upload
        const formData = new FormData();
        formData.append('avatar', file);
        if (username !== (originalData?.username || '')) {
          formData.append('username', username);
        }
        if (firstName !== originalData?.firstName) {
          formData.append('firstName', firstName);
        }
        
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          body: formData,
          credentials: 'include',
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (data.errors) {
            setErrors(data.errors);
          } else {
            setErrors([{ field: 'general', message: data.error || 'Помилка оновлення профілю' }]);
          }
          return;
        }
        
        // Update auth context
        if (data.user) {
          setUser(data.user);
        }
        
        setSuccessMessage('Профіль успішно оновлено!');
        setOriginalData(data.user);
        setAvatarUrl(data.user.avatarUrl);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // JSON update (no file)
        const updateData: Record<string, any> = {};
        
        if (username !== (originalData?.username || '')) {
          updateData.username = username;
        }
        if (firstName !== originalData?.firstName) {
          updateData.firstName = firstName;
        }
        
        // Only send request if there are changes
        if (Object.keys(updateData).length > 0) {
          const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
            credentials: 'include',
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            if (data.errors) {
              setErrors(data.errors);
            } else {
              setErrors([{ field: 'general', message: data.error || 'Помилка оновлення профілю' }]);
            }
            return;
          }
          
          // Update auth context
          if (data.user) {
            setUser(data.user);
          }
          
          setSuccessMessage('Профіль успішно оновлено!');
          setOriginalData(data.user);
        } else {
          setSuccessMessage('Змін не було внесено');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors([{ field: 'general', message: 'Внутрішня помилка сервера' }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');
    setLoading(true);
    
    // Validate passwords client-side
    if (!currentPassword) {
      setErrors([{ field: 'currentPassword', message: 'Введіть поточний пароль' }]);
      setLoading(false);
      return;
    }
    
    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setErrors([{ field: 'newPassword', message: passwordError }]);
        setLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setErrors([{ field: 'confirmPassword', message: 'Паролі не співпадають' }]);
        setLoading(false);
        return;
      }
    }
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([{ field: 'general', message: data.error || 'Помилка зміни пароля' }]);
        }
        return;
      }
      
      setSuccessMessage('Пароль успішно змінено!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      setErrors([{ field: 'general', message: 'Внутрішня помилка сервера' }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      if (confirm('Всі незбережені зміни будуть втрачені. Продовжити?')) {
        // Reset to original data
        if (originalData) {
          setUsername(originalData.username || '');
          setFirstName(originalData.firstName);
          setAvatarUrl(originalData.avatarUrl);
          setAvatarPreview(originalData.avatarUrl);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors([]);
        setSuccessMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Редагування профілю"
      size="lg"
    >
      {/* Tabs */}
      <div className="flex border-b border-border-light mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-4 h-4 inline-block mr-2" />
          Профіль
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4 inline-block mr-2" />
          Пароль
        </button>
      </div>
      
      {/* Error/Success Messages */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error.message}
            </p>
          ))}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </p>
        </div>
      )}
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          {/* Avatar Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Аватар
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border-light">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-background-tertiary flex items-center justify-center border-2 border-dashed border-border-light">
                    <User className="w-10 h-10 text-text-muted" />
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-background-tertiary hover:bg-border-light rounded-lg transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Завантажити
                </button>
                <p className="text-xs text-text-muted mt-1">
                  JPEG, PNG, WEBP, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>
          
          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ім'я користувача
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`input-notion w-full ${
                getFieldError('username') ? 'border-red-500' : ''
              }`}
              placeholder="username"
            />
            {getFieldError('username') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('username')}</p>
            )}
            <p className="text-xs text-text-muted mt-1">
              3-30 символів, літери, цифри, підкреслення та дефіси
            </p>
          </div>
          
          {/* First Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ім'я
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-notion w-full"
              placeholder="Ваше ім'я"
            />
          </div>
          
          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={originalData?.email || ''}
              disabled
              className="input-notion w-full bg-background-tertiary cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">
              Email не можна змінити
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      )}
      
      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Поточний пароль
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`input-notion w-full pr-10 ${
                    getFieldError('currentPassword') ? 'border-red-500' : ''
                  }`}
                  placeholder="Введіть поточний пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getFieldError('currentPassword') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('currentPassword')}</p>
              )}
            </div>
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Новий пароль
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`input-notion w-full pr-10 ${
                    getFieldError('newPassword') ? 'border-red-500' : ''
                  }`}
                  placeholder="Введіть новий пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getFieldError('newPassword') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('newPassword')}</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                Мінімум 8 символів, великі та малі літери, цифри, спеціальні символи
              </p>
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Підтвердження пароля
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-notion w-full pr-10 ${
                    getFieldError('confirmPassword') ? 'border-red-500' : ''
                  }`}
                  placeholder="Повторіть новий пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('confirmPassword')}</p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Змінити пароль'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
