import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // URL'den olası category filtresini al
        const url = new URL(request.url);
        const category = url.searchParams.get("category");

        const whereClause = category && category !== "Tümü" ? { category } : {};

        const conferences = await prisma.conference.findMany({
            where: whereClause,
            orderBy: { date: "asc" }, // En yakın tarihli olan önde çıksın
            include: {
                registrations: true, // Kayıt sayısını göstermek için
            }
        });

        return NextResponse.json(conferences, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Konferanslar alınırken hata oluştu." },
            { status: 500 }
        );
    }
}
