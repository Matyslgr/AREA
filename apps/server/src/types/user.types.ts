import { Prisma, User, Account } from '@prisma/client';

const userWithAccountsConfig = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { accounts: true }
});

export type UserWithAccounts = Prisma.UserGetPayload<typeof userWithAccountsConfig>;
