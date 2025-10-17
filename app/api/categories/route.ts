import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accountId = session?.user?.defaultAccountId;

    if (!session?.user?.clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    if (!accountId) {
      return NextResponse.json({ categories: [] }, { status: 200 });
    }

    const categories = await prisma.category.findMany({
      where: { account_id: accountId },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}