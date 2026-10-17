import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../App';
import { requestJson } from '../api';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  photos: string[];
  author_name: string;
  created_at: string;
}

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [photos, setPhotos] = useState<string>('');
  const [error, setError] = useState('');

  const loadActivities = async () => {
    try {
      const data = await requestJson<{ activities: Activity[] }>('/api/app/activities');
      setActivities(data.activities);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !activityDate) {
      setError('请填写标题和日期');
      return;
    }

    try {
      const photoArray = photos
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await requestJson('/api/app/activities', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          activity_date: activityDate,
          photos: photoArray,
        }),
      });
      setTitle('');
      setDescription('');
      setActivityDate('');
      setPhotos('');
      setShowDialog(false);
      loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条活动记录吗？')) return;
    try {
      await requestJson('/api/app/activities', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      loadActivities();
    } catch (err) {
      alert('删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">活动相册</h1>
        {user?.role === 'admin' && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>添加活动</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加新活动</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">活动标题</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入活动标题"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">活动日期</label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">活动描述</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请输入活动描述"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">照片链接</label>
                  <Textarea
                    value={photos}
                    onChange={(e) => setPhotos(e.target.value)}
                    placeholder="每行一个图片URL（可选）"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    请输入图片的完整URL地址，每行一个
                  </p>
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit">创建</Button>
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    取消
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">加载中...</div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无活动记录
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{activity.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(activity.activity_date)}</span>
                      <span>·</span>
                      <span>{activity.author_name}</span>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      删除
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activity.description && (
                  <p className="whitespace-pre-wrap text-sm">{activity.description}</p>
                )}
                {activity.photos && activity.photos.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activity.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${activity.title} - ${idx + 1}`}
                        className="aspect-square w-full rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
