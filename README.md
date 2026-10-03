# CDR Analytics Dashboard

A full-stack, cloud-integrated Call Detail Record (CDR) analytics platform built with **React, Vite, Node.js, Express, PostgreSQL, Microsoft Azure, Power Platform, Docker, and Azure DevOps**.

The project demonstrates a production-style software engineering workflow covering full-stack development, authentication and role-based access control, automated testing, cloud integration, observability, Power Platform development, CI/CD, containerisation, and DevSecOps.

## Project Overview

The CDR Analytics Dashboard provides secure access to call-record data and aggregated analytics for two application roles:

- **Admin** — access to dashboard analytics, raw CDR records, pagination, filtering, and protected APIs.
- **Analyst** — view-only access to aggregated analytics without access to raw CDR records.

The application uses a React/Vite frontend, a Node.js/Express REST API, and PostgreSQL hosted on Neon.

The project was extended with Microsoft Azure and Power Platform components including:

- Azure Functions
- Azure Service Bus
- Azure Application Insights
- Power Apps Canvas App
- Power Automate cloud flow
- Power Platform solution source
- C# Dataverse plugin foundation
- xUnit and Moq plugin tests
- Azure DevOps CI/CD
- Docker containerisation
- Semgrep SAST
- Trivy container vulnerability scanning
- Dependency vulnerability scanning

## Project Status

The main implementation phases are complete.

- **Frontend:** React/Vite dashboard implemented and production build verified.
- **Backend:** Node.js/Express REST API implemented and tested.
- **Database:** Neon PostgreSQL populated with 10,000 CDR records.
- **Authentication:** JWT authentication with bcrypt password verification.
- **Authorisation:** Admin/Analyst role-based access control.
- **Backend testing:** Jest and Supertest automated tests.
- **Azure Functions:** CDR analytics function implemented and tested.
- **Azure Service Bus:** Queue integration implemented and validated.
- **Application Insights:** Custom telemetry integration implemented and validated.
- **Power Platform:** Canvas App and Power Automate integration implemented and tested.
- **Power Platform solution:** Solution source exported and stored in the repository.
- **C# plugin:** Dataverse `IPlugin` foundation implemented with tracing and error handling.
- **C# automated testing:** xUnit and Moq tests passing locally and in Azure DevOps.
- **CI/CD:** Azure DevOps multi-job pipeline implemented.
- **DevSecOps:** Dependency scanning, Semgrep SAST, Docker build, and Trivy scanning integrated.
- **Deployment:** Vercel used for preview and production deployment.
- **Version control:** Feature-branch and pull-request workflow used throughout development.

## Live Application

The full-stack application is deployed on Vercel.

**Production application:**

https://cdr-analytics-dashboard-fullstack.vercel.app/

**Health endpoint:**

https://cdr-analytics-dashboard-fullstack.vercel.app/api/health

> Secrets, connection strings, JWT secrets, database credentials, and telemetry credentials are not stored in the repository.

## Architecture

