import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const userId = session?.user?.id;
    const accountId = session?.user?.defaultAccountId;

    if (!clientId || !userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { total, categoryId, note, isExpense, dateInput } = await req.json();

    if (!total || !dateInput || !accountId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let finalCategoryId = categoryId;

    // If categoryId is a string but not a valid ObjectId, it's a new category
    if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      const newCategory = await prisma.category.create({
        data: {
          name: categoryId,
          account: { connect: { id: accountId } },
        } as Prisma.CategoryCreateInput,
      });
      finalCategoryId = newCategory.id;
    }

    const trxData: Prisma.TrxCreateInput = {
      total,
      is_expense: isExpense,
      date_input: new Date(dateInput),
      account: { connect: { id: accountId } },
      category: { connect: { id: finalCategoryId } },
      user: { connect: { id: userId } },
      note: note ?? undefined,
    };
    const transaction = await prisma.trx.create({
      data: trxData,
    });

    // Update account balance based on the new transaction
    const accountForUpdate = await prisma.account.findUnique({ where: { id: accountId } }) as unknown as { balance?: number } | null;
    if (accountForUpdate) {
      const currentBalance = (accountForUpdate as { balance?: number } | null)?.balance ?? 0;
      const newBalance = currentBalance + (isExpense ? -total : total);
      await prisma.account.update({ where: { id: accountId }, data: { balance: newBalance } } as unknown as { where: { id: string }; data: { balance: number } });
    }

    return NextResponse.json({ message: 'Transaction created successfully', transaction }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const userId = session?.user?.id;

    if (!clientId || !userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { id, total, dateInput, isExpense, categoryId, note } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Missing required field: id' }, { status: 400 });
    }

    const existing = await prisma.trx.findUnique({ where: { id }, include: { account: true } });

    const oldTotal = existing?.total ?? 0;
    const oldIsExpense = existing?.is_expense ?? false;
    const oldAccountId = existing?.account_id ?? (existing?.account as { id: string } | undefined)?.id;
    const oldCategoryId = existing?.category_id;

    const newTotal = total ?? oldTotal;
    const newDate = dateInput ? new Date(dateInput) : existing?.date_input;

    let finalCategoryId = categoryId;

    // If categoryId is a string but not a valid ObjectId, it's a new category
    if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      const newCategory = await prisma.category.create({
        data: {
          name: categoryId,
          account: { connect: { id: oldAccountId } },
        } as Prisma.CategoryCreateInput,
      });
      finalCategoryId = newCategory.id;
    }

    const updated = await prisma.trx.update({
      where: { id },
      data: {
        total: newTotal,
        date_input: newDate ? new Date(newDate) : undefined,
        account_id: oldAccountId,
        category_id: finalCategoryId || oldCategoryId,
        is_expense: isExpense ?? oldIsExpense,
        note: note ?? undefined,
      },
    });

    // Balance adjustments
    const oldAccountBal = await prisma.account.findUnique({ where: { id: oldAccountId } });

    const oldDelta = oldIsExpense ? -oldTotal : oldTotal;
    const newIsExpense = isExpense;
    const newDeltaValue = newIsExpense ? -newTotal : newTotal;

    const oldBalanceValue = oldAccountBal?.balance ?? 0;

    const diff = newDeltaValue - oldDelta;
    const updatedBalance = oldBalanceValue + diff;
    await prisma.account.update({ where: { id: oldAccountId }, data: { balance: updatedBalance } });

    return NextResponse.json({ message: 'Transaction updated', transaction: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const userId = session?.user?.id;

    if (!clientId || !userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'Missing required field: id' }, { status: 400 });
    }

    const existing = await prisma.trx.findUnique({ where: { id }, include: { account: true } });
    if (!existing) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    const accountId = existing.account_id;
    const isExpense = existing.is_expense;
    const total = existing.total;
    const delta = isExpense ? -total : total;

    const account: unknown = await prisma.account.findUnique({ where: { id: accountId } }) as unknown as { balance?: number } | null;
    const currentBalance = (account as { balance?: number } | null)?.balance ?? 0;
    const newBalance = currentBalance - delta;
    await prisma.account.update({ where: { id: accountId }, data: { balance: newBalance } } as unknown as { where: { id: string }; data: { balance: number } });

    await prisma.trx.delete({ where: { id } });

    return NextResponse.json({ message: 'Transaction deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = req.url ? new URL(req.url) : null;
    const clientId = session?.user?.clientId;
    const accountId = url?.searchParams.get('accountId');
    const pageParam = url?.searchParams.get('page');
    const limitParam = url?.searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    if (!accountId) {
      return NextResponse.json({ transactions: [], total: 0, page, limit }, { status: 200 });
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const transactions = await prisma.trx.findMany({
      where: { account_id: accountId },
      include: { account: true, category: true },
      orderBy: { date_input: 'desc' },
      skip,
      take,
    });

    const total = await prisma.trx.count({ where: { account_id: accountId } });

    return NextResponse.json({ data: transactions, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
