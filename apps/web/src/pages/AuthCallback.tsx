import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from "@/lib/api";
import { STORAGE_KEYS } from '@/lib/constants';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const called = useRef(false);
  const [searchParams] = useSearchParams();

  const decodeState = (state: string) => {
    try {
      const binaryString = atob(state);
      const utf8String = new TextDecoder().decode(new Uint8Array(binaryString.split('').map(c => c.charCodeAt(0))));
      return JSON.parse(utf8String);
    } catch (err) {
      console.error("Failed to decode state:", err);
      return null;
    }
  };

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const isLinked = searchParams.get('linked') === 'true';
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const state = searchParams.get('state');

    if (error) {
      console.error("OAuth Error:", error);
      if (state) {
        const stateData = decodeState(state);
        if (stateData?.redirect) {
          navigate(`${stateData.redirect}?error=${error}`);
          return;
        }
      }
      navigate(`/signin?error=${error}`);
      return;
    }
    console.log("OAuth Callback Params:", { token, isLinked, isNewUser });

    if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        api.get<{ id: string, username: string, email: string }>('/auth/me').then(user => {
          console.log("User logged in:", user.username);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          if (isNewUser) {
            window.location.href = '/account-setup';
          } else {
            window.location.href = '/dashboard';
          }
        }).catch(err => {
          console.error("Failed to fetch user data:", err);
          navigate('/signin?error=user_fetch_failed');
        });
        return;
    }

    if (isLinked) {
      console.log("Service linked successfully, state:", state);
      if (state) {
        const stateData = decodeState(state);
        console.log("Decoded state data:", stateData);
        if (stateData && stateData.redirect) {
          console.log("Redirecting to:", stateData.redirect);
          window.location.href = stateData.redirect;
          return;
        }
      }
      console.log("No redirect found, falling back to /account-setup");
      window.location.href = '/account-setup';
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