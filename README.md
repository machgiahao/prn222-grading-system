# PRN222 Grading System

A comprehensive microservices-based grading system for automated code submission evaluation, plagiarism detection, and assignment management.

## 🏗️ Architecture

This system follows **Clean Architecture** and **Microservices** patterns with the following services:


### 🔐 Identity Service
- **JWT Authentication** with refresh tokens
- **Role-based authorization** (Manager, Examiner)
- User management (CRUD)
- Secure password hashing with ASP.NET Core Identity

### 📝 Exam Service
- **Subject & Semester management**
- **Exam & Rubric creation**
- **OData support** for flexible querying
- RESTful API with Clean Architecture

### 📦 Grading Service
- **Batch submission upload** (RAR/ZIP files)
- **Automatic assignment** to examiners
- **Submission tracking** with status management
- **Violation management** (naming, keywords, plagiarism)
- **Grading workflow** with rubric-based scoring

### 🔍 Scan Service
- **Multi-format archive support** (RAR, ZIP, 7Z, TAR, GZIP)
- **Code violation detection**:
  - Naming convention violations
  - Forbidden keyword detection
- **AI-powered plagiarism detection** using:
  - Ollama embeddings (nomic-embed-text)
  - Qdrant vector database
  - Semantic similarity search
- **Background processing** with MassTransit & RabbitMQ

## 🛠️ Technology Stack

### Backend
- **.NET 8** - Latest LTS version
- **C# 12** - Modern language features
- **ASP.NET Core** - Web API framework
- **Entity Framework Core** - ORM
- **MediatR** - CQRS pattern implementation
- **FluentValidation** - Request validation
- **AutoMapper** - Object-object mapping

### Database
- **PostgreSQL** - Primary relational database
- **Qdrant** - Vector database for embeddings

### Message Broker
- **RabbitMQ** - Event-driven communication
- **MassTransit** - Service bus abstraction

### Storage
- **MinIO** - S3-compatible object storage

### AI/ML
- **Ollama** - Local LLM inference
- **nomic-embed-text** - Text embedding model

### Libraries
- **SharpCompress** - Archive extraction
- **OData** - Query protocol support
- **Npgsql** - PostgreSQL driver
- **Qdrant.Client** - Vector DB client
- **Minio** - Object storage client
