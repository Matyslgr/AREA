import { Button } from './ui/button';

export const GoogleLoginButton = () => {
  const handleLogin = () => {
    localStorage.setItem('oauth_provider', 'google');

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = {
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options).toString();

    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <Button onClick={handleLogin} className="w-full bg-red-500 hover:bg-red-600">
      Se connecter avec Google
    </Button>
  );
};