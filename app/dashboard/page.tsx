import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import ClientDashboard from './ClientDashboard';

const prisma = new PrismaClient();

type AccountType = {
  id: string;
  name: string;
  created_at?: Date | string;
};

type TransactionType = {
  id: string;
  date_input: Date | string;
  account: { id: string; name: string };
  category?: { name?: string } | null;
  total: number;
  is_expense: boolean;
};

async function getDashboardData(clientId: string, accountId: string) {
  const accounts = await prisma.account.findMany({
    where: { client_id: clientId },
  });

  const transactions = await prisma.trx.findMany({
    where: {
      account_id: accountId,
    },
    orderBy: {
      date_input: 'desc',
    },
    include: {
      account: true,
      category: true,
    },
  });

  return { accounts, transactions };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;
  const accountId = session?.user?.defaultAccountId;

  if (!clientId) {
    return <div>Error: Not logged in</div>;
  }

  const { accounts, transactions } = await getDashboardData(clientId, accountId);

  return (
    <ClientDashboard
      accounts={accounts as AccountType[]}
      transactions={transactions as TransactionType[]}
      defaultAccountId={accountId}
    />
  );
}