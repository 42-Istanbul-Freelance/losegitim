const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.upsert({
        where: { tcNo: '12345678912' },
        update: {},
        create: {
            tcNo: '12345678912',
            name: 'Örnek Eğitmen',
            surname: 'Testoğlu',
            birthDate: '1990 01 01',
            phone: '05554443322',
            email: 'admin@losev.org.tr',
            city: 'Ankara',
            district: 'Çankaya',
            schoolName: 'Gazi Üniversitesi',
            password: 'admin',
            role: 'ADMIN',
        },
    })

    console.log({ user })

    const conferences = [
        { title: 'Pediatrik Onkolojide Yeni Yaklaşımlar', description: 'Çocukluk çağı kanserlerinde güncel tedavi yöntemleri...', category: 'Sağlık', date: new Date('2026-05-15T09:00:00Z'), location: 'Ankara LÖSANTE Hastanesi' },
        { title: 'Gönüllü İletişimi ve Motivasyon', description: 'Sahada çalışan gönüllülerle etkili iletişim...', category: 'İletişim', date: new Date('2026-06-02T14:00:00Z'), location: 'İstanbul LÖSEV İrtibat Ofisi' },
        { title: 'Çocuk Psikolojisine Giriş', description: 'Lösemi tedavisi gören çocukların psikolojilerini anlama...', category: 'Psikoloji', date: new Date('2026-06-20T10:30:00Z'), location: 'Online (Zoom)' },
        { title: 'Eğiticinin Eğitimi Sertifika Programı', description: 'Eğitmenlerin pedagojik formasyonlarını güçlendirmelerini hedefleyen temel program.', category: 'Eğitim', date: new Date('2026-07-10T09:00:00Z'), location: 'İzmir Şubesi' },
        { title: 'Lösemili Çocuklarda Beslenme', description: 'Tedavi sürecinde beslenme düzeninin önemi ve uygulanacak sağlıklı diyetler.', category: 'Sağlık', date: new Date('2026-08-05T10:00:00Z'), location: 'Ankara LÖSANTE' },
        { title: 'Beden Dili ve Etkili Sunum Teknikleri', description: 'Eğitim verirken dikkat edilecek hususlar ve beden dilini doğru kullanma.', category: 'İletişim', date: new Date('2026-08-15T13:00:00Z'), location: 'Online (Teams)' },
        { title: 'Ailelere Psikolojik Destek Süreçleri', description: 'Hasta yakınlarının yaşadığı zorluklar ve onlara destek olma yolları.', category: 'Psikoloji', date: new Date('2026-09-01T15:00:00Z'), location: 'Bursa İrtibat Ofisi' },
        { title: 'Eğitim Materyali Geliştirme Atölyesi', description: 'Çocuklara eğitim verirken kullanılacak materyallerin tasarlanması.', category: 'Eğitim', date: new Date('2026-09-15T09:30:00Z'), location: 'İstanbul Avrupa Yakası Ofisi' },
        { title: 'İlk Yardım Temel Eğitimi', description: 'Acil durumlarda yapılması gereken temel müdahaleler.', category: 'Sağlık', date: new Date('2026-10-05T10:00:00Z'), location: 'Ankara Merkez Ofis' },
        { title: 'Sosyal Medya ve Kampanya Yönetimi', description: 'LÖSEV gönüllülerinin dijital platformlarda nasıl etkili olabileceği.', category: 'İletişim', date: new Date('2026-10-20T14:00:00Z'), location: 'Online (Zoom)' },
        { title: 'Oyun Terapisi Teknikleri', description: 'Çocuklarla oyun üzerinden iletişim kurma ve travma etkilerini azaltma.', category: 'Psikoloji', date: new Date('2026-11-10T11:00:00Z'), location: 'İzmir Şubesi' },
        { title: 'Sınıf Yönetimi ve Eğitmen Becerileri', description: 'Eğitim sırasında sınıf ortamını düzenleme ve dikkat çekme yolları.', category: 'Eğitim', date: new Date('2026-11-25T13:30:00Z'), location: 'Online (Teams)' },
        { title: 'Kan ve Kök Hücre Bağışı Farkındalığı', description: 'Bağışın önemi ve toplumda doğru bilincin nasıl oluşturulacağı.', category: 'Sağlık', date: new Date('2026-12-05T09:00:00Z'), location: 'Ankara LÖSANTE' },
        { title: 'Kriz İletişimi', description: 'Zorlu haberleri verme ve beklenmedik durumlarda iletişim kurma.', category: 'İletişim', date: new Date('2026-12-20T15:00:00Z'), location: 'Ankara Merkez' },
        { title: 'Ergenlik Dönemindeki Lösemi Hastalarına Yaklaşım', description: 'Ergen psikolojisini anlama ve bu yaş grubuna özel destek süreçleri.', category: 'Psikoloji', date: new Date('2027-01-15T10:00:00Z'), location: 'İstanbul Temsilciliği' },
        { title: 'Uzaktan Eğitim Modelleri (E-Learning)', description: 'Çocuklara yönelik dijital eğitimlerin daha verimli nasıl yapılabileceği.', category: 'Eğitim', date: new Date('2027-01-30T14:00:00Z'), location: 'Online (Zoom)' },
        { title: 'LÖSANTE Hijyen ve Korunma Standartları', description: 'Hastane ortamında hijyen kuralları ve enfeksiyondan korunma.', category: 'Sağlık', date: new Date('2027-02-10T09:00:00Z'), location: 'Ankara LÖSANTE' },
        { title: 'Gönüllüler Arası Takım Çalışması', description: 'Farklı ekiplerin sahada uyum içinde çalışmasının püf noktaları.', category: 'İletişim', date: new Date('2027-02-25T13:00:00Z'), location: 'İzmir Ofisi' },
        { title: 'Sanatla Terapi Atölyesi', description: 'Resim, müzik ve kil üzerinden çocuklarla sanatsal çalışmalar.', category: 'Psikoloji', date: new Date('2027-03-10T10:00:00Z'), location: 'Bursa Temsilciliği' },
        { title: 'Eğitimde Dikkat Eksikliği ve Odaklanma', description: 'Tedavi sonrası odaklanma sorunu yaşayan çocuklara yönelik eğitim yaklaşımları.', category: 'Eğitim', date: new Date('2027-03-20T14:30:00Z'), location: 'Online (Zoom)' },
        { title: 'Çocuk Sağlığı ve Ağız Diş Bakımı', description: 'Kemoterapi sürecinde ağız ve diş sağlığının korunması.', category: 'Sağlık', date: new Date('2027-04-05T11:00:00Z'), location: 'Ankara LÖSANTE' },
        { title: 'Topluluk Önünde Konuşma Pratikleri', description: 'Farkındalık seminerlerinde heyecanı yenme ve kitle ile bağ kurma.', category: 'İletişim', date: new Date('2027-04-18T10:00:00Z'), location: 'Antalya İrtibat Bürosu' },
        { title: 'Masal Terapisi', description: 'Masalların iyileştirici gücü ve hikaye anlatıcılığı.', category: 'Psikoloji', date: new Date('2027-05-10T14:00:00Z'), location: 'İstanbul Ofisi' },
        { title: 'Z Kuşağı ile Eğitim Yöntemleri', description: 'Yeni nesil eğitim modelleri ve çocukların derse aktif katılımı.', category: 'Eğitim', date: new Date('2027-05-25T09:30:00Z'), location: 'Online (Teams)' },
        { title: 'Doğa Etkinlikleri ve Bağışıklık', description: 'LÖSEV Doğa kampı etkinliklerinin iyileşme sürecindeki yeri.', category: 'Sağlık', date: new Date('2027-06-05T10:00:00Z'), location: 'LÖSEV Seferihisar Doğa Çiftliği' },
        { title: 'Empati Kurarak Dinleme Eğitimi', description: 'Aktif dinleme ne demektir ve ailelerle ilişkilerde nasıl kullanılır?', category: 'İletişim', date: new Date('2027-06-20T14:30:00Z'), location: 'Online (Zoom)' }
    ];

    for (const conf of conferences) {
        const existing = await prisma.conference.findFirst({
            where: { title: conf.title }
        })

        if (!existing) {
            const created = await prisma.conference.create({
                data: conf
            })
            console.log(`Eklendi: ${created.title}`)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
