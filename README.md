
# CDR Analytics Dashboard

A full-stack Call Detail Record (CDR) analytics application built with React, Vite, Node.js, Express, and PostgreSQL.

The application provides a protected dashboard for exploring call records, monitoring call activity, and analysing call duration, cost, status, and geographic patterns.

## Project Status

- **Local application:** Working and tested.
- **Database:** Neon PostgreSQL, populated with 10,000 CDR records.
- **Authentication:** Email/password login with bcrypt password verification and JWT-protected CDR access.
- **Full-stack Vercel deployment:** Pending production configuration and testing.

## Live Demo

**Previous Netlify demo:** https://samuel-cdr-analytics-dashboard.netlify.app

**Full-stack Vercel demo:** Coming soon.

> The Netlify demo is an earlier deployment and may not include the PostgreSQL database, JWT authentication, or latest application changes. The full-stack application has been tested locally but has not yet been verified on Vercel.

## Screenshot

![CDR Analytics Dashboard](docs/dashboard-preview.png)

> Update `docs/dashboard-preview.png` with a screenshot of the latest application before submission.

## Features

### Authentication

- Email and password sign-in.
- Password hashes stored in PostgreSQL using bcrypt.
- JWT issued after successful authentication.
- Protected CDR endpoint requiring a valid bearer token.
- Logout and expired-session handling in the frontend.

### Dashboard

- Total calls.
- Total call cost.
- Average call duration.
- Successful and failed call counts.
- Daily call activity timeline.
- Call status distribution.
- Top cities by call volume.
- Search and filtering by call direction, status, and date range.

### Call Records

- Caller name and phone number.
- Receiver phone number.
- City.
- Incoming or outgoing call direction.
- Successful or failed call status.
- Call duration and cost.
- Call start time.
- Detailed call-record view.

### Analytics

- Longest, shortest, and average call duration.
- Call volume by city.
- Call status distribution.
- Call-cost insights.

### User Experience

- Responsive dashboard layout.
- Navigation between Dashboard, Call Records, and Analytics.
- Loading indicators and API error messages.
- Protected dashboard access after login.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| UI | shadcn-style components |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, hosted on Neon |
| Database client | `pg` |
| Authentication | JWT, `bcryptjs` |
| Data import | Excel (`xlsx`) |
| Version control | Git and GitHub |
| Planned full-stack hosting | Vercel |

## Project Structure

```text
CDR-ANALYTICS-DASHBOARD-FULLSTACK/
├── api/
│   └── index.cjs                 # Vercel API entry point
├── backend/
│   ├── data/
│   │   └── mock_call_records_10000.xlsx
│   ├── create-table.js           # Database table setup
│   ├── create-user.js            # Initial user creation
│   ├── db.js                     # PostgreSQL connection
│   ├── import-cdr.js             # CDR import utility
│   ├── import-neon.js            # Neon import utility
│   ├── server.js                 # Express API and authentication
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

The application uses PostgreSQL to store call records and user accounts.

### CDR Records

The `cdr_records` table contains **10,000 imported records** from the supplied Excel dataset.

The API returns records with these fields:

| Field | Description |
| --- | --- |
| `id` | Unique record identifier |
| `callerName` | Caller name |
| `callerNumber` | Caller phone number |
| `receiverNumber` | Receiver phone number |
| `city` | City associated with the call |
| `callDirection` | Boolean direction value, formatted for display |
| `callStatus` | Boolean status value, formatted for display |
| `callDuration` | Duration in seconds |
| `callCost` | Call cost |
| `callStartTime` | Call start timestamp |
| `callEndTime` | Call end timestamp |

The frontend uses `src/lib/callUtils.js` to format these values.

### Users

The `users` table stores account email addresses and bcrypt password hashes. Plain-text passwords are not stored in the database.

## API

The local Express API runs at:

```text
http://localhost:4000
```

### Health Check

```http
GET /api/health
```

Used to check whether the backend is running.

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

- Node.js and npm.
- Git.
- A PostgreSQL database, such as a Neon database.
- A code editor, such as Visual Studio Code.

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

Create the local backend environment files required by `backend/db.js` and `backend/server.js`.

Configure the PostgreSQL connection, JWT secret, and administrator account settings using the environment variable names expected by those files.

For initial account creation, `backend/create-user.js` reads:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

Use a strong administrator password of at least 12 characters.

> Never commit `.env` files, passwords, connection strings, or JWT secrets. The required production values must be configured separately in the deployment platform.

### 4. Prepare the Database

Create the database tables using the project's setup script, if they have not already been created:

```bash
node create-table.js
```

Import the CDR dataset using the appropriate import script for your configured database.

Create the initial user:

```bash
node create-user.js
```

> The user-creation script should only be run when the account does not already exist.

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

> A successful frontend build does not, by itself, verify the production API or database connection.

## Vercel Deployment

The repository includes:

- `api/index.cjs` as the Vercel API entry point.
- `vercel.json` with the Vite build settings and API rewrites.

The intended deployment serves the frontend and Express API from the same Vercel project. The frontend uses relative `/api` URLs in production.

Before marking the deployment as complete:

1. Configure the required database and authentication environment variables in Vercel.
2. Deploy the latest `main` branch.
3. Verify the deployed `/api/health` endpoint.
4. Test login using the deployed application.
5. Confirm that authenticated `/api/cdr` requests retrieve the PostgreSQL records.
6. Verify the Dashboard, Call Records, and Analytics pages.
7. Add the verified Vercel URL to the **Live Demo** section above.

**Deployment status: Pending verification.**

## GitHub Repository

https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK

## Author

**Samuel Sesay**