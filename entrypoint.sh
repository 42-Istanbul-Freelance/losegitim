#!/bin/sh
set -e

DB_PATH="/app/prisma/dev.db"

if [ ! -f "$DB_PATH" ] || [ ! -s "$DB_PATH" ]; then
  echo ">>> Veritabanı bulunamadı, başlatılıyor..."
  npx prisma db push
  node prisma/seed.js
  echo ">>> Veritabanı hazır."
else
  echo ">>> Mevcut veritabanı kullanılıyor: $DB_PATH"
fi

exec node server.js
