# SAKTI AI — Backend

> Platform *job matching end-to-end* berbasis AI untuk mengatasi *mismatch* tenaga kerja digital Indonesia.

## 🚀 Progress

- [x] Inisialisasi proyek NestJS berbasis 
- [x] Konfigurasi arsitektur DDD + VSA (*Domain-Driven Design* + *Vertical Slice Architecture*)
- [x] Setup TypeORM beserta sistem migrasi database
- [x] Konfigurasi Logger (Pino) — log ke konsol & file dengan rotasi harian
- [x] Setup ExceptionFilter untuk penanganan error dan HTTPException
- [x] Setup Interceptor untuk standarisasi *response* sukses
- [x] Centralized *response* menggunakan `HTTPResponse` class
- [x] Konfigurasi *environment* per tahap (`.env.development`, `.env.production`, `.env.test`)
- [ ] Implementasi domain & *use case* utama (Jobseeker, Recruiter, Job)
- [ ] Implementasi autentikasi JWT (HS512) + bcrypt
- [ ] Konfigurasi RBAC (*Role-Based Access Control*)
- [ ] Integrasi Qdrant *vector database*
- [ ] Integrasi Neo4J *graph database*
- [ ] Integrasi FastAPI AI Engine (LMProfiler, Matchmaker, TalentForger)

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | NestJS (TypeScript) |
| Arsitektur | DDD + VSA |
| ORM | TypeORM (dengan migrasi) |
| Database | MySQL |
| Logger | Pino (konsol + file, rotasi harian) |
| Response | HTTPResponse class (terpusat) |
| Error Handling | ExceptionFilter global |
| Containerisasi | Docker |
| AI Service | FastAPI (servis terpisah) |
| Vector DB | Qdrant |
| Graph DB | Neo4J / AuraDB |
| Caching | Redis |

## 📁 Struktur Folder

```
src/
├── domain/           # Domain models + domain services
├── features/         # Controllers + UseCases + DTOs + validators
├── infrastructure/   # TypeORM + NestJS + Pino + ExceptionFilter + Interceptor
├── libs/             # Reusable utilities (pure, no framework dependencies)
├── migrations/       # File migrasi database
└── types/            # Shared types (extend Express.Request / Response)
```

## ⚙️ Instalasi

```bash
# Clone repo
git clone https://github.com/BI-OJK-HACKATHON/main-backend
cd main-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
mkdir logs

# Jalankan migrasi
npm run migration:run

# Jalankan development server
npm run start:dev
```

## 🗄️ Migrasi Database

```bash
# Terapkan semua migrasi
npm run migration:run

# Generate migrasi baru dari entity (Linux/macOS)
npm run migration:generate --name=NamaMigrasi

# Generate migrasi baru dari entity (Windows)
npm run migration:generate:win --name=NamaMigrasi

# Batalkan migrasi terakhir
npm run migration:revert
```

> Jangan edit migrasi yang sudah ada — buat file migrasi baru.

## 🐳 Menjalankan dengan Docker

```bash
# Production
cp .env.example .env
docker build --build-arg NODE_ENV=production -t sakti-backend .
docker run -d -p 3000:3000 --env-file .env --name sakti-backend sakti-backend

# Staging
cp .env.example .env.staging
docker build --build-arg NODE_ENV=staging -t sakti-backend:staging .
docker run -d -p 3000:3000 --env-file .env.staging --name sakti-backend-staging sakti-backend:staging
```

## 🧪 Testing

```bash
# Unit test
npm run test

# Unit test (verbose)
npm run test:verbose

# E2E test
npm run test:e2e

# Coverage
npm run test:cov
```

## 📄 Dokumentasi Terkait

Lihat documentation https://github.com/BI-OJK-HACKATHON/sakti-product-docs untuk PRD, market research, dan CJM lengkap.
