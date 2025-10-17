import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { EditTransactionForm } from './form';
export const metadata = { title: 'Update Transaction' };

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
    const prisma = new PrismaClient();
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const accountId = session?.user?.defaultAccountId;

    if (!clientId) {
        return <div>Error: Not logged in</div>;
    }

    const trxId = params?.id;
    const trx = await prisma.trx.findUnique({ where: { id: trxId }, include: { account: true, category: true } });

    const categories = await prisma.category.findMany({ where: { account_id: accountId } });

    if (!trx) {
        return <div>Transaction not found</div>;
    }

    const initial = {
        total: trx.total,
        dateInput: trx.date_input
            ? (typeof trx.date_input === 'string'
                ? trx.date_input
                : new Date(trx.date_input).toISOString().slice(0, 10))
            : '',
        categoryId: trx.category?.id ?? '',
        note: trx.note ?? '',
        isExpense: trx.is_expense,
        accountId: trx.account_id
    };

    return (
        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
            <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Update Transaction</h1>
            <EditTransactionForm initial={initial} categories={categories} trxId={trxId} />
        </div>
    );
}