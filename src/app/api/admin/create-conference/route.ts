import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Yeni konferans oluştur (yalnızca ADMIN)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, category, date, location, userId } = body;

        if (!title || !description || !category || !date || !location || !userId) {
            return NextResponse.json({ message: 'Tüm alanlar zorunludur.' }, { status: 400 });
        }

        // Yalnızca ADMIN kullanıcılar konferans oluşturabilir
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Bu işlem için yetkili (admin) olmanız gerekiyor.' }, { status: 403 });
        }

        const conference = await prisma.conference.create({
            data: {
                title,
                description,
                category,
                date: new Date(date),
                location,
            }
        });

        return NextResponse.json(conference, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Hata: ' + error?.message }, { status: 500 });
    }
}
