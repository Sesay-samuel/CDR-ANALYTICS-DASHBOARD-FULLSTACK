# CDR Analytics Dashboard

A full-stack Call Detail Record (CDR) analytics application built with React, Vite, Node.js, Express, and PostgreSQL.

The application provides a secure dashboard for exploring call records, monitoring call activity, and analysing call duration, cost, status, and geographic patterns.

## Project Status

* **Local application:** Working and tested.
* **Database:** Neon PostgreSQL, populated with 10,000 CDR records.
* **Authentication:** Email/password login with bcrypt password verification and JWT-protected CDR access.
* **Full-stack deployment:** Deployed and tested on Vercel.
* **Production verification:** Login, API connectivity, and dashboard access confirmed.

## Live Demo

**Full-stack Vercel application:** https://cdr-analytics-dashboard-fullstack.vercel.app/

**Previous Netlify demo:** https://samuel-cdr-analytics-dashboard.netlify.app/

> The Vercel application is the current full-stack version. The Netlify link is an earlier demo and may not include the PostgreSQL database, JWT authentication, or latest application changes.

## Screenshot

![CDR Analytics Dashboard](docs/dashboard-preview.png)

> Replace `docs/dashboard-preview.png` with a screenshot of the latest deployed dashboard before submission, if the existing image is outdated.

## Features

### Authentication

* Email and password sign-in.
* Password hashes stored in PostgreSQL using bcrypt.
* JWT issued after successful authentication.
* Protected CDR endpoint requiring a valid bearer token.
* Logout and expired-session handling in the frontend.

### Dashboard

* Total calls.
* Total call cost.
* Average call duration.
* Successful and failed call counts.
* Daily call activity timeline.
* Call status distribution.
* Top cities by call volume.
* Search and filtering by call direction, status, and date range.

### Call Records

* Caller name and phone number.
* Receiver phone number.
* City.
* Incoming or outgoing call direction.
* Successful or failed call status.
* Call duration and cost.
* Call start time.
* Detailed call-record view.

### Analytics

* Longest, shortest, and average call duration.
* Call volume by city.
* Call status distribution.
* Call-cost insights.

### User Experience

* Responsive dashboard layout.
* Navigation between Dashboard, Call Records, and Analytics.
* Loading indicators and API error messages.
* Protected dashboard access after login.

## Technology Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| Frontend           | React 19, Vite 8           |
| Styling            | Tailwind CSS 4             |
| UI                 | shadcn-style components    |
| Charts             | Recharts                   |
| Icons              | Lucide React               |
| Backend            | Node.js, Express.js        |
| Database           | PostgreSQL, hosted on Neon |
| Database client    | `pg`                       |
| Authentication     | JWT, `bcryptjs`            |
| Data import        | Excel (`xlsx`)             |
| Version control    | Git and GitHub             |
| Full-stack hosting | Vercel                     |

## Project Structure

```text
CDR-ANALYTICS-DASHBOARD-FULLSTACK/
├── api/
│   └── index.js                 # Vercel API entry point
├── backend/
│   ├── data/
│   │   └── mock_call_records_10000.xlsx
│   ├── create-table.js          # Database table setup
│   ├── create-user.js           # Initial user creation
│   ├── db.js                    # PostgreSQL connection
│   ├── import-cdr.js            # CDR import utility
│   ├── import-neon.js           # Neon import utility
│   ├── server.js                # Express API and authentication
│   ├── package.json
│   └── package-lock.json
├── docs/
│   └── dashboard-preview.png
├── public/
├── src/
│   ├── components/
│   ├── lib/
│   │   ├── callUtils.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── AnalyticsPage.jsx
│   │   ├── CallRecordsPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/
│   │   └── cdrApi.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── vercel.json
```

> Local `.env` files and `node_modules` are excluded from Git. Do not commit database credentials, JWT secrets, or administrator passwords.

## Database

The application uses PostgreSQL to store call records and user accounts. The deployed application connects to a Neon-hosted PostgreSQL database.

### CDR Records

The `cdr_records` table contains **10,000 imported records** from the supplied Excel dataset.

The API returns records with these fields:

| Field            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `id`             | Unique record identifier                       |
| `callerName`     | Caller name                                    |
| `callerNumber`   | Caller phone number                            |
| `receiverNumber` | Receiver phone number                          |
| `city`           | City associated with the call                  |
| `callDirection`  | Boolean direction value, formatted for display |
| `callStatus`     | Boolean status value, formatted for display    |
| `callDuration`   | Duration in seconds                            |
| `callCost`       | Call cost                                      |
| `callStartTime`  | Call start timestamp                           |
| `callEndTime`    | Call end timestamp                             |

