import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { requestJson } from '../api';

interface User {
  id: string;
  name: string;
  student_id: string;
  role: 'admin' | 'member';
}

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    // Fetch list of registered users for login selection
    if (!isRegister) {
      requestJson<{ classmates: User[] }>(`/api/app/classmates?t=${Date.now()}`)
        .then((data) => {
          console.log('Classmates data:', data);
          setUsers(data.classmates);
        })
        .catch((err) => {
          console.error('Failed to fetch classmates:', err);
          setUsers([]);
        });
    }
  }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name) {
          setError('请填写姓名');
          return;
        }
        const userData = await requestJson<User>('/api/app/users', {
          method: 'POST',
          body: JSON.stringify({
            name,
            invite_code: inviteCode,
          }),
        });
        // Store user info in localStorage
        localStorage.setItem('user_id', userData.id);
        localStorage.setItem('user_name', userData.name);
      } else {
        // Login: store selected user info
        if (!selectedUserId) {
          setError('请选择您的姓名');
          return;
        }
        const user = users.find((u) => u.id === selectedUserId);
        if (user) {
          localStorage.setItem('user_id', user.id);
          localStorage.setItem('user_name', user.name);
        }
      }
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">药学2602班级网站</CardTitle>
          <CardDescription>
            {isRegister ? '注册新账号' : '选择您的账号登录'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">姓名</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">邀请码</label>
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="请输入邀请码"
                  />
                  <p className="text-xs text-muted-foreground">
                    首位用户自动成为管理员，其他用户需要邀请码
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">选择姓名</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">请选择</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '处理中...' : isRegister ? '注册' : '登录'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSelectedUserId('');
              }}
            >
              {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
