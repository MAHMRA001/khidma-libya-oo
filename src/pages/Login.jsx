import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter email and password.');
      return;
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

      localStorage.setItem('khidma_token', data.token);
      localStorage.setItem('khidma_user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/welcome');
      }
    } catch (err) {
      setError('Could not connect to backend.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email and password.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="your@email.com"
          className="w-full h-12 rounded-xl border border-border px-4 bg-background mb-3"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Password"
          className="w-full h-12 rounded-xl border border-border px-4 bg-background mb-3"
        />

        {error && (
          <p className="text-sm text-red-500 mb-3">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl">
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          className="w-full mt-4 text-sm underline"
        >
          {mode === 'login'
            ? 'No account? Create one'
            : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}