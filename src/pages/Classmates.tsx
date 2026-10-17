import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { requestJson } from '../api';

interface Classmate {
  id: string;
  name: string;
  student_id: string;
  avatar_url?: string;
  bio?: string;
  contact?: string;
  created_at: string;
}

export default function Classmates() {
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClassmates = async () => {
      try {
        const data = await requestJson<{ classmates: Classmate[] }>('/functions/v1/app/classmates');
        setClassmates(data.classmates);
      } catch (err) {
        console.error('Failed to load classmates:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClassmates();
  }, []);

  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">同学录</h1>
        <p className="mt-2 text-muted-foreground">药学2602班全体成员</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">加载中...</div>
      ) : classmates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无成员信息
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classmates.map((classmate) => (
            <Card key={classmate.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={classmate.avatar_url} alt={classmate.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(classmate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-semibold">{classmate.name}</h3>
                  <p className="text-sm text-muted-foreground">学号：{classmate.student_id}</p>
                  {classmate.bio && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                      {classmate.bio}
                    </p>
                  )}
                  {classmate.contact && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <span>📧</span>
                      <span>{classmate.contact}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
