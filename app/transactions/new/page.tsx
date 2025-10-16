import { NewTransactionForm } from './form';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getFormData(clientId: string) {
  const accounts = await prisma.account.findMany({
    where: { client_id: clientId },
  });

  const categories = await prisma.category.findMany({
    where: { client_id: clientId },
  });

  return { accounts, categories };
}

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;

  if (!clientId) {
    return <div>Error: Not logged in</div>;
  }

  const { accounts, categories } = await getFormData(clientId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Create a New Transaction</h1>
        <NewTransactionForm accounts={accounts} categories={categories} />
      </div>
    </div>
  );
}
