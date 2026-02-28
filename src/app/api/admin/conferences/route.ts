import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Admin yetkisi kontrolü eklenebilir (şu an her kullanıcı eğitmen olarak kilitlenmedi, ama prod'da JWT vs kullanılır)

        const conferences = await prisma.conference.findMany({
            orderBy: { date: "asc" },
            include: {
                registrations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                tcNo: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(conferences, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Admin konferans verileri alınırken hata oluştu." },
            { status: 500 }
        );
    }
}
