import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search')?.trim() || '';

        const users = await prisma.user.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { surname: { contains: search } },
                    { tcNo: { contains: search } },
                    { email: { contains: search } },
                    { schoolName: { contains: search } },
                    { city: { contains: search } },
                ],
            } : undefined,
            select: {
                id: true,
                name: true,
                surname: true,
                tcNo: true,
                email: true,
                phone: true,
                city: true,
                district: true,
                schoolName: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Hata: ' + error?.message }, { status: 500 });
    }
}
