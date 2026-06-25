# Mini Recruitment System

A dual-sided backend recruitment platform built using **Node.js**, **Express.js**, and **MongoDB/Mongoose**. This system implements advanced NoSQL data structures, role-based access controls, optimized database indexing, and ACID transactions to safely bridge applicants and job postings.

---

## 🚀 Key Features

* **Dual-Role Authentication:** Supports both `applicant` and `recruiter` roles inside a single unified User model.
* **Embedded Data Modeling:** Embeds applicant educational history to optimize read performance for frequent lookups.
* **Secure Route Protections:** Complete Role-Based Access Control (RBAC) middleware verifying JWT signatures.
* **Compound Unique Constraints:** Structural database enforcement preventing double-applications on open vacancies.
* **ACID Transaction Lifecycle:** Employs synchronized multi-document updates when shifting an application state to "hired".

---

## 📁 System Directory Layout

```text
recruitment-system/
│
├── config/
│   └── db.js                 # Dedicated MongoDB Mongoose connector
│
├── models/
│   ├── User.js               # Dual-role profile schema (with embedded arrays)
│   ├── Job.js                # Job listings collection (referenced index)
│   └── Application.js        # The relational bridging collection
│
├── middleware/
│   └── auth.js               # Verification checkpoint & role protection rules
│
├── routes/
│   ├── authRoutes.js         # Security registration & login workflows
│   ├── jobRoutes.js          # Job creation (Recruiters) & job browsing (All)
│   └── applicationRoutes.js  # Submission channels & transactional status updates
│
├── .env                      # App environment attributes (Ignored by Git)
├── server.js                 # Central application entry point
└── package.json              # Engine manifestations & dependencies