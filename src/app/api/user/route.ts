import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
    try {
        const data = await request.json();
        const { id, ...rest } = data;
        const updated = await prisma.user.update({ where: { id }, data: rest });
        // exclude password before sending back
        const { password, ...safeUpdated } = updated as any;
        return NextResponse.json(safeUpdated, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ message: "id gerekli" }, { status: 400 });
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return NextResponse.json(null, { status: 200 });
        const { password, ...safeUser } = user as any;
        return NextResponse.json(safeUser, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
