export interface OAuthUser {
  id: string;   // Unique ID from the provider
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // in seconds
}

export interface IOAuthProvider {
  name: string; // "google", "github"...

  // Step 1: Obtain tokens using the code
  getTokens(code: string): Promise<OAuthTokens>;

  // Step 2: Obtain the standardized profile
  getUserInfo(token: string): Promise<OAuthUser>;
}