```text
                         +----------------------+
                         |   React / Vite UI    |
                         | Admin + Analyst RBAC |
                         +----------+-----------+
                                    |
                                    | HTTPS / REST
                                    v
                         +----------------------+
                         | Node.js / Express API|
                         | JWT + RBAC           |
                         +----+------------+----+
                              |            |
                              |            |
                              v            v
                    +---------------+   +----------------+
                    | PostgreSQL /  |   |    Vercel      |
                    | Neon Database |   | Deployment     |
                    +---------------+   +----------------+

                              Cloud Integration
                                    |
                                    v
                         +----------------------+
                         |   Azure Functions    |
                         |   CDR Processing     |
                         +----------+-----------+
                                    |
                         +----------+----------+
                         |                     |
                         v                     v
                +----------------+    +--------------------+
                | Azure Service  |    | Application        |
                | Bus Queue      |    | Insights           |
                +----------------+    | Telemetry          |
                                      +--------------------+

                         Power Platform
                               |
                +--------------+--------------+
                |                             |
                v                             v
        +----------------+            +----------------+
        | Power Apps     |            | Power Automate |
        | Canvas App     |            | Cloud Flow     |
        +----------------+            +----------------+
                |
                v
        +---------------------------+
        | Power Platform Solution   |
        | + C# Dataverse IPlugin    |
        | + xUnit / Moq Tests       |
        +---------------------------+

                         CI / DevSecOps
                               |
                               v
                    +-----------------------+
                    |     Azure DevOps      |
                    +-----------+-----------+
                                |
        +-----------+-----------+-----------+-----------+
        |           |           |           |           |
        v           v           v           v           v
      Tests      Coverage    Semgrep      Docker      Trivy
```

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn-style components |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL / Neon |
| Authentication | JWT, bcryptjs |
| Authorisation | Admin/Analyst RBAC |
| Backend Testing | Jest, Supertest |
| Serverless | Azure Functions |
| Messaging | Azure Service Bus |
| Observability | Azure Application Insights |
| Low-Code Application | Microsoft Power Apps Canvas App |
| Workflow Automation | Microsoft Power Automate |
| Power Platform Development | Solution source, C# Dataverse plugin |
| C# Testing | xUnit, Moq |
| CI/CD | Azure DevOps Pipelines |
| Containerisation | Docker |
| Dependency Security | npm audit |
| Static Analysis | Semgrep |
| Container Security | Trivy |
| Version Control | Git, GitHub |
| Deployment | Vercel |

## Core Application Features

### Authentication

The application implements secure email/password authentication through the Express backend.

- Passwords are hashed using `bcryptjs`.
- Successful authentication returns a JSON Web Token (JWT).
- Protected API requests require a valid Bearer token.
- JWT verification is performed by backend middleware.
- Expired or invalid tokens are rejected.
- Authentication credentials and JWT secrets are supplied through environment variables.

### Role-Based Access Control

Two application roles are implemented:

| Role | Access |
| --- | --- |
| Admin | Dashboard analytics, raw CDR records, paginated records, filtering, and analytics APIs |
| Analyst | Aggregated analytics only; raw CDR records are restricted |

RBAC is enforced by the backend rather than relying only on frontend visibility.

A valid authenticated user attempting to access an endpoint without the required role receives:

```text
HTTP 403 Forbidden
```

Requests without valid authentication receive:

```text
HTTP 401 Unauthorized
```

### Admin Dashboard

The Admin dashboard provides:

- Total call count
- Total call cost
- Average call duration
- Successful and failed call counts
- Daily call activity
- Call-status distribution
- Top cities by call volume
- Search and filtering
- Raw CDR record access
- Paginated record access

### Analyst Dashboard

The Analyst interface provides view-only aggregated analytics, including:

- Total calls
- Total call duration
- Incoming call count
- Outgoing call count
- Top callers
- Call analytics summary

Analysts cannot access Admin-only raw CDR endpoints.

## Database

The application uses PostgreSQL with the production database hosted on Neon.

The development dataset contains **10,000 CDR records**.

### CDR Data

CDR records include information such as:

- Caller name
- Caller number
- Receiver number
- City
- Call direction
- Call status
- Call duration
- Call cost
- Call start time
- Call end time

### User Data

The `users` table supports authentication and role-based access.

Important fields include:

| Field | Purpose |
| --- | --- |
| `id` | User identifier |
| `email` | Login email |
| `password_hash` | bcrypt password hash |
| `role` | `admin` or `analyst` |
| `created_at` | Account creation timestamp |

Plain-text passwords are not stored.

## REST API

The Express backend exposes public and protected REST endpoints.

### Access Matrix

| Endpoint | Admin | Analyst | Authentication |
| --- | --- | --- | --- |
| `GET /api/health` | Allowed | Allowed | Public |
| `POST /api/login` | Allowed | Allowed | Public |
| `GET /api/cdr` | Allowed | Forbidden | JWT |
| `GET /api/cdr/paginated` | Allowed | Forbidden | JWT |
| `GET /api/analytics/summary` | Allowed | Allowed | JWT |

### Health Check

```http
GET /api/health
```

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

Example request structure:

```json
{
  "email": "user@example.com",
  "password": "<password>"
}
```

A successful request returns a JWT and the authenticated user's role.

