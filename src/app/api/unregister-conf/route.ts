import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { userId, conferenceId } = await request.json();

        if (!userId || !conferenceId) {
            return NextResponse.json(
                { message: "Gerekli bilgiler eksik." },
                { status: 400 }
            );
        }

        // Kaydı bul ve sil
        const registration = await prisma.registration.findUnique({
            where: {
                userId_conferenceId: {
                    userId,
                    conferenceId,
                },
            },
        });

        if (!registration) {
            return NextResponse.json(
                { message: "Bu konferansa zaten kayıtlı değilsiniz." },
                { status: 404 }
            );
        }

        await prisma.registration.delete({
            where: {
                id: registration.id
            }
        });

        return NextResponse.json(
            { message: "Kaydınız başarıyla silindi." },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "İptal işlemi sırasında bir hata oluştu." },
            { status: 500 }
        );
    }
}
