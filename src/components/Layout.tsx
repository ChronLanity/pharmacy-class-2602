import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/announcements', label: '班级公告' },
    { path: '/activities', label: '活动相册' },
    { path: '/resources', label: '学习资料' },
    { path: '/classmates', label: '同学录' },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">药学2602</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  location.pathname === item.path ? 'bg-accent font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            {user?.role === 'admin' && (
              <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                管理员
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
