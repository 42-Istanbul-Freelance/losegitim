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

        const registration = await prisma.registration.create({
            data: {
                userId,
                conferenceId,
            },
        });

        return NextResponse.json(
            { message: "Başarıyla kayıt olundu!", registration },
            { status: 201 }
        );
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { message: "Bu konferansa zaten kayıtlısınız." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Kayıt işlemi sırasında bir hata oluştu." },
            { status: 500 }
        );
    }
}
