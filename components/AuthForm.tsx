'use client';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Google login setup ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ code: codeResponse.code }),
          credentials: 'include'
        });

        if (res.ok) {
          setMessage('Logged in with Google ✅');
          router.push('/dashboard');
        } else {
          const data = await res.json();
          setMessage(data.message || 'Google login failed.');
        }
      } catch (err) {
        console.error(err);
        // console.log(codeResponse)
        setMessage('Error during Google login.');
      }
    },
    flow: 'auth-code',
    ux_mode: 'popup',
    scope: 'openid email profile',
  });

  // --- Email/password submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const endpoint = isLogin
      ? `${process.env.NEXT_PUBLIC_API_URL}/api_dm/auth/login`
      : `${process.env.NEXT_PUBLIC_API_URL}/api_dm/auth/register`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(isLogin ? 'Login successful ✅' : 'Account created 🎉');
      router.refresh(); 
      router.push('/dashboard');
      
    } else {
      setMessage(data.message || 'Something went wrong.');
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded-md p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border border-gray-300 rounded-md p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">or</div>

      {/* Google sign in */}
      <button
        onClick={() => googleLogin()}
        className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition w-full"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-600">
        {isLogin ? 'No account?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>

      {message && <p className="text-center text-sm text-red-600">{message}</p>}
    </div>
  );
}
