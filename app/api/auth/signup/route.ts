import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.client.create({
      data: {
        name: username,
      },
    });

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        client_id: client.id,
      },
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
