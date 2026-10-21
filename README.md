# Focusboard — Full-Stack Task Manager

A deployed productivity dashboard built with **Java 17, Spring Boot, Next.js, TypeScript, MySQL, JWT, and Docker**.

**Live application:** https://taskmanager-puce-pi.vercel.app  
**Backend API:** https://taskmanager-i2lt.onrender.com

> Free hosting can cause the first request to take longer while the backend wakes up. The Aiven database service must be running.

## Features

- Register and log in with BCrypt password hashing and signed JWT authentication
- User-specific task ownership (a user cannot modify another user's tasks)
- Create, update, complete, and delete tasks
- Task priorities (**High / Medium / Low**), categories, and due dates
- Dashboard with total, active, completed, and overdue counters
- Search, status filters, and sorting by priority, title, or deadline
- Responsive web UI with persistent browser login and logout
- Hosted Next.js frontend (Vercel), Dockerized Spring Boot API (Render), and MySQL (Aiven)

## Architecture

```text
Browser → Next.js (Vercel)
               │ HTTPS + Bearer JWT
               ▼
          TaskController / AuthController (Spring Boot on Render)
               │
          TaskService → Spring Data JPA
               │
               ▼
           MySQL (Aiven)
```

**Security model:** Registration hashes passwords with BCrypt. Login returns a signed, expiring JWT. Task endpoints validate the token and resolve the user ID from its claims. TaskService checks ownership on updates/deletes and filters reads by user. API responses use task DTOs and do not return user or password fields. Environment variables store database credentials and the JWT signing secret. Current session persistence uses localStorage for demo convenience; for higher-security production usage, migrate to HttpOnly session cookies, CSRF protections, and a fuller Spring Security filter chain.

## Run locally

Requires Java 17, MySQL, and Node.js.

1. Create a MySQL database named `taskmanager`.
2. Set environment variables in the terminal that starts Spring Boot:

```bash
export DB_PASSWORD='your-local-mysql-password'
export JWT_SECRET="$(openssl rand -base64 48)"
# Optional: DB_URL and DB_USER; defaults are localhost:3306/taskmanager and root
./mvnw spring-boot:run
```

3. Start the frontend from a second terminal:

```bash
cd taskmanager-frontend
npm ci
npm run dev
```

Open http://localhost:3000.

For production, set `DB_URL` to a TLS-enabled JDBC MySQL connection string, `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` in Render. Set `NEXT_PUBLIC_API_URL` in Vercel to the Render backend URL. Never commit credentials. Update backend CORS origins when deploying on a new domain.

## REST API

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Return JWT |
| GET | `/tasks` | List current user's tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/{id}` | Update owned task |
| DELETE | `/tasks/{id}` | Delete owned task |

Authenticated routes use `Authorization: Bearer <token>`.

Request example:

```json
{
  "title": "Practice DSA",
  "completed": false,
  "priority": "HIGH",
  "category": "Interview prep",
  "dueDate": "2026-11-05"
}
```

Task responses contain only `id`, `title`, `completed`, `priority`, `category`, and `dueDate`.

## Automated checks

```bash
./mvnw test
cd taskmanager-frontend && npm run lint && npm run build
```

Backend tests exercise task DTOs, ownership validation, and service behavior without requiring a live database. Deployment uses a multi-stage Docker build. 

## Engineering tradeoffs

- **JPA repository** keeps relational queries concise and type-safe.
- **Service layer** owns validation, authorization, and mutation logic, leaving HTTP concerns in controllers.
- **DTOs** prevent exposing user entity internals over task APIs.
- **JWT** is easy to use with stateless APIs; expiry requires reauthentication in this demo.
- **Free hosting** prioritizes cost over cold-start latency.

## Future improvements

Add CI, password-reset flows, stronger auth/session management, pagination, database migrations (Flyway), and deeper integration/load testing before serving production-scale traffic.
