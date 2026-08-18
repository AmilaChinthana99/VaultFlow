# VaultFlow - Personal Finance Tracker Web Application

VaultFlow is a production-ready, full-stack personal finance management web application designed to help users track income and expenses, organize transactions by categories, visualize spending patterns through interactive charts, set and monitor monthly category budgets with automatic alerts, and export transaction data as CSV files.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Library**: React 18
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Data Visualization**: Recharts (Pie Chart, Bar Chart)
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (configured for production) / SQLite (pre-configured for zero-setup local dev & unit tests)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **CSV Generator**: `json2csv`
- **Testing**: Jest + Supertest

---

## 🛠️ Project Structure

```text
Project 1/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Prisma Database Models (User, Transaction, Category, Budget)
│   ├── src/
│   │   ├── controllers/         # Auth, Transaction, Category, Budget, Report controllers
│   │   ├── middleware/          # JWT authentication middleware
│   │   ├── routes/              # Express REST API routes
│   │   ├── utils/               # Prisma singleton client
│   │   └── index.js             # Express Server entry point
│   ├── tests/                   # Jest + Supertest API unit tests (auth & transactions)
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages (login, register, dashboard, transactions, budgets, reports, settings)
│   │   ├── components/          # Reusable UI components (Sidebar, Navbar, TransactionModal, BudgetModal)
│   │   ├── lib/                 # Axios API instance with JWT interceptors
│   │   └── store/               # Zustand auth state store
│   ├── .env.example
│   ├── .env.local
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

### Step 1: Backend Setup

1. Navigate into the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file (copied from `.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="super-secret-jwt-key-finance-tracker-2026"
   JWT_EXPIRES_IN="7d"
   ```

4. Push the Prisma database schema and generate the client:
   ```bash
   npx prisma db push
   ```

5. Run the backend unit tests to verify database and API integrity:
   ```bash
   npm test
   ```

6. Start the Express development server:
   ```bash
   npm run dev
   ```
   *The backend API will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup

1. Open a new terminal tab and navigate into the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create the `.env.local` file (copied from `.env.example`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:3000`.*

---

## 📡 API Endpoints Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Transactions (`/api/transactions`)
| Method | Endpoint | Query / Body Params | Description | Protected |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | `page`, `limit`, `type`, `categoryId`, `startDate`, `endDate`, `search` | Get paginated transactions | Yes |
| `POST` | `/api/transactions` | `{ amount, type, categoryId, description, date }` | Create transaction | Yes |
| `PUT` | `/api/transactions/:id` | `{ amount, type, categoryId, description, date }` | Update transaction | Yes |
| `DELETE` | `/api/transactions/:id` | None | Delete transaction | Yes |
| `GET` | `/api/transactions/export` | `type`, `categoryId`, `startDate`, `endDate`, `search` | Download CSV export | Yes |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get predefined system & user custom categories | Yes |
| `POST` | `/api/categories` | Create custom category (`name`, `icon`, `color`) | Yes |
| `DELETE` | `/api/categories/:id` | Delete custom category | Yes |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budgets` | Get category budgets for month/year with usage % & alert status | Yes |
| `POST` | `/api/budgets` | Set category budget limit (`categoryId`, `monthlyLimit`, `month`, `year`) | Yes |
| `DELETE` | `/api/budgets/:id` | Delete category budget | Yes |

### Reports (`/api/reports`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | Get monthly/custom range totals, 6-month trends, and category breakdown | Yes |

---

## 📸 Screenshots & Previews

### 1. Dashboard Overview
*(Overview metric cards, expense breakdown pie chart, 6-month income vs expense bar chart, recent transactions)*

### 2. Transaction Management
*(Paginated transactions table, multi-criteria filtering, search, CSV download)*

### 3. Category Budget Tracker
*(Usage progress bars with 90%+ warning and 100%+ exceeded alerts)*

---

## 🧪 Testing

To execute automated unit tests for the backend API:
```bash
cd backend
npm test
```

Unit tests cover:
- User Registration with password hashing & validation
- User Login & JWT token issuance
- Token-authenticated profile fetching
- Transaction CRUD operations & pagination
