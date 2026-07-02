# Mini Recruitment System

A high-performance, asynchronous backend recruitment platform built using **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **Redis**, and **BullMQ**. The system provides a secure REST API that connects applicants and recruiters while leveraging database indexing, role-based authorization, ACID transactions, Redis caching, and background job processing to improve scalability, reliability, and response times.

---

## Key Features

* **Asynchronous Background Processing:** Uses BullMQ to move long-running operations outside the HTTP request-response cycle.
* **Automatic Retry & Exponential Backoff:** Failed background jobs are retried automatically using exponential delays.
* **Multi-Layer Redis Caching:** Implements Cache-Aside caching to reduce database load and improve response times.
* **Session Cache Optimization:** Stores authenticated sessions in Redis to minimize repeated JWT verification.
* **Proactive Cache Invalidation:** Automatically removes stale cache entries whenever job data changes.
* **Dual-Role Authentication:** Supports both `applicant` and `recruiter` accounts.
* **Embedded Data Modeling:** Stores applicant educational history as embedded documents.
* **Role-Based Access Control:** Protects routes using JWT authentication and authorization middleware.
* **Compound Unique Constraints:** Prevents duplicate applications through database-level validation.
* **ACID Transactions:** Uses MongoDB transactions during hiring workflows.

---

## System Directory Layout

```text
recruitment-system/
│
├── config/
│   ├── db.js                 # MongoDB connection
│   └── redis.js              # Redis client configuration
│
├── middleware/
│   ├── auth.js               # JWT authentication & Redis session lookup
│   └── caching.js            # Cache middleware
│
├── models/
│   ├── User.js               # User schema
│   ├── Job.js                # Job schema
│   └── Application.js        # Application schema
│
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── jobRoutes.js          # Job routes
│   └── applicationRoutes.js  # Application routes
│
├── queues/
│   └── emailQ.js
│
├── workers/
│   └── emailWorker.js
│
├── .env
├── server.js
├── package.json
└── package-lock.json
```

---

## Technical Stack

| Component | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Cache Layer | Redis |
| Queue System | BullMQ |
| Authentication | JWT & bcryptjs |
| Validation | Express Validator |

---

## Core Architecture

### User Management

The application uses a unified **User** model supporting both applicants and recruiters. Applicant-specific information, including educational history, is stored as embedded documents to reduce joins and improve read performance.

Passwords are hashed using **bcryptjs** before storage and excluded from query results using Mongoose schema configuration.

### Role-Based Authorization

Protected routes require a valid JWT before execution.

Authorization middleware restricts recruiter-only functionality such as:

- Creating job postings
- Viewing submitted applications
- Updating hiring status

Applicants are limited to:

- Viewing available jobs
- Submitting applications
- Managing their own profile

### Database Constraints

The database layer enforces integrity through:

- Indexed collections for faster lookups
- Compound unique indexes preventing duplicate job applications
- Mongoose validation rules for required fields

### Transaction Processing

Hiring operations execute inside MongoDB transactions.

When an applicant's status changes to **hired**, multiple collections are updated atomically. If any operation fails, MongoDB rolls back every change to preserve consistency.

---

## Redis Caching Architecture

To improve response times and reduce unnecessary database queries, the application integrates Redis as an in-memory caching layer using the Cache-Aside pattern.

### Session Cache

After a successful login, user session information is stored in Redis using the following key format:

```text
session:USER_ID
```

Each session contains only the information required by the authentication middleware, including the user's ID and role, and expires automatically after 24 hours.

When a protected route is accessed, the authentication middleware:

1. Decodes the JWT.
2. Looks for the corresponding session in Redis.
3. Uses the cached session if available.
4. Falls back to JWT verification and database validation if the cache is missing.

This reduces repeated cryptographic operations and minimizes database access for authenticated requests.

---

### Route Content Cache

The Jobs API uses a Cache-Aside strategy.

#### Jobs List

```text
GET /api/jobs
```

The complete list of available jobs is cached in Redis after the first database request.

Subsequent requests return the cached response until the cache expires or is invalidated.

#### Individual Job Cache

```text
GET /api/jobs/:id
```

Individual job records are cached separately using their MongoDB ObjectId as the cache key.

This allows frequently viewed jobs to be served directly from memory instead of querying MongoDB.

---

### Cache Invalidation

Whenever job data changes, the corresponding cache entries are removed automatically.

Examples include:

- Creating a new job
- Updating an existing job
- Deleting a job

This ensures cached responses remain synchronized with the database while avoiding unnecessary cache rebuilds.

