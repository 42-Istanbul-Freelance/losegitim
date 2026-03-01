import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const conference = await prisma.conference.findUnique({
            where: { id },
            include: {
                registrations: {
                    include: {
                        user: { select: { id: true, name: true, surname: true, city: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!conference) {
            return NextResponse.json({ message: "Konferans bulunamadı." }, { status: 404 });
        }

        return NextResponse.json(conference, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Hata: " + error?.message }, { status: 500 });
    }
}
