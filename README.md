
# CDR Analytics Dashboard

A full-stack Call Detail Record (CDR) analytics dashboard built with React, Vite, and an Express.js API backend.

The application displays call records and transforms CDR data into KPI summaries, call-duration analytics, cost analytics, call activity timelines, city analytics, and detailed recent-call tables.

## Live Demo

**Existing Netlify demo:** https://samuel-cdr-analytics-dashboard.netlify.app

**Full-stack Vercel deployment:** Pending deployment.

> The Netlify link is for the existing deployment and may not reflect the latest full-stack application. The Express backend currently runs locally. The frontend and backend must both be configured for production before the full-stack deployment is complete.

## Screenshot

![CDR Analytics Dashboard](docs/dashboard-preview.png)

> Replace `docs/dashboard-preview.png` with a screenshot of the latest dashboard before submitting the project.

## Features

### Dashboard and Analytics

- KPI cards for total calls, total call cost, average call duration, successful calls, and failed calls.
- Call-duration insights, including longest, shortest, and average call duration.
- Call-cost analytics, including total cost by city and average cost per call.
- Call activity timeline showing calls per day.
- Call status distribution.
- Top cities by call volume.
- Recent call records displayed in a detailed table.

### Call Records

- Caller name and phone number.
- Receiver phone number.
- City.
- Call direction: Incoming or Outgoing.
- Call status: Successful or Failed.
- Call duration and cost.
- Call start time.
- Search and filtering by call direction, status, and date range.

### User Experience

- Responsive dashboard layout.
- Sidebar navigation between Dashboard, Call Records, and Analytics.
- Loading indicators while retrieving API data.
- Error messages when API requests fail.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| UI components | shadcn-style components |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| API communication | HTTP and JSON |
| Version control | Git and GitHub |
| Frontend hosting | Netlify; Vercel deployment planned |

## Project Structure

```text
CDR-ANALYTICS-DASHBOARD-FULLSTACK/
|
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
|
├── docs/
│   └── dashboard-preview.png
|
├── public/
│   ├── favicon.svg
│   └── icons.svg
|
├── src/
│   ├── assets/
│   |
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   └── table.jsx
│   │   ├── CallsChart.jsx
│   │   ├── Filters.jsx
│   │   ├── Header.jsx
│   │   ├── RecentCalls.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   |
│   ├── lib/
│   │   ├── callUtils.js
│   │   └── utils.js
│   |
│   ├── pages/
│   │   ├── AnalyticsPage.jsx
│   │   ├── CallRecordsPage.jsx
│   │   └── DashboardPage.jsx
│   |
│   ├── services/
│   │   └── cdrApi.js
│   |
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
|
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── vercel.json
```

## API

The application includes an Express backend that runs locally at:

```text
http://localhost:4000
```

### Health Check

```http
GET /api/health
```

Local URL:

```text
http://localhost:4000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "CDR Analytics Backend is running"
}
```

### CDR Records

The frontend retrieves CDR records through the API service defined in:

```text
src/services/cdrApi.js
```

The Express backend also contains sample CDR records for local testing.

The original assignment supplied the following MockAPI endpoint:

```text
https://69b30b45e224ec066bdb55a0.mockapi.io/api/v1/cdr
```

The production data source should be confirmed when configuring the deployed backend.

### CDR Data Fields

The dashboard works with the following call-record fields:

| Field | Description |
| --- | --- |
| `id` | Unique record identifier |
| `callerName` | Name of the caller |
| `callerNumber` | Caller's phone number |
| `receiverNumber` | Receiver's phone number |
| `city` | City associated with the record |
| `callDirection` | Incoming or outgoing call |
| `callStatus` | Successful or failed call |
| `callDuration` | Call duration in seconds |
| `callCost` | Cost of the call |
| `callStartTime` | Call start timestamp |
| `callEndTime` | Call end timestamp |

The application uses helper functions in `src/lib/callUtils.js` to format call direction, status, duration, cost, and timestamps for display.

## Run Locally

### Prerequisites

Install the following:

- Node.js and npm.
- Git.
- Visual Studio Code or another code editor.

### 1. Clone the Repository

```bash
git clone https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK.git

cd CDR-ANALYTICS-DASHBOARD-FULLSTACK
```

### 2. Start the Backend

Open a terminal in the project directory:

```bash
cd backend

npm install

node server.js
```

When the server starts successfully, the terminal should display:

```text
Backend running at http://localhost:4000
```

Test the backend in your browser:

http://localhost:4000/api/health

Keep this terminal running.

### 3. Start the Frontend

Open a second terminal in the project root.

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

http://localhost:5173

The frontend and backend must both be running for the locally configured full-stack application to work.

## Production Build

From the project root, run:

```bash
npm run build
```

The production frontend files are generated in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### Frontend Deployment

The React/Vite frontend can be deployed to Netlify or Vercel using the following build settings:

| Setting | Value |
| --- | --- |
| Repository | `CDR-ANALYTICS-DASHBOARD-FULLSTACK` |
| Branch | `main` |
| Framework | Vite |
| Root directory | Project root |
| Build command | `npm run build` |
| Output directory | `dist` |

### Backend Deployment

The Express backend must be deployed separately or adapted to a supported serverless environment.

The current local backend address, `http://localhost:4000`, cannot be used as a public production API endpoint.

Before publishing the full-stack application:

1. Configure a production-accessible backend.
2. Update the frontend API configuration to use the deployed backend URL.
3. Configure CORS to allow the deployed frontend origin.
4. Test the API and dashboard on the deployed site.

> The presence of `vercel.json` does not, by itself, deploy the Express backend. Production deployment must be tested before marking the full-stack application as live.

## GitHub Repository

Source code:

https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK

## Author

**Samuel Sesay**