---

## Background Processing

### Message Queue

The application uses **BullMQ** to move time-consuming operations outside the HTTP request lifecycle.

After a successful registration, the API immediately returns a response while a background job is added to Redis. A dedicated worker processes the queued task independently.

This approach keeps API response times low while ensuring background tasks execute reliably.

### Producer

The producer creates lightweight queue jobs that describe the work to be completed, such as sending welcome emails.

### Worker

A dedicated BullMQ worker continuously monitors the queue, retrieves pending jobs, and processes them independently of the main Express application.

### Retry Strategy

Background jobs automatically retry when failures occur.

The queue is configured with:

- Three retry attempts
- Exponential backoff
- Failed and completed job event listeners

This improves resilience against temporary SMTP or network failures.

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Side Effect |
|-------|----------|-------------|-------------|
| POST | `/register` | Register applicant or recruiter | Adds welcome email job to BullMQ |
| POST | `/login` | Authenticate user and generate JWT | Stores session in Redis |

---

### Jobs (`/api/jobs`)

| Method | Endpoint | Description | Cache Policy |
|-------|----------|-------------|--------------|
| POST | `/` | Create a job posting (Recruiters only) | Invalidates Jobs Cache |
| GET | `/` | Retrieve all available jobs | Cache-Aside |
| GET | `/:id` | Retrieve a specific job | Cache-Aside |

---

### Applications (`/api/applications`)

| Method | Endpoint | Description | Cache Policy |
|-------|----------|-------------|--------------|
| POST | `/` | Submit a job application | Reads Session Cache |
| GET | `/` | Retrieve submitted applications | Reads Session Cache |
| PATCH | `/:id/status` | Update application status | MongoDB Transaction |

---

## Request Lifecycle

### Authentication Flow

1. Client submits login credentials.
2. Password is verified using bcrypt.
3. JWT is generated.
4. User session is stored in Redis.
5. JWT is returned to the client.

For future requests:

1. JWT is decoded.
2. Redis session is checked.
3. If found, the request proceeds immediately.
4. Otherwise, JWT verification and database validation are performed.

---

### Job Retrieval Flow

When requesting all jobs:

1. Check Redis.
2. Return cached response if available.
3. Otherwise query MongoDB.
4. Store response in Redis.
5. Return data to the client.

---

### Job Creation Flow

When a recruiter creates a new job:

1. Validate JWT.
2. Verify recruiter permissions.
3. Store the job in MongoDB.
4. Remove cached job data from Redis.
5. Return the newly created document.

---

## Local Installation

### Prerequisites

Before running the project, ensure the following are installed:

- Node.js
- MongoDB (local instance or MongoDB Atlas)
- Redis (local server or Upstash Redis)
- BullMQ (installed through npm)

---

### Install Dependencies

Clone the repository and install all required packages.

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/recruitmentDB
JWT_SECRET=your_secret

REDIS_URL=redis://your_username:your_password@your_upstash_endpoint:port
```

---

### Start MongoDB

If using a local MongoDB installation:

```bash
mongod
```

Or start the MongoDB service using your operating system's service manager.

---

### Start Redis

For a local Redis installation:

```bash
redis-server
```

If using Upstash Redis, no local Redis instance is required.

---

### Start the Application

Once MongoDB and Redis are running:

```bash
node server.js
```

The API will be available at:

```text
http://localhost:3000
```

---

## Performance Improvements

Compared to the original implementation, this version introduces several optimizations.

| Feature | Original Version | Performance Optimized Version |
|---------|------------------|-------------------------------|
| Authentication | JWT verification on every request | Redis-backed session cache |
| Job Listing | MongoDB query each request | Redis Cache-Aside |
| Individual Jobs | MongoDB query each request | Redis Cache-Aside |
| Cache Consistency | Not applicable | Automatic cache invalidation |
| Database Load | Higher | Reduced |
| Average Response Time | Database dependent | Memory-first responses when cached |

---

## Project Highlights

- RESTful API built with Express.js
- MongoDB persistence using Mongoose
- Redis session and route caching
- BullMQ background job processing
- JWT authentication with role-based authorization
- Embedded document modeling
- Compound unique database indexes
- MongoDB ACID transactions
- Express Validator middleware
- Cache-Aside caching strategy
- Automatic cache invalidation
- Producer-Consumer background architecture
- Automatic retry with exponential backoff
- Modular project structure

---

## License

This project was developed for educational purposes and demonstrates backend application development using Node.js, Express.js, MongoDB, and Redis.
