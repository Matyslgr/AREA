import { OAuthLoginButton } from "./oauth-login-button";

export const GoogleLoginButton = () => {
  return (
    <OAuthLoginButton
      provider="google"
      className="bg-red-500 hover:bg-red-600"
      icon={
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.805 10.023h-9.818v3.951h5.792c-.247 1.451-1.605 4.26-5.792 4.26-3.487 0-6.318-2.887-6.318-6.44s2.831-6.44 6.318-6.44c1.986 0 3.32.847 4.09 1.577l2.782-2.682c-1.844-1.713-4.204-2.763-6.872-2.763-5.659 0-10.253 4.601-10.253 10.263s4.594 10.263 10.253 10.263c5.926 0 9.856-4.154 9.856-10.023 0-.678-.076-1.201-.171-1.723z" />
        </svg>
      }
    >
      Sign in with Google
    </OAuthLoginButton>
  );
};