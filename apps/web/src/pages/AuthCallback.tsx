import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from "@/lib/api";
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  message: string;
  isNewUser?: boolean;
  isNewAccount?: boolean;
  hasPassword?: boolean;
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
      navigate('/signin?error=missing_code');
      return;
    }

    const stateData = parseState(state);
    const provider = stateData?.provider;

    if (!provider) {
      console.error('No provider found in state');
      navigate('/signin?error=missing_provider');
      return;
    }

    const mode = stateData?.mode || 'login';

    const processAuth = async () => {
      try {
        let data: AuthResponse;

        console.log(`🔄 Processing OAuth | Provider: ${provider} | Mode: ${mode}`);

        if (mode === 'connect') {
          // Restore token from state if present (handles localhost <-> 127.0.0.1 issue)
          const tokenFromState = stateData?.token;
          if (tokenFromState) {
            console.log("🔑 Restoring token from OAuth state:", tokenFromState.substring(0, 20) + "...");
            localStorage.setItem('area-token', tokenFromState);
          }

          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          console.log("🔗 CONNECT MODE - Token in localStorage:", token ? token.substring(0, 20) + "..." : "NULL");

          data = await api.post('/auth/oauth/link', {
            provider,
            code
          });
          console.log("✅ Service linked successfully:", data);

          // Check if we should redirect to a specific page
          const redirectTo = localStorage.getItem('oauth-redirect');
          if (redirectTo) {
            localStorage.removeItem('oauth-redirect');
            navigate(redirectTo);
          } else {
            navigate('/account-setup');
          }
        } else {
          data = await api.post<AuthResponse>('/auth/oauth/login', {
            provider,
            code
          });

          const token = data.token;
          const user = data.user;
          const isNewUser = data.isNewUser;

          if (!token) {
            throw new Error("No token received from server");
          }

          console.log("Storing token:", token.substring(0, 20) + "...");
          localStorage.setItem('area-token', token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

          if (isNewUser) {
            console.log("🆕 New user, redirecting to account setup");
            navigate('/account-setup');
          } else {
            console.log("👤 Existing user, redirecting to dashboard");
            navigate('/dashboard');
          }
        }

      } catch (error) {
        console.error('Login failed', error);
        navigate('/signin?error=auth_failed');
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