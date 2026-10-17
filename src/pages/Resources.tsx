import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../App';
import { requestJson } from '../api';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  uploader_name: string;
  created_at: string;
}

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const loadResources = async () => {
    try {
      const data = await requestJson<{ resources: Resource[] }>('/api/app/resources');
      setResources(data.resources);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) {
      setError('请填写标题和文件链接');
      return;
    }

    try {
      await requestJson('/api/app/resources', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          file_url: fileUrl,
          file_name: fileName || title,
        }),
      });
      setTitle('');
      setDescription('');
      setFileUrl('');
      setFileName('');
      setShowDialog(false);
      loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个资源吗？')) return;
    try {
      await requestJson('/api/app/resources', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      loadResources();
    } catch (err) {
      alert('删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">学习资料</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>分享资料</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>分享学习资料</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">资料标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入资料标题"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">资料描述</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入资料描述（可选）"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">文件链接</label>
                <Input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="请输入文件下载链接"
                />
                <p className="text-xs text-muted-foreground">
                  请输入文件的完整下载链接（如网盘链接、云存储链接等）
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">文件名</label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="请输入文件名（可选）"
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit">分享</Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">加载中...</div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无学习资料，快来分享第一个吧！
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{resource.uploader_name}</span>
                      <span>·</span>
                      <span>{formatDate(resource.created_at)}</span>
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.name === resource.uploader_name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      删除
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resource.description && (
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    <span>📥</span>
                    <span>下载 {resource.file_name}</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
