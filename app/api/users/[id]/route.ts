import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const { id } = await context.params;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({ where: { id, client_id: clientId } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const { id } = await context.params;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const existing = await prisma.user.findFirst({ where: { id, client_id: clientId } });
    if (!existing) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { username, email, password } = await request.json();

    if (!username && !email && !password) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const data: any = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const updated = await prisma.user.update({ where: { id }, data });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    const { id } = await context.params;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const existing = await prisma.user.findFirst({ where: { id, client_id: clientId } });
    if (!existing) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const hasTransactions = await prisma.trx.findFirst({ where: { user_input_id: id } as any });
    if (hasTransactions) {
      return NextResponse.json({ message: 'User has associated transactions' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}