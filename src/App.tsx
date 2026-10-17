import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { requestJson } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import Activities from './pages/Activities';
import Resources from './pages/Resources';
import Classmates from './pages/Classmates';

interface User {
  id: string;
  name: string;
  student_id: string;
  role: 'admin' | 'member';
  avatar_url?: string;
  bio?: string;
  contact?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await requestJson<User | null>('/api/app/users');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const userId = localStorage.getItem('user_id');
    if (userId) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/classmates" element={<Classmates />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
