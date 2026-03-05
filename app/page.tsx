import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, skills, quests } from '@/lib/db/schema';
import { verifySessionToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/layout/Header';
import { CharacterStats } from '@/components/character/CharacterStats';
import { QuestCard } from '@/components/quest/QuestCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
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

  // If not logged in, show login form only
  if (!userData) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4 md:p-8">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <Header title="Life RPG" />
      
      <main className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Character Stats */}
        <CharacterStats
          user={userData}
          skills={skillData}
          activeQuestsCount={activeQuests.length}
          completedQuestsCount={completedQuestsCount}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          <Link href="/quests/new">
            <Button className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Новий квест</span>
              <span className="sm:hidden">Новий</span>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg md:text-xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQuests.slice(0, 3).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">
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
