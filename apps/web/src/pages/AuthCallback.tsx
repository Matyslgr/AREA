import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      console.error('No code found');
      navigate('/login');
      return;
    }

    const provider = localStorage.getItem('oauth_provider');

    const login = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/oauth/login`, {
          provider: provider,
          code: code,
        });

        localStorage.removeItem('oauth_provider');

        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        navigate('/dashboard');

      } catch (error) {
        console.error('Login failed', error);
        navigate('/login?error=auth_failed');
      }
    };

    login();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Authenticating...</p>
    </div>
  );
};