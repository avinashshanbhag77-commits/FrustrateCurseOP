# Database schema for RationalRage

This document lists the Prisma models and the corresponding database tables/columns created for this project.

Tables and columns

- **User**
  - `id` INT PK AUTOINCREMENT
  - `nickname` TEXT UNIQUE
  - `createdAt` TIMESTAMP
  - `sessions` INT (aggregate)
  - `messages` INT (aggregate)
  - `totalTime` INT (seconds)

- **Room**
  - `id` INT PK AUTOINCREMENT
  - `code` TEXT UNIQUE
  - `isPrivate` BOOLEAN
  - `createdAt` TIMESTAMP
  - `expiresAt` TIMESTAMP NULLABLE

- **Session**
  - `id` INT PK AUTOINCREMENT
  - `roomId` INT FK -> Room(id)
  - `nickname` TEXT (anonymous alias used during the session)
  - `startedAt` TIMESTAMP
  - `endedAt` TIMESTAMP NULLABLE
  - `duration` INT NULLABLE (seconds)
  - `messages` INT (count in session)

- **Message**
  - `id` INT PK AUTOINCREMENT
  - `roomId` INT FK -> Room(id)
  - `sender` TEXT (nickname)
  - `text` TEXT
  - `createdAt` TIMESTAMP

- **Leaderboard**
  - `id` INT PK AUTOINCREMENT
  - `nickname` TEXT UNIQUE
  - `rankScore` INT
  - `votes` INT

Notes
- The app is designed to be anonymous. Do not store PII (email, real names, etc.).
- Use `prisma migrate deploy` in CI for production to apply migrations.

Applying migrations locally
1. Ensure `DATABASE_URL` is set in `backend/.env` (do NOT commit real secrets).
2. Run:
```bash
cd backend
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

Applying migrations in production (CI / deploy):
```bash
cd backend
npx prisma migrate deploy
```