> Real passwords and JWTs must never be committed to source control or included in documentation/screenshots.

### Protected Request

Protected endpoints use the standard Bearer token pattern:

```http
Authorization: Bearer <JWT>
```

## Automated Backend Testing

The Express backend includes automated tests using **Jest** and **Supertest**.

The test suite covers important authentication and authorisation behaviour, including:

- Successful login
- Invalid credentials
- Missing JWT
- Invalid JWT
- Insufficient role permissions
- Successful authorised analytics access

The backend test suite contains **11 automated tests across 3 test suites**.

Run the backend tests from the `backend` directory:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Coverage Quality Gates

The project uses Jest coverage thresholds as CI quality gates.

Configured minimum thresholds include:

| Metric | Minimum |
| --- | ---: |
| Branches | 40% |
| Functions | 63% |
| Lines | 49% |
| Statements | 49% |

A pipeline run fails if the configured coverage requirements are not satisfied.

## Azure Functions

The repository contains a serverless Azure Functions component for CDR analytics processing.

Key implementation areas include:

```text
azure-functions/
├── src/
│   ├── functions/
│   │   └── cdrAnalytics.js
│   └── services/
│       ├── serviceBus.js
│       └── telemetry.js
└── _tests_/
    ├── cdrAnalytics.test.js
    ├── serviceBus.test.js
    └── telemetry.test.js
```

The Azure Functions implementation separates the HTTP/function logic from messaging and telemetry services to improve maintainability and automated testability.

The function can be run locally using Azure Functions Core Tools.

Example local endpoint:

```text
POST http://localhost:7071/api/cdrAnalytics
```

## Azure Service Bus

Azure Service Bus is used to demonstrate asynchronous messaging from the serverless analytics component.

The project uses a dedicated queue:

```text
cdr-analytics
```

The integration is implemented in:

```text
azure-functions/src/services/serviceBus.js
```

Automated Service Bus tests are implemented in:

```text
azure-functions/_tests_/serviceBus.test.js
```

The integration was validated end-to-end by publishing CDR analytics data through the Azure messaging infrastructure.

Sensitive Service Bus credentials are supplied through environment configuration and are never stored in the repository.

## Azure Application Insights

Application Insights provides observability for the Azure Functions integration.

Telemetry support is implemented in:

```text
azure-functions/src/services/telemetry.js
```

Automated telemetry tests are located in:

```text
azure-functions/_tests_/telemetry.test.js
```

Custom telemetry events include:

```text
CdrAnalyticsProcessed
ServiceBusMessagePublished
```

This provides visibility into analytics processing and Service Bus publishing activity.

Application Insights credentials are managed through environment configuration rather than source control.

## Microsoft Power Platform

The project includes a Microsoft Power Platform implementation that extends the CDR analytics use case beyond the React application.

### Power Apps Canvas App

A Canvas App named **CDR Analytics Dashboard** was created to provide a Power Platform interface for CDR analytics.

The app supports:

- Displaying CDR analytics metrics
- Viewing CDR records
- Filtering records
- Filtering by Completed and Failed status
- Processing CDR analytics through Power Automate
- Displaying processing results to the user

The Canvas App was tested with both successful and failed CDR records and published to the Power Platform environment.

### Power Automate

A cloud flow named:

```text
Process CDR Analytics
```

was created using the **Power Apps (V2)** trigger.

The flow accepts values from the Canvas App including:

```text
CallID
Duration
Status
```

This demonstrates integration between a Power Apps user interface and workflow automation.

### Power Platform Solution

Power Platform components are managed through the **CDR Analytics** solution.

The unpacked solution source is stored in the repository:

```text
power-platform/
└── solution/
    ├── solution.cdsproj
    └── src/
        └── Other/
            ├── Customizations.xml
            ├── Relationships.xml
            └── Solution.xml
```

Generated Power Platform build directories such as `bin` and `obj` are excluded from source control.

Keeping solution source in Git provides a foundation for source-controlled Power Platform application lifecycle management.

## C# Dataverse Plugin

The project includes a C# Dataverse plugin foundation implemented using the Microsoft Dataverse SDK.

The plugin is located at:

```text
power-platform/plugins/CdrAnalyticsPlugin/
```

The main class implements:

```csharp
IPlugin
```

and includes:

- Dataverse plugin execution structure
- `IPluginExecutionContext`
- `ITracingService`
- Target entity validation
- Structured tracing
- Exception handling using `InvalidPluginExecutionException`

The project targets **.NET Framework 4.7.2 (`net472`)** for Dataverse compatibility.

> The current implementation is a tested plugin foundation. Registration and deployment of the plugin to a Dataverse environment are intentionally outside the current project scope.

### C# Plugin Automated Tests

The plugin has a separate automated test project:

```text
power-platform/plugins/CdrAnalyticsPlugin.Tests/
```

Testing technologies include:

- xUnit
- Moq
- Microsoft Dataverse SDK assemblies
- .NET test tooling

The tests validate:

- Null service-provider handling
- Execution without a Target entity
- Successful execution with a valid Target entity

Run the tests locally with:

```bash
dotnet test power-platform/plugins/CdrAnalyticsPlugin.Tests/CdrAnalyticsPlugin.Tests.csproj --configuration Release
```

The current plugin suite contains **3 automated tests**, all of which have passed locally and in Azure DevOps.

## Azure DevOps CI/CD

The repository uses Azure DevOps Pipelines to automate build, testing, security scanning, and validation.

The pipeline is defined in:

```text
azure-pipelines.yml
```

The pipeline separates the application and Power Platform plugin workloads into two jobs.

### Full-Stack CI and DevSecOps

Runs on a Linux hosted agent and performs:

1. Install Node.js
2. Install frontend dependencies
3. Build the React/Vite frontend
4. Install backend dependencies
5. Run backend Jest tests with coverage
6. Install Azure Functions dependencies
7. Run Azure Functions tests
8. Run backend dependency security scanning
9. Run Azure Functions dependency security scanning
10. Run Semgrep static application security testing
11. Build the Docker image
12. Scan the container image with Trivy

### Power Platform C# Plugin CI

Runs on a Windows hosted agent because the Dataverse plugin targets .NET Framework.

The job performs:

```text
dotnet restore
      |
      v
dotnet build --configuration Release
      |
      v
dotnet test --configuration Release
```

This validates the C# plugin independently from the Node.js application pipeline.

The plugin CI has successfully executed the complete xUnit suite in Azure DevOps:

```text
Failed: 0
Passed: 3
Skipped: 0
Total: 3
```

## DevSecOps

Security checks are integrated directly into the CI pipeline rather than being treated only as a final deployment activity.

### Dependency Vulnerability Scanning

`npm audit` is used to identify vulnerable Node.js dependencies.

The pipeline is configured to check both:

- Backend dependencies
- Azure Functions dependencies

High-severity dependency findings can fail the pipeline.

### Static Application Security Testing

**Semgrep** is used for static analysis of application source code.

This adds automated source-level security analysis to the CI workflow.

Security rules are reviewed in the context of the application's authentication architecture. For example, the API uses explicit Bearer JWT authentication rather than ambient authentication cookies.

### Docker Security

The application is containerised using Docker.

The container is configured to run using the built-in non-root Node user rather than running the application process as root.

This reduces privileges inside the application container.

### Container Vulnerability Scanning

**Trivy** scans the built Docker image for known vulnerabilities.

The CI security gate checks for:

```text
HIGH
CRITICAL
```

severity vulnerabilities.

This allows vulnerable container builds to be detected before they progress further through the delivery workflow.

## Testing Strategy

The project uses automated testing across multiple technology layers.

| Component | Test Technology | Coverage |
| --- | --- | --- |
| Express API | Jest + Supertest | Authentication, JWT, RBAC and API behaviour |
| Azure Functions | Jest | CDR analytics processing |
| Service Bus integration | Jest | Messaging service behaviour |
| Application Insights | Jest | Telemetry behaviour |
| Dataverse C# plugin | xUnit + Moq | Plugin execution behaviour |

This demonstrates automated testing across JavaScript, serverless cloud integration, and C# Power Platform development.

## CI/CD and Deployment Workflow

Development followed a feature-branch and pull-request workflow.

```text
Feature Branch
      |
      v
Local Development
      |
      v
Automated Tests
      |
      v
Push to GitHub
      |
      +----------------------+
      |                      |
      v                      v
Azure DevOps CI          Vercel Preview
      |                      |
      v                      v
Build + Test             Preview Validation
Security Scans
      |
      v
Pull Request
      |
      v
Merge to main
      |
      v
Vercel Production
```

This separates CI/security validation from the production hosting platform while keeping deployment tied to the Git workflow.

## Security Practices

Security controls implemented or demonstrated by the project include:

- Password hashing with bcrypt
- JWT authentication
- Backend-enforced RBAC
- HTTP 401 handling for invalid authentication
- HTTP 403 handling for insufficient permissions
- Environment-based secret management
- No committed database passwords
- No committed JWT secrets
- No committed Azure Service Bus connection strings
- No committed Application Insights credentials
- Dependency vulnerability scanning
- Static application security testing
- Non-root Docker execution
- Container vulnerability scanning
- Automated test and coverage quality gates

Local `.env` files, Azure credentials, generated build output, and dependency directories are excluded from source control where appropriate.

## Repository Structure

The repository combines the full-stack application, Azure integration, Power Platform source, automated tests, and CI/CD configuration.

```text
CDR-ANALYTICS-DASHBOARD-FULLSTACK/
├── api/
│   └── index.js
│
├── backend/
│   ├── _tests_/
│   ├── data/
│   ├── create-analyst.js
│   ├── create-table.js
│   ├── create-user.js
│   ├── db.js
│   ├── import-cdr.js
│   ├── import-neon.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── azure-functions/
│   ├── _tests_/
│   │   ├── cdrAnalytics.test.js
│   │   ├── serviceBus.test.js
│   │   └── telemetry.test.js
│   ├── src/
│   │   ├── functions/
│   │   │   └── cdrAnalytics.js
│   │   └── services/
│   │       ├── serviceBus.js
│   │       └── telemetry.js
│   ├── host.json
│   ├── package.json
│   └── package-lock.json
│
├── power-platform/
│   ├── plugins/
│   │   ├── CdrAnalyticsPlugin/
│   │   │   ├── CdrAnalyticsPlugin.cs
│   │   │   └── CdrAnalyticsPlugin.csproj
│   │   └── CdrAnalyticsPlugin.Tests/
│   │       ├── CdrAnalyticsPlugin.Tests.csproj
│   │       └── CdrAnalyticsPluginTests.cs
│   │
│   └── solution/
│       ├── solution.cdsproj
│       └── src/
│           └── Other/
│               ├── Customizations.xml
│               ├── Relationships.xml
│               └── Solution.xml
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── docs/
│   └── dashboard-preview.png
│
├── Dockerfile
├── azure-pipelines.yml
├── vercel.json
├── vite.config.js
├── package.json
├── package-lock.json
└── README.md
```

Generated directories such as `node_modules`, `.NET bin/obj`, local Azure Storage emulator files, coverage output, and local configuration files are intentionally omitted from this structure.

## Run the Full-Stack Application Locally

### Prerequisites

Install:

- Git
- Node.js
- npm
- PostgreSQL or access to a Neon PostgreSQL database
- Visual Studio Code or another code editor

Azure and Power Platform development additionally uses:

- Azure Functions Core Tools
- .NET SDK
- Microsoft Azure
- Microsoft Power Platform

### 1. Clone the Repository

```bash
git clone https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK.git
cd CDR-ANALYTICS-DASHBOARD-FULLSTACK
```

### 2. Install Frontend Dependencies

From the repository root:

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure the Backend

Create your local environment configuration without committing it to Git.

The application supports environment variables including:

| Variable | Purpose |
| --- | --- |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing and verification secret |
| `DB_HOST` | Local PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `ADMIN_EMAIL` | Initial Admin email |
| `ADMIN_PASSWORD` | Initial Admin password |
| `ANALYST_EMAIL` | Analyst email |
| `ANALYST_PASSWORD` | Analyst password |

Never commit real environment values.

### 5. Prepare the Database

From the backend directory:

