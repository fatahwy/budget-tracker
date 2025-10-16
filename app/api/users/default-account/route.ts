import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const userId = session?.user?.id;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json({ message: 'Account ID is required' }, { status: 400 });
    }

    // Validate account belongs to client
    const account = await prisma.account.findUnique({ where: { id: accountId, client_id: clientId} });
    if (!account) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { default_account_id: accountId },
    });

    return NextResponse.json({ message: 'Default account updated', defaultAccountId: accountId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}