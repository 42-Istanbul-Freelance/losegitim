import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Önce ilgili kayıtları sil
        await prisma.registration.deleteMany({ where: { conferenceId: id } });
        // Sonra konferansı sil
        await prisma.conference.delete({ where: { id } });
        return NextResponse.json({ message: "Konferans silindi." }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Konferans silinirken hata oluştu." },
            { status: 500 }
        );
    }
}
