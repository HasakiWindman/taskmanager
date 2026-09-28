# Task Manager

A full-stack task management application built with Next.js, React, Spring Boot, and MySQL.

## Features

- View all tasks
- Add new tasks
- Mark tasks as completed
- Undo completed tasks
- Delete tasks
- Store task data in MySQL

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA

### Database
- MySQL

## How It Works

The frontend sends HTTP requests to the Spring Boot backend.

The backend handles the requests, uses Spring Data JPA to communicate with MySQL, and returns JSON data back to the frontend.

```text
Next.js / React
      ↓
HTTP Requests
      ↓
Spring Boot
      ↓
Spring Data JPA
      ↓
MySQL


Running the Project:
Backend

Set your MySQL password as an environment variable:

export DB_PASSWORD='your_mysql_password'

Start the Spring Boot backend:

./mvnw spring-boot:run

The backend runs on:

http://localhost:8080
Frontend

Go into the frontend folder:

cd taskmanager-frontend

Install dependencies:

npm install

Start the frontend:

npm run dev

The frontend runs on:

http://localhost:3000