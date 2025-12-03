import { OAuthLoginButton } from "./oauth-login-button";

export const NotionLoginButton = () => {
  return (
    <OAuthLoginButton
      provider="notion"
      className="bg-white text-black hover:bg-gray-100 border border-gray-300"
      icon={
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
          alt="Notion Logo"
          className="w-full h-full"
        />
      }
    >
      Sign in with Notion
    </OAuthLoginButton>
  );
};