```bash
node create-table.js
```

For the Neon development database, the project includes an import utility:

```bash
node import-neon.js
```

Account creation utilities are also available:

```bash
node create-user.js
node create-analyst.js
```

### 6. Start the Backend

From `backend`:

```bash
node server.js
```

The local API runs at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

### 7. Start the Frontend

Open another terminal at the repository root:

```bash
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

## Run the Automated Tests

### Backend

```bash
cd backend
npm test
```

Coverage:

```bash
npm run test:coverage
```

### Azure Functions

From the repository root:

```bash
cd azure-functions
npm test
```

### C# Dataverse Plugin

From the repository root:

```bash
dotnet test power-platform/plugins/CdrAnalyticsPlugin.Tests/CdrAnalyticsPlugin.Tests.csproj --configuration Release
```

## Production Build

Build the React application from the repository root:

```bash
npm run build
```

The production frontend output is generated in:

```text
dist/
```

## Docker

The repository contains a Dockerfile for containerising the application as part of the CI/DevSecOps workflow.

Build the image:

```bash
docker build -t cdr-analytics-dashboard .
```

The CI pipeline additionally scans the resulting image with Trivy for HIGH and CRITICAL vulnerabilities.

## Deployment

### Vercel

Vercel provides the web application's preview and production deployments.

The repository includes:

```text
api/index.js
vercel.json
```

Production frontend requests use relative `/api` routes so the deployed frontend can communicate with the Express API through the same application origin.

The production branch is:

```text
main
```

Feature branches can receive Vercel preview deployments before they are merged.

### Azure DevOps

Azure DevOps provides continuous integration and DevSecOps validation.

It is responsible for validating:

- Frontend dependency installation and build
- Backend dependencies
- Backend tests and coverage
- Azure Functions dependencies
- Azure Functions automated tests
- Dependency vulnerability scanning
- Semgrep SAST
- Docker image build
- Trivy vulnerability scanning
- C# Dataverse plugin restore
- C# plugin compilation
- C# plugin automated tests

This architecture intentionally separates CI/security validation from Vercel hosting.

## Engineering Outcomes

This project demonstrates practical experience across the complete software delivery lifecycle:

- Designing and developing a full-stack analytics application
- Building React interfaces for data visualisation
- Developing REST APIs with Node.js and Express
- Working with PostgreSQL and cloud-hosted relational databases
- Implementing JWT authentication
- Enforcing role-based access control
- Writing automated API tests
- Applying code-coverage quality gates
- Developing and testing Azure Functions
- Implementing asynchronous messaging with Azure Service Bus
- Implementing application telemetry with Application Insights
- Building a Power Apps Canvas App
- Integrating Power Apps with Power Automate
- Managing Power Platform solution source in Git
- Developing a C# Dataverse plugin foundation
- Unit testing C# plugin code with xUnit and Moq
- Designing multi-platform Azure DevOps pipelines
- Building Docker container images
- Integrating dependency and static security scanning
- Scanning containers for HIGH/CRITICAL vulnerabilities
- Working with feature branches and pull requests
- Deploying preview and production builds through Vercel
- Managing secrets through environment configuration

## Security and Secret Management

The repository must never contain production credentials.

Do not commit:

```text
.env
local.settings.json
database passwords
JWT secrets
Azure Service Bus connection strings
Application Insights connection strings
instrumentation keys
access tokens
```

Use environment variables, Azure application settings, Vercel environment variables, and secure CI/CD secret management for sensitive configuration.

## Future Enhancements

Potential future extensions include:

- Registering the C# plugin in a Dataverse environment
- Adding Dataverse-specific CDR business rules
- Expanding Power Platform ALM automation
- Adding infrastructure-as-code for Azure resources
- Expanding integration and end-to-end testing
- Publishing CI test and security reports as pipeline artifacts
- Adding additional observability dashboards and alerts

These are optional extensions rather than requirements for the current implementation.

## Repository

GitHub:

https://github.com/Sesay-samuel/CDR-ANALYTICS-DASHBOARD-FULLSTACK

## Author

**Samuel Sesay**

Software Engineering / Full-Stack / Cloud / DevOps portfolio project.