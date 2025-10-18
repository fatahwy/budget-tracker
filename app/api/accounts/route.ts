import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Account name is required' }, { status: 400 });
    }

    // Determine if this client has any accounts yet (before creating a new one)
    const priorCount = await prisma.account.count({ where: { client_id: clientId } });

    const account = await prisma.account.create({
      data: {
        name,
        client_id: clientId,
      },
    });

    // If this is the first account for the client, set it as default for all users of this client
    if (priorCount === 0) {
      await prisma.user.updateMany({
        where: { client_id: clientId },
        data: { default_account_id: account.id },
      });
    }

    return NextResponse.json({ message: 'Account created successfully', account }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const accountsRaw = await prisma.account.findMany({
      where: { client_id: clientId },
      include: { trx: true },
    });

    type TrxInfo = { is_expense: boolean; total: number; };
    type AccountRaw = { id: string; name: string; created_at?: Date; trx?: TrxInfo[] };

    const accounts = accountsRaw.map((a: AccountRaw) => ({
      id: a.id,
      name: a.name,
      created_at: a.created_at,
      balance: (a.trx ?? []).reduce((sum: number, t: TrxInfo) => sum + (t.is_expense ? -t.total : t.total), 0)
    }));

    return NextResponse.json(accounts, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { id, name } = await req.json();

    const account = await prisma.account.findUnique({ where: { id } });
    if (!account || account.client_id !== clientId) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }

    const data: { name?: string } = {};
    if (name !== undefined) data.name = name;

    const updated = await prisma.account.update({ where: { id }, data });

    return NextResponse.json({ message: 'Account updated', account: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await req.json();
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account || account.client_id !== clientId) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }

    // Cascade delete: delete related transactions
    await prisma.trx.deleteMany({ where: { account_id: id } });

    // Clear default_account references from users
    await prisma.user.updateMany({ where: { default_account_id: id }, data: { default_account_id: null } });

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ message: 'Account and related transactions deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
