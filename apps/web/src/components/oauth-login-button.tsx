import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface OAuthLoginButtonProps extends React.ComponentProps<typeof Button> {
  provider: string;
  icon: React.ReactNode;
  bgColor?: string;
  children?: React.ReactNode;
}

export const OAuthLoginButton = ({
  provider,
  icon,
  className,
  children,
  ...props
}: OAuthLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const response = await api.get<{ url: string }>(`/auth/oauth/authorize/${provider}`);

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
