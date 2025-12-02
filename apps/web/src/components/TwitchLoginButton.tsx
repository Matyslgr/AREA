import { Button } from "@/components/ui/button"

export function TwitchLoginButton() {
  const handleLogin = () => {
    localStorage.setItem('oauth_provider', 'twitch');

    const rootUrl = 'https://id.twitch.tv/oauth2/authorize';

    const options = {
      client_id: import.meta.env.VITE_TWITCH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_TWITCH_REDIRECT_URI,
      response_type: 'code',
      scope: 'user:read:email channel:read:subscriptions',
    };

    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <Button
      variant="outline"
      className="w-full mt-2 bg-[#9146FF] text-white hover:bg-[#772ce8] hover:text-white border-none"
      onClick={handleLogin}
    >
      {/* Twitch Icon SVG */}
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
      Sign in with Twitch
    </Button>
  )
}