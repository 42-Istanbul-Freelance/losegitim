# LÖSEV Eğitim Platformu / LÖSEV Education Platform

> **v3.1.0** — Gelişmiş Yönetim Paneli / Advanced Admin Dashboard

---

## 🇹🇷 Türkçe

### 📌 Proje Hakkında

Projenin amacı çok basit ve sade bir arayüzü olması ve  siteye giren küçük yaşlı bireylerin olabildiğince aklını karıştırmadan içeriği sunmaktır.
LÖSEV (Lösemili Çocuklar Vakfı) bünyesindeki eğitmenler ve gönüllüler için geliştirilmiş bir **konferans ve eğitim yönetim platformu**dur. Kullanıcılar sisteme kayıt olup konferanslara abone olabilir, duyuruları takip edebilir. Yöneticiler ise tüm içerikleri ve kullanıcıları tek bir panelden yönetebilir.

---

### 🔧 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript |
| Veritabanı | SQLite (Prisma ORM) |
| Stil | CSS Variables + Inline Styles |
| Deployment | Docker / Docker Compose |

---

### 🚀 Kurulum ve Çalıştırma

#### Gereksinimler
- Node.js 20+
- npm

#### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını oluştur ve şemayı uygula
npx prisma db push

# Örnek verileri yükle (admin + 26 konferans)
node prisma/seed.js

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

#### Docker ile Çalıştırma

```bash
# Tüm servisleri başlat (veritabanı kalıcı olarak mount edilir)
docker-compose up --build
```

Veya manuel:

```bash
docker build -t losev .
docker run -v $(pwd)/prisma/dev.db:/app/prisma/dev.db -p 3000:3000 losev
```

---

### 🔑 Admin Hesabı

Seed scripti çalıştırıldığında aşağıdaki admin hesabı otomatik oluşturulur:

| Alan | Değer |
|---|---|
| TC Kimlik No | `12345678912` |
| Şifre | `admin` |
| E-posta | `admin@losev.org.tr` |
| Rol | YETKİLİ (ADMIN) |

> ⚠️ Production ortamında şifreyi mutlaka değiştirin.

---

### 📁 Proje Yapısı

```
src/
├── app/
│   ├── page.tsx              # Ana sayfa (Eğitimler + Duyurular)
│   ├── admin/page.tsx        # Yönetim paneli
│   ├── login/page.tsx        # Giriş sayfası
│   ├── register/page.tsx     # Kayıt sayfası
│   └── api/
│       ├── conferences/      # Konferans listeleme
│       ├── posts/            # Duyuru listeleme & oluşturma
│       ├── register/         # Kullanıcı kaydı
│       ├── login/            # Giriş
│       ├── register-conf/    # Konferansa kayıt
│       ├── unregister-conf/  # Konferans kaydı iptali
│       └── admin/
│           ├── conferences/  # Admin: konferans listele / sil
│           ├── users/        # Admin: kullanıcı listele / sil / rol değiştir
│           └── create-conference/ # Admin: konferans oluştur
prisma/
├── schema.prisma             # Veri modelleri
└── seed.js                   # Örnek veri
```

---

### 🖥️ Özellikler

#### Kullanıcı Arayüzü
- ✅ Kayıt / Giriş sistemi (TC Kimlik + şifre)
- ✅ Konferansları kategoriye göre filtreleme
- ✅ Konferansa kayıt olma / kaydı iptal etme
- ✅ Duyurular sekmesi (resimli paylaşım desteği)

#### Yönetim Paneli (`/admin`)
- ✅ **Konferanslar** — kategoriye göre gruplu listeleme, katılımcı tablosu
- ✅ **Kullanıcı Yönetimi** — arama, sıralama, detay görüntüleme, rol değiştirme, silme
- ✅ **Konferans Yönetimi** — yeni konferans oluşturma, kategori ekleme/silme, konferans silme
- ✅ **İstatistikler** — özet kartlar, kategori dağılımı, popüler konferanslar, şehir analizi, son kayıtlar

---

### 🗃️ Veritabanı Modelleri

- **User** — kullanıcı bilgileri, rol (STUDENT / ADMIN)
- **Conference** — konferans başlığı, kategori, tarih, konum
- **Registration** — kullanıcı ↔ konferans ilişkisi
- **Post** — duyurular, etkinlik tipi, görsel

---

## 🇬🇧 English

### 📌 About

A **conference and education management platform** built for trainers and volunteers of LÖSEV (Foundation for Children with Leukemia). Users can register, subscribe to conferences, and follow announcements. Administrators can manage all content and users from a single dashboard.

---

### 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (Prisma ORM) |
| Styling | CSS Variables + Inline Styles |
| Deployment | Docker / Docker Compose |

---

### 🚀 Getting Started

#### Requirements
- Node.js 20+
- npm

#### Local Development

```bash
# Install dependencies
npm install

# Create database and apply schema
npx prisma db push

# Seed sample data (admin + 26 conferences)
node prisma/seed.js

# Start development server
npm run dev
```

App runs at `http://localhost:3000`.

#### Docker

```bash
# Start all services (database is persistently mounted)
docker-compose up --build
```

Or manually:

```bash
docker build -t losev .
docker run -v $(pwd)/prisma/dev.db:/app/prisma/dev.db -p 3000:3000 losev
```

---

### 🔑 Admin Account

After running the seed script, the following admin account is created automatically:

| Field | Value |
|---|---|
| TC ID Number | `12345678912` |
| Password | `admin` |
| Email | `admin@losev.org.tr` |
| Role | ADMIN |

> ⚠️ Change the password before deploying to production.

---

### 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (Conferences + Announcements)
│   ├── admin/page.tsx        # Admin dashboard
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   └── api/
│       ├── conferences/      # List conferences
│       ├── posts/            # List & create announcements
│       ├── register/         # User registration
│       ├── login/            # Authentication
│       ├── register-conf/    # Subscribe to conference
│       ├── unregister-conf/  # Unsubscribe from conference
│       └── admin/
│           ├── conferences/  # Admin: list / delete conferences
│           ├── users/        # Admin: list / delete / change role
│           └── create-conference/ # Admin: create conference
prisma/
├── schema.prisma             # Data models
└── seed.js                   # Sample data
```

---

### 🖥️ Features

#### User Interface
- ✅ Register / Login (TC ID + password)
- ✅ Filter conferences by category
- ✅ Subscribe / unsubscribe from conferences
- ✅ Announcements tab with image upload support

#### Admin Dashboard (`/admin`)
- ✅ **Conferences** — grouped by category, participant tables
- ✅ **User Management** — search, sort, expand details, change role, delete
- ✅ **Conference Management** — create conferences, add/remove categories, delete conferences
- ✅ **Statistics** — summary cards, category distribution, top conferences, city analysis, recent registrations

---

### 🗃️ Database Models

- **User** — user info, role (STUDENT / ADMIN)
- **Conference** — title, category, date, location
- **Registration** — user ↔ conference relation
- **Post** — announcements, event type, image

---

### 📄 License

Bu proje LÖSEV bünyesinde iç kullanım amaçlı geliştirilmiştir.  
This project was developed for internal use within LÖSEV.

