import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface OAuthLoginButtonProps extends React.ComponentProps<typeof Button> {
  provider: string;
  icon: React.ReactNode;
  mode?: 'login' | 'connect';
  scopes?: string[];
  linked?: boolean;
}

export const OAuthLoginButton = ({
  provider,
  icon,
  mode = 'login',
  scopes = [],
  linked = false,
  className,
  children,
  ...props
}: OAuthLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (linked) return;

    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append('mode', mode);
      if (scopes.length > 0) {
        queryParams.append('scope', scopes.join(' '));
      }

      const response = await api.get<{ url: string }>(`/auth/oauth/authorize/${provider}?${queryParams.toString()}`);

      window.location.href = response.url;

    } catch (error) {
      console.error(`Error initiating ${provider} OAuth:`, error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className={cn("w-full text-white font-medium", className)}
      type="button"
      {...props}
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <>
          <span className="mr-2 h-4 w-4 flex items-center justify-center">
            {icon}
          </span>
          {children || `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
        </>
      )}
    </Button>
  );
};
