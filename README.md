# CDR Analytics Dashboard

A React/Vite analytics dashboard for Call Data Record (CDR) analysis. The application consumes the internship assignment's MockAPI endpoint and transforms the returned records into KPI summaries, call-duration analytics, cost analytics, timeline charts, city analytics, and a detailed recent-call table.

## Live Demo

Netlify: https://samuel-cdr-analytics-dashboard.netlify.app

> The assignment requests a Vercel submission. This repository includes `vercel.json` and is ready to import into Vercel. Add the final Vercel URL here after deployment.

## Screenshot

![CDR Analytics Dashboard](docs/dashboard-preview.png)

## Assignment Requirements Implemented

- React + Vite
- Tailwind CSS
- shadcn-style Card and Table components under `src/components/ui`
- Recharts data visualisations
- CDR data fetched from the supplied API endpoint
- KPI cards: Total Calls, Total Call Cost, Average Call Duration, Successful Calls, Failed Calls
- Call-duration insights: longest, shortest, and average duration
- Call-cost analytics: total cost by city and average cost per call
- Call activity timeline: calls per day
- Calls by city chart
- Recent call logs table with caller name, caller number, receiver number, city, duration, cost, and start time
- Search and filters for direction, status, and date range
- Loading and API error states
- Responsive navigation and layout

## API

The dashboard fetches records from:

```text
https://69b30b45e224ec066bdb55a0.mockapi.io/api/v1/cdr
```

The application uses the API fields directly:

`callerName`, `callerNumber`, `receiverNumber`, `city`, `callDirection`, `callStatus`, `callDuration`, `callCost`, `callStartTime`, `callEndTime`, and `id`.

`callDirection: true` is displayed as Incoming and `false` as Outgoing. `callStatus: true` is displayed as Successful and `false` as Failed. `callDuration` is treated as seconds and `callCost` is converted from the API string to a number for analytics.

## Technology Stack

- React 19
- Vite 8
- Tailwind CSS 4
- shadcn/ui component structure
- Recharts
- Lucide React
- JavaScript
- Git / GitHub
- Netlify / Vercel-ready configuration

## Run Locally

```bash
git clone https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD.git
cd CDR-ANALYTICS-DASHBOARD
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Select the `main` branch.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy and add the resulting Vercel URL to this README.

## Project Structure

```text
src/
├── components/
│   ├── ui/
│   │   ├── card.jsx
│   │   └── table.jsx
│   ├── CallsChart.jsx
│   ├── Filters.jsx
│   ├── Header.jsx
│   ├── RecentCalls.jsx
│   ├── Sidebar.jsx
│   └── StatCard.jsx
├── lib/
│   ├── callUtils.js
│   └── utils.js
├── pages/
│   ├── AnalyticsPage.jsx
│   ├── CallRecordsPage.jsx
│   └── DashboardPage.jsx
├── services/
│   └── cdrApi.js
├── App.jsx
└── main.jsx
```

## Author

Samuel Sesay
