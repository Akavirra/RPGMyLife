import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, skills, quests } from '@/lib/db/schema';
import { verifySessionToken } from '@/lib/telegram/verify';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/layout/Header';
import { CharacterStats } from '@/components/character/CharacterStats';
import { QuestCard } from '@/components/quest/QuestCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, Scroll, Trophy } from 'lucide-react';

interface UserData {
  id: number;
  firstName: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
}

interface SkillData {
  id: number;
  name: string;
  level: number;
  xp: number;
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session');

  let userData: UserData | null = null;
  let skillData: SkillData[] = [];
  let activeQuests: any[] = [];
  let completedQuestsCount = 0;

  if (sessionToken?.value) {
    const session = await verifySessionToken(sessionToken.value);
    if (session) {
      // Fetch user from database
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (dbUser) {
        userData = {
          id: dbUser.id,
          firstName: dbUser.firstName,
          username: dbUser.username,
          avatarUrl: dbUser.avatarUrl,
          level: dbUser.level,
          totalXp: dbUser.totalXp,
        };

        // Fetch user skills
        const dbSkills = await db.query.skills.findMany({
          where: eq(skills.userId, session.userId),
        });

        skillData = dbSkills.map(s => ({
          id: s.id,
          name: s.name,
          level: s.level,
          xp: s.xp,
        }));

        // Fetch user quests
        const dbQuests = await db.query.quests.findMany({
          where: eq(quests.userId, session.userId),
        });

        activeQuests = dbQuests.filter(q => q.status === 'active');
        completedQuestsCount = dbQuests.filter(q => q.status === 'completed').length;
      }
    }
  }

  // If not logged in, show welcome screen
  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header title="Life RPG" />
        
        <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-amber-400 font-cinzel">
              Life RPG
            </h1>
            <p className="text-slate-400 max-w-xs mx-auto">
              Перетвори своє життя на пригоду. Створюй квести, розвивай навички, досягай цілей.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Увійди через Telegram, щоб почати:
              </p>
              <div id="telegram-login-container">
                <a 
                  href="https://t.me/rpgmylife_bot?start=login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Увійти через Telegram
                </a>
                <p className="text-xs text-slate-600 mt-3">
                  Або відкрий додаток через бота @rpgmylife_bot
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Life RPG" />
      
      <main className="p-4 space-y-6">
        {/* Character Stats */}
        <CharacterStats
          user={userData}
          skills={skillData}
          activeQuestsCount={activeQuests.length}
          completedQuestsCount={completedQuestsCount}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quests/new">
            <Button className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Новий квест
            </Button>
          </Link>
          <Link href="/quests">
            <Button variant="secondary" className="w-full" size="lg">
              <Scroll className="w-5 h-5 mr-2" />
              Всі квести
            </Button>
          </Link>
        </div>

        {/* Active Quests Preview */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Активні квести
            </CardTitle>
            <Link href="/quests">
              <Button variant="ghost" size="sm">
                Дивитись всі
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeQuests.length > 0 ? (
              <div className="space-y-3">
                {activeQuests.slice(0, 3).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  Квестів ще немає
                </p>
                <Link href="/quests/new">
                  <Button variant="outline" size="sm" className="mt-3">
                    Створити перший квест
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
