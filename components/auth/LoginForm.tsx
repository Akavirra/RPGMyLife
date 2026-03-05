'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/components/AuthProvider';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, firstName, username || undefined);
      }
      // Reload the page to update server-side session
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">
          {isLogin ? 'Вхід в систему' : 'Реєстрація'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Ім'я
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-notion"
                  required={!isLogin}
                  placeholder="Ваше ім'я"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Username (необов'язково)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-notion"
                  placeholder="username"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-notion"
              required
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-notion"
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Завантаження...' : isLogin ? 'Увійти' : 'Зареєструватися'}
          </Button>

          <p className="text-center text-text-secondary text-sm">
            {isLogin ? 'Ще немає акаунту? ' : 'Вже є акаунт? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-accent-blue hover:underline"
            >
              {isLogin ? 'Зареєструватися' : 'Увійти'}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
