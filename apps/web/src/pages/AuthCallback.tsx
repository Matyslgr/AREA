import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from "@/lib/api";

interface AuthResponse {
  token: string;
  user: any;
  message: string;
}

const parseState = (state: string | null) => {
  if (!state) return null;
  try {
    const base64 = state.replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = atob(base64);
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("Invalid state format:", e);
    return null;
  }
};

export const AuthCallback = () => {
  const navigate = useNavigate();
  const called = useRef(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('No code found');
      navigate('/login?error=missing_code');
      return;
    }

    const stateData = parseState(state);
    const provider = stateData?.provider;

    if (!provider) {
      console.error('No provider found in state');
      navigate('/login?error=missing_provider');
      return;
    }

    const mode = stateData?.mode || 'login';

    const processAuth = async () => {
      try {
        let data: AuthResponse;

        console.log(`🔄 Processing OAuth | Provider: ${provider} | Mode: ${mode}`);

        if (mode === 'connect') {
          data = await api.post('/auth/oauth/link', {
            provider,
            code
          });
        } else {
          data = await api.post('/auth/oauth/login', {
            provider,
            code
          });

          const { token, user } = data;
          localStorage.setItem('token', token);
          localStorage.setItem('area-user', JSON.stringify(user));
        }
        console.log("✅ Success:", data);
        navigate('/dashboard');

      } catch (error) {
        console.error('Login failed', error);
        navigate('/login?error=auth_failed');
      }
    };

    processAuth();
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="text-gray-500">Authenticating...</p>
    </div>
  );
};
