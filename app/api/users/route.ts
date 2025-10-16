import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;

    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { client_id: clientId }
    });
    const sanitized = (users || []).map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json(sanitized, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientId = session?.user?.clientId;
    if (!clientId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: username as any,
        email: email as any,
        password: hashedPassword as any,
        client_id: clientId as any
      } as any
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    const err = error as any;
    if (err?.code === 'P2002') {
      return NextResponse.json({ message: 'Username or email already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}