import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tüm paylaşımları listele
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, surname: true }
                }
            }
        });
        return NextResponse.json(posts);
    } catch (error: any) {
        console.error('Posts getirme hatası:', error?.message);
        return NextResponse.json({ message: 'Sunucu hatası: ' + error?.message }, { status: 500 });
    }
}

// Yeni duyuru oluştur (yalnızca ADMIN)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, content, eventType, imageUrl } = body;

        if (!userId || !content || !eventType) {
            return NextResponse.json({ message: 'Kullanıcı, içerik ve etkinlik türü zorunludur.' }, { status: 400 });
        }

        // Yalnızca ADMIN kullanıcılar duyuru paylaşabilir
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Bu işlem için yetkili (admin) olmanız gerekiyor.' }, { status: 403 });
        }

        const post = await prisma.post.create({
            data: { userId, content, eventType, imageUrl: imageUrl || null },
            include: { user: { select: { id: true, name: true, surname: true } } }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        console.error('Post oluşturma hatası:', error?.message);
        return NextResponse.json({ message: 'Sunucu hatası: ' + error?.message }, { status: 500 });
    }
}
