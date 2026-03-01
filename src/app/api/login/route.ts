import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { tcNo, password } = await request.json();

    if (!tcNo || !password) {
      return NextResponse.json(
        { message: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { tcNo },
    });

    // Basit bir güvenlik, hashleme şimdilik atlanıyor
    if (user && user.password === password) {
      return NextResponse.json(
        { message: "Giriş başarılı!", user: { id: user.id, name: user.name, tcNo: user.tcNo, role: user.role } },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Geçersiz TC Kimlik No veya şifre." },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: "Bir hata oluştu.", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
