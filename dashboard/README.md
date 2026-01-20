# UIDAI Analytics & Intelligence Hub

A next-generation dashboard for Aadhaar data analysis, powered by predictive analytics and AI-driven insights. This platform helps identifying operational bottlenecks, detecting demographic anomalies, and optimizing resource allocation across India.

## Features & Modules

### 1. Analytics Dashboard (`/dashboard`)
The central command center providing a comprehensive view of enrolment trends, update requests, and system health.

### 2. ASI Protocol (`/asi`)
**Aadhaar Stress Index**
- **Purpose**: Real-time predictive analytics to identify operational stress in specific pincodes.
- **Key Features**:
  - Calculates Adult vs. Child stress scores based on update ratios.
  - Classifies zones as Healthy, Moderate, or High Stress.
  - Radar visualization for system status.

### 3. SADRA Planner (`/sadra`)
**Seasonal Aadhaar Demand & Resource Allocator**
- **Purpose**: AI-driven logistics planner for anticipating seasonal demand surges.
- **Key Features**:
  - **Predictive Engine**: Forecasts demand based on recurring events (e.g., Board Exams, Harvest seasons).
  - **Tactical Map**: Recommends Mobile Camp deployments for 'Peak Demand' zones.
  - **Budget Saver**: Estimates cost savings from proactive resource reallocation.

### 4. Border Security (`/security`)
- **Purpose**: Anomaly detection for border districts.
- **Key Features**: Monitors risk ratios to identify potential illegal immigration patterns or unusual demographic shifts.

### 5. Scheme Rush (`/scheme-rush`)
- **Purpose**: Impact analysis of government schemes.
- **Key Features**: Correlates spikes in Aadhaar updates with the launch of new welfare schemes to measure impact and adoption.

### 6. Migration Tracker (`/migration`)
- **Purpose**: Urban planning and migration intelligence.
- **Key Features**: Tracks movement trends to assist in urban flow management and infrastructure planning.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure
- `src/app`: Application routes.
- `src/components`: Reusable UI components and module-specific logic.
- `src/lib`: Data processing utilities (ASI, SADRA logic).
- `src/data`: Processed JSON datasets.
