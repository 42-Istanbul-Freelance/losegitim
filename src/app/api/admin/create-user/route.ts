import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { name, tcNo, password } = await request.json();

        if (!name || !tcNo || !password) {
            return NextResponse.json(
                { message: "Lütfen tüm alanları (İsim, TC No, Şifre) doldurun." },
                { status: 400 }
            );
        }

        if (tcNo.length !== 11) {
            return NextResponse.json(
                { message: "TC Kimlik Numarası 11 haneli olmalıdır." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { tcNo },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Bu TC Kimlik Numarası ile zaten bir eğitmen kayıtlı." },
                { status: 400 }
            );
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                tcNo,
                password,
                role: "INSTRUCTOR", // Sadece normal eğitmenler eklenebilecek şimdilik
            },
        });

        return NextResponse.json(
            { message: "Eğitmen başarıyla sisteme eklendi!", user: { name: newUser.name, tcNo: newUser.tcNo } },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Eğitmen eklenirken bir hata oluştu." },
            { status: 500 }
        );
    }
}
