import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Konferanslarda kullanılan tüm benzersiz kategorileri döndürür
export async function GET() {
    try {
        const conferences = await prisma.conference.findMany({
            select: { category: true },
            distinct: ["category"],
            orderBy: { category: "asc" },
        });
        const categories = conferences.map((c) => c.category).filter(Boolean);
        return NextResponse.json(categories, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error?.message }, { status: 500 });
    }
}
