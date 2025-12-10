export interface LinkedAccountDto {
  id: string;
  provider: string;
  provider_account_id: string;
  expires_at: string | Date | null;
  scopes: string[];
}

export interface AccountDetailsDto {
  id: string;
  email: string;
  username: string;
  hasPassword: boolean;
  linkedAccounts: LinkedAccountDto[];
}
