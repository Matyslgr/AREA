import { Button } from "@/components/ui/button"

export function NotionLoginButton() {
  const handleLogin = () => {
    localStorage.setItem('oauth_provider', 'notion');

    const rootUrl = 'https://api.notion.com/v1/oauth/authorize';

    const options = {
      client_id: import.meta.env.VITE_NOTION_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_NOTION_REDIRECT_URI,
      response_type: 'code',
      owner: 'user',
    };

    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <Button
      variant="outline"
      className="w-full mt-2 bg-white text-black hover:bg-gray-100 border border-gray-300"
      onClick={handleLogin}
    >
      {/* Notion Icon SVG */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
        alt="Notion Logo"
        className="mr-2 h-4 w-4"
      />
      Sign in with Notion
    </Button>
  )
}
