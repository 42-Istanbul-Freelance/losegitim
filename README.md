# 42 İstanbul Freelance Vibe Coding - Boilerplate (Starter Kit)

Bu proje **42 İstanbul Freelance Vibe Coding Hackathon**'unda katılımcılara hızlı bir başlangıç noktası sağlamak amacıyla "Boş sayfa sendromunu (Blank page syndrome)" önlemek için hazırlanmıştır.

## 🤖 AI ile Nasıl Kodlanır? (Agent Plan)
Geleneksel kodlama yapmayın, AI kod asistanlarının potansiyelini "Agent Plan" sistemi ile 10 katına çıkarın:

1. **Bağlamı Devret (Handoff):** Yeni bir chat açtığınızda AI'a klasördeki planları okumasını söyleyin:
   > `docs/agent_plan/HANDOFF_PROMPT.md dosyasını okuyarak projenin neresinde kaldığımızı anla ve sıradaki görevi bularak işleme başla.`

2. **Görev Bazlı İlerleme:** Her yeni özelliği `docs/agent_plan/00X_GOREV_ADI.md` formatında (**000_SABLON_GOREV.md** dosyasına uygun olarak) planlayarak AI'a verin.

3. **Kaldığın Yerden Devam Et (`npm run ai:next`):** Terminalden bu komutu çalıştırarak bir sonraki görev için hazır prompt'u alın ve AI'a yapıştırın. Sohbet geçmişinizi kaybetseniz bile kodlamaya anında devam edebilirsiniz!

## Teknoloji Yığıtı (Tech Stack)
- Next.js (App Router)
- TailwindCSS
- TypeScript
- Docker & Docker Compose

## Kurulum ve Çalıştırma

### Yerel Geliştirme (Local Development)
Projeyi cihazınızda çalıştırmak için:

```bash
npm install
npm run dev
```
Uygulama **http://localhost:3000** üzerinde ulaşılabilir olacaktır.

### Docker ile Çalıştırma
Projeyi hızlıca production-ready bir konteynerda çalıştırmak için:

```bash
docker-compose up --build
```

## Hackathon İpuçları
1. **Intra:** Projeni intra.42freelance.com adresine yüklemeyi unutma.
2. **Yardım İste:** Takıldığın yerde "Needs Help" (Yardım Lazım) butonuyla diğer masalardan yardım talep et.
3. **Sorun Çöz:** Kusursuz kod yazmaya değil, sadece sorunu çözecek MVP (Minimum Viable Product)'yi çıkartmaya odaklan. Sürdürülebilirlik ve DevOps maliyetleri **42 İstanbul Freelance** tarafından üstlenilmiştir.

*Sistem aktif, boot sekansı tamamlandı. Hemen üretmeye başla.* 🚀
