import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tcNo, name, surname, birthDate, phone, email, city, district, schoolName, password } = body;

        // Basit validasyonlar
        if (!tcNo || !name || !surname || !birthDate || !phone || !email || !city || !district || !schoolName || !password) {
            return NextResponse.json({ message: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
        }

        if (tcNo.length !== 11) {
            return NextResponse.json({ message: "TC Kimlik No 11 haneli olmalıdır." }, { status: 400 });
        }

        // TC Kimlik ve Email daha önce kayıtlı mı kontrolü
        const existingUserTc = await prisma.user.findUnique({
            where: { tcNo }
        });
        if (existingUserTc) {
            return NextResponse.json({ message: "Bu TC Kimlik No ile zaten kayıt var." }, { status: 409 });
        }

        const existingUserEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUserEmail) {
            return NextResponse.json({ message: "Bu E-posta adresi ile zaten kayıt var." }, { status: 409 });
        }

        // Yeni Eğitmeni (User) sisteme kayıt et
        const newUser = await prisma.user.create({
            data: {
                tcNo,
                name,
                surname,
                birthDate,
                phone,
                email,
                city,
                district,
                schoolName,
                password, // Not: Gerçek projede bcrypt ile şifrelenmeli
                role: "INSTRUCTOR", // Varsayılan rol
            }
        });

        // Prisma bağlantısını serbest bırak
        await prisma.$disconnect();

        // Şifre bilgisini söküp döndür
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ message: "Kayıt işlemi başarıyla tamamlandı!", user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error("Kullanıcı eklenirken hata:", error);
        return NextResponse.json({ message: "Sunucu hatası, lütfen tekrar deneyin." }, { status: 500 });
    }
}
