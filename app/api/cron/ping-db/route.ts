import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.DATABASE_URL!);
        }

        if (!mongoose.connection.db) {
            throw new Error("Database connection is not available");
        }

        const res = await mongoose.connection.db.admin().ping();

        return NextResponse.json(res);
    } catch (error) {
        console.error("Ping DB error:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
