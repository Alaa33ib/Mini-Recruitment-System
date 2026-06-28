# Mini Recruitment System

A dual-sided backend recruitment platform built using **Node.js**, **Express.js**, and **MongoDB/Mongoose**. This system implements advanced NoSQL data structures, role-based access controls, optimized database indexing, and ACID transactions to safely bridge applicants and job postings.

---

## Key Features

* **Dual-Role Authentication:** Supports both `applicant` and `recruiter` roles inside a single unified User model.
* **Embedded Data Modeling:** Embeds applicant educational history to optimize read performance for frequent lookups.
* **Secure Route Protections:** Complete Role-Based Access Control (RBAC) middleware verifying JWT signatures.
* **Compound Unique Constraints:** Structural database enforcement preventing double-applications on open vacancies.
* **ACID Transaction Lifecycle:** Employs synchronized multi-document updates when shifting an application state to **hired**.

---

## System Directory Layout

```text
recruitment-system/
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Job.js
│   └── Application.js
│
├── middleware/
│   └── auth.js
│
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   └── applicationRoutes.js
│
├── .env
├── server.js
├── package.json
└── package-lock.json
```

---

## Technical Stack

* **Runtime Environment:** Node.js (ES Modules syntax)
* **Backend Framework:** Express.js
* **Database Management:** MongoDB using Mongoose ODM
* **Authentication Standards:** JSON Web Tokens (JWT) & bcryptjs hashing
* **Data Input Validation:** Express Validator

---

## Core Features

### Unified User Identity

* **Embedded Schema Models:** Stores applicant educational history directly inside user documents.
* **Dynamic Validation:** Required fields change based on whether the account is an applicant or recruiter.
* **Secure Password Storage:** Password hashes are hidden from query results using Mongoose schema configuration.

### Database Constraints

* **Indexed Job Collection:** Optimized lookups using indexed schema fields.
* **Duplicate Prevention:** Compound unique constraints prevent duplicate job applications.

### Role-Based Access Control

* **JWT Authentication:** Middleware validates incoming access tokens.
* **Role Authorization:** Recruiters manage jobs and applications, while applicants submit applications.

### Transaction Processing

* **Atomic Updates:** Multi-document MongoDB transactions keep related updates synchronized.
* **Rollback Support:** Failed hiring operations automatically revert all database changes.

### Request Validation

* **Pre-routing Validation:** Express Validator filters invalid requests before controller execution.
* **Centralized Error Handling:** Validation failures return standardized error responses.

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register an applicant or recruiter |
| POST | `/login` | Authenticate a user and return a JWT |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new job (Recruiters only) |
| GET | `/` | Retrieve all active jobs |

### Applications (`/api/applications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit a job application |
| GET | `/` | Retrieve received applications |
| PATCH | `/:id/status` | Update an application's status |

---

## Local Installation

### Prerequisites

* Node.js
* MongoDB (local or Atlas)

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/recruitmentDB
JWT_SECRET=your_isolated_production_token_secret_string
```

### Start MongoDB

```dos
"C:\Users\USER\Desktop\MongoDB\bin\mongod.exe" --dbpath="C:\data\db"
```

### Start the Server

```bash
node server.js
```
