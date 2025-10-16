import { NewTransactionForm } from './form';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getFormData(accountId: string) {
  const categories = await prisma.category.findMany({
    where: { account_id: accountId },
  });

  return { categories };
}

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;
  const accountId = session?.user?.defaultAccountId;

  if (!clientId) {
    return <div>Error: Not logged in</div>;
  }

  const { categories } = await getFormData(accountId);

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Create a New Transaction</h1>
        <NewTransactionForm categories={categories} />
      </div>
    </div>
  );
}
