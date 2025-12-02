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
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.805 10.023h-9.818v3.951h5.792c-.247 1.451-1.605 4.26-5.792 4.26-3.487 0-6.318-2.887-6.318-6.44s2.831-6.44 6.318-6.44c1.986 0 3.32.847 4.09 1.577l2.782-2.682c-1.844-1.713-4.204-2.763-6.872-2.763-5.659 0-10.253 4.601-10.253 10.263s4.594 10.263 10.253 10.263c5.926 0 9.856-4.154 9.856-10.023 0-.678-.076-1.201-.171-1.723z" />
      </svg>
      Sign in with Google
    </Button>
  );
};