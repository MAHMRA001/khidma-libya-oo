import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const user = await loginWithEmail(cleanEmail);

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/welcome');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email to continue.
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

        {error && (
          <p className="text-sm text-red-500 mb-3">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl">
          Continue
        </Button>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Admin email: mraiwamahmod@gmail.com
        </p>
      </form>
    </div>
  );
}