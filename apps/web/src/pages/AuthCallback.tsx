import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from "@/lib/api";
import { STORAGE_KEYS } from '@/lib/constants';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const called = useRef(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const isLinked = searchParams.get('linked') === 'true';
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (error) {
      console.error("OAuth Error:", error);
      navigate(`/signin?error=${error}`);
      return;
    }
    console.log("OAuth Callback Params:", { token, isLinked, isNewUser });

    // Case 1: LOGIN
    if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        api.get<{ id: string, username: string, email: string }>('/auth/me').then(user => {
          console.log("User logged in:", user.username);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          if (isNewUser) {
            navigate('/account-setup');
          } else {
            navigate('/dashboard');
          }
        }).catch(err => {
          console.error("Failed to fetch user data:", err);
          navigate('/signin?error=user_fetch_failed');
        });
        return;
    }

    // Case 2: LINK ACCOUNT
    if (isLinked) {
      const redirectTo = localStorage.getItem('oauth-redirect');
      if (redirectTo) {
        localStorage.removeItem('oauth-redirect');
        navigate(redirectTo);
      } else {
        navigate('/account-setup');
      }
      return;
    }

    navigate('/signin?error=invalid_callback');
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="text-gray-500">Authenticating...</p>
    </div>
  );
};