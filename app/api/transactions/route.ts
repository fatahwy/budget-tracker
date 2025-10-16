import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
          client: { connect: { id: clientId } },
        } as any,
      });
      finalCategoryId = newCategory.id;
    }

    const trxData: any = {
      total,
      is_expense: isExpense,
      date_input: new Date(dateInput),
      account_id: accountId,
      category_id: finalCategoryId,
      user_input_id: userId,
    };
    if (note !== undefined && note !== null) {
      trxData.note = note;
    }
    const transaction = await prisma.trx.create({
      data: trxData,
    });

    // Update account balance based on the new transaction
    const accountForUpdate = await prisma.account.findUnique({ where: { id: accountId } }) as any;
    if (accountForUpdate) {
      const currentBalance = (accountForUpdate as any).balance ?? 0;
      const newBalance = currentBalance + (isExpense ? -total : total);
      await prisma.account.update({ where: { id: accountId }, data: { balance: newBalance } } as any);
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

    const { id, total, dateInput, accountId } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Missing required field: id' }, { status: 400 });
    }

    const existing = await prisma.trx.findUnique({ where: { id }, include: { account: true } });

    const oldTotal = existing?.total ?? 0;
    const oldIsExpense = existing?.is_expense ?? false;
    const oldAccountId = existing?.account_id ?? (existing?.account as any)?.id;

    const newTotal = total ?? oldTotal;
    const newDate = dateInput ? new Date(dateInput) : existing?.date_input;
    const newAccountId = accountId ?? oldAccountId;

    const updated = await prisma.trx.update({
      where: { id },
      data: {
        total: newTotal,
        date_input: newDate ? new Date(newDate) : undefined,
        account_id: newAccountId,
      },
    });

    // Balance adjustments
    const oldAccountBal: any = await prisma.account.findUnique({ where: { id: oldAccountId } });
    const newAccountBal: any = await prisma.account.findUnique({ where: { id: newAccountId } });

    const oldDelta = oldIsExpense ? -oldTotal : oldTotal;
    const newIsExpense = existing?.is_expense ?? false;
    const newDeltaValue = newIsExpense ? -newTotal : newTotal;

    const oldBalanceValue = (oldAccountBal as any)?.balance ?? 0;
    const newBalanceValue = (newAccountBal as any)?.balance ?? 0;

    if (oldAccountId === newAccountId) {
      const diff = newDeltaValue - oldDelta;
      const updatedBalance = oldBalanceValue + diff;
      await prisma.account.update({ where: { id: oldAccountId }, data: { balance: updatedBalance } } as any);
    } else {
      const updatedOldBalance = oldBalanceValue - oldDelta;
      const updatedNewBalance = newBalanceValue + newDeltaValue;
      await prisma.account.update({ where: { id: oldAccountId }, data: { balance: updatedOldBalance } } as any);
      await prisma.account.update({ where: { id: newAccountId }, data: { balance: updatedNewBalance } } as any);
    }

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

    const account: any = await prisma.account.findUnique({ where: { id: accountId } });
    const newBalance = ((account as any).balance ?? 0) - delta;
    await prisma.account.update({ where: { id: accountId }, data: { balance: newBalance } } as any);

    await prisma.trx.delete({ where: { id } });

    return NextResponse.json({ message: 'Transaction deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
