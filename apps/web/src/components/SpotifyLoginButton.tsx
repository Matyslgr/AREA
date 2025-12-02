import { Button } from "@/components/ui/button"

export function SpotifyLoginButton() {
  const handleLogin = () => {
    localStorage.setItem('oauth_provider', 'spotify');
    const rootUrl = 'https://accounts.spotify.com/authorize';

    const options = {
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      response_type: 'code',
      scope: [
        'user-read-private',
        'user-read-email',
        'user-modify-playback-state',
        'user-read-playback-state'
      ].join(' '),
    };

    const qs = new URLSearchParams(options).toString();

    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <Button
      variant="outline"
      className="w-full mt-2 bg-[#1DB954] text-white hover:bg-[#1ed760] hover:text-white border-none"
      onClick={handleLogin}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.5 1.56.419.24.6.841.241 1.261zm.12-3.36C15.54 8.46 9.06 8.22 5.28 9.36c-.599.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.44-1.32 11.7-1.08 15.96 1.44.6.36.78 1.14.42 1.74-.36.6-1.14.78-1.74.42z"/>
      </svg>
      Sign in with Spotify
    </Button>
  )
}
