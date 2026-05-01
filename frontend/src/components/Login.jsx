import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';

export default function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState(null);

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const res = await axios.post('http://localhost:8000/auth/token', params);
        setToken(res.data.access_token);
      } else {
        await axios.post('http://localhost:8000/auth/register', { username, password, role });
        setIsLogin(true);
        setMessage({ type: 'success', text: 'Registration successful. Please login.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'An error occurred.',
      });
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel animate-slide-up">
        <div className="auth-brand">
          <span className="brand-icon">
            <CheckCircle2 size={26} />
          </span>
          <div>
            <h1>Team Task Manager</h1>
            <p>{isLogin ? 'Welcome back' : 'Create your workspace account'}</p>
          </div>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => switchMode(true)}
            aria-pressed={isLogin}
          >
            Sign In
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => switchMode(false)}
            aria-pressed={!isLogin}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className={`notice notice-${message.type}`} role="status">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {!isLogin && (
            <label>
              <span>Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <button type="submit" className="btn-primary auth-submit">
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </section>
    </main>
  );
}
