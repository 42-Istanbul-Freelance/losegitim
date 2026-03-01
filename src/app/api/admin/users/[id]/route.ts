import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Kullanıcı rol değiştir
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { role } = await request.json();
        if (!["STUDENT", "ADMIN"].includes(role)) {
            return NextResponse.json({ message: "Geçersiz rol." }, { status: 400 });
        }
        const updated = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, role: true },
        });
        return NextResponse.json(updated, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Rol güncellenemedi." }, { status: 500 });
    }
}

// Kullanıcı sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Önce kayıtları sil
        await prisma.registration.deleteMany({ where: { userId: id } });
        // Sonra kullanıcıyı sil
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ message: "Kullanıcı silindi." }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Kullanıcı silinemedi." }, { status: 500 });
    }
}