The frontend uses `src/lib/callUtils.js` to format these values.

### Users

The `users` table stores account email addresses and bcrypt password hashes. Plain-text passwords are not stored in the database.

## API

The Express API runs locally at `http://localhost:4000` and is available through the deployed application's `/api` routes.

### Health Check

```http
GET /api/health
```

**Live endpoint:** https://cdr-analytics-dashboard-fullstack.vercel.app/api/health

This public endpoint checks whether the backend is running.

Example response:

```json
{
  "success": true,
  "message": "CDR Analytics Backend is running"
}
```

### Login

```http
POST /api/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

A successful login returns a JWT that the frontend uses for subsequent protected requests.

### CDR Records

```http
GET /api/cdr
Authorization: Bearer <JWT>
```

The endpoint queries PostgreSQL and returns CDR records as JSON. Requests with a missing, invalid, or expired token are rejected.

The frontend API client is implemented in `src/services/cdrApi.js`.

## Run Locally

### Prerequisites

* Node.js and npm.
* Git.
* A PostgreSQL database, such as a Neon database.
* A code editor, such as Visual Studio Code.

### 1. Clone the Repository

```bash
git clone https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK.git
cd CDR-ANALYTICS-DASHBOARD-FULLSTACK
```

### 2. Install Dependencies

Install the frontend dependencies from the project root:

```bash
npm install
```

Then install the backend dependencies:

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create `backend/.env` for local configuration. To use Neon locally, configure `NEON_DATABASE_URL` in the environment or in `backend/.env.neon`.

The application uses these environment variable names:

| Variable            | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string          |
| `JWT_SECRET`        | Secret used to sign and verify JWTs        |
| `DB_HOST`           | Local PostgreSQL host, when not using Neon |
| `DB_PORT`           | Local PostgreSQL port, when not using Neon |
| `DB_NAME`           | Local PostgreSQL database name             |
| `DB_USER`           | Local PostgreSQL user                      |
| `DB_PASSWORD`       | Local PostgreSQL password                  |
| `ADMIN_EMAIL`       | Email for initial account creation         |
| `ADMIN_PASSWORD`    | Password for initial account creation      |

The database connection uses `NEON_DATABASE_URL` when it is configured; otherwise, it uses the individual `DB_*` settings.

Use a strong administrator password of at least 12 characters and a securely generated JWT secret.

> Never commit `.env` files, passwords, connection strings, or JWT secrets. Configure production values separately in Vercel.

### 4. Prepare the Database

From the `backend` directory, create the database tables if they do not already exist:

```bash
node create-table.js
```

Import the supplied dataset using the appropriate script for your configured database. For Neon:

```bash
node import-neon.js
```

Create the initial user:

```bash
node create-user.js
```

> Only run initial setup and import scripts against a database you intend to initialise. Check the existing records and user account before rerunning them.

### 5. Start the Backend

From the `backend` directory:

```bash
node server.js
```

Check the health endpoint:

http://localhost:4000/api/health

Keep the backend terminal running.

### 6. Start the Frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

http://localhost:5173

Sign in using the account created in PostgreSQL. The frontend retrieves the CDR records using the JWT returned by the login endpoint.

## Production Build

From the project root:

```bash
npm run build
```

The production frontend is generated in `dist/`.

To preview the frontend build locally:

```bash
npm run preview
```

> The Vite preview checks the frontend build. It does not replace testing the deployed Express API, authentication, or database connection.

## Vercel Deployment

The full-stack application is deployed on Vercel:

https://cdr-analytics-dashboard-fullstack.vercel.app/

The repository includes:

* `api/index.js` as the Vercel API entry point.
* `vercel.json` with Vite build settings and API rewrites.
* A React frontend that uses relative `/api` URLs in production.

The production environment is configured with `NEON_DATABASE_URL` and `JWT_SECRET` in Vercel's environment variable settings.

### Deployment Verification

The following checks have been completed:

* [x] Deploy the latest application to Vercel.
* [x] Confirm that `/api/health` returns the Express health-check JSON.
* [x] Test login on the deployed application.
* [x] Confirm that the deployed application connects to its PostgreSQL database.
* [x] Confirm that the dashboard loads successfully.

**Deployment status: Live and working.**

## GitHub Repository

https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK

## Author

**Samuel Sesay**
