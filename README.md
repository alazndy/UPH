# UPH: Unified Project Hub

![Status](https://img.shields.io/badge/Status-Beta-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Tech](https://img.shields.io/badge/Tech-Next.js%2016%20%7C%20TypeScript%20%7C%20EVM-violet)

**UPH** (Unified Project Hub) is the central command center for project management within the **T-Ecosystem**. It surpasses traditional task management by integrating **Earned Value Management (EVM)**, proactive **Risk Intelligence**, and advanced scheduling into a single, cohesive platform. It is designed for complex engineering and operations projects where schedule and budget adherence is critical.

## 🚀 Capabilities & Features

### 📅 Advanced Scheduling & Gantt

- **Interactive Gantt Charts**: Drag-and-drop timeline management with critical path analysis.
- **Dependency Tracking**: Finish-to-Start relationships with visual connectors.
- **Milestones**: Highlight key project deliverables and deadlines.
- **Timeline Views**: Switch between Day, Week, and Month granularities.

### 📊 Financial & Performance Intelligence (EVM)

- **Real-time Metrics**: Automatically calculates **CPI** (Cost Performance Index) and **SPI** (Schedule Performance Index).
- **Forecasting**: Predicts **EAC** (Estimate at Completion) and **ETC** (Estimate to Complete) based on current performance.
- **Visual Status**: Instant "On Track", "At Risk", or "Critical" status indicators based on EVM thresholds.

### ⚠️ Proactive Risk Management (RAID)

- **RAID Logs**: comprehensive tracking of **R**isks, **A**ssumptions, **I**ssues, and **D**ependencies.
- **Risk Scoring**: Impact x Probability matrices to calculate severity.
- **Mitigation Plans**: Assign owners and contingency strategies for every identified risk.

### 📋 Agile & Task Management

- **Kanban Boards**: Drag-and-drop task movement through customizable workflows.
- **Team Capacity**: View resource allocation and prevent burnout.
- **Time Tracking**: Log hours against specific tasks for accurate actual cost calculations.

### 🏗️ Engineering Integration

- **BOM Management**: Create and track Bill of Materials for hardware projects.
- **Spec Management**: Store and version control engineering specifications.

## 🛠️ Technology Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - Leveraging the latest capabilities.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Visualization**:
  - **Recharts**: For EVM and burn-down charts.
  - **Custom SVG**: For the high-performance Gantt chart engine.
- **State**: Zustand + React Query (TanStack Query) for server state hydration.
- **Database**: Firebase Firestore.
- **Styling**: Tailwind CSS.

## 📂 Project Structure

```bash
src/app/[locale]/(dashboard)/
├── projects/        # Project portfolio & details
├── gantt/           # Timeline & scheduling engine
├── analytics/       # EVM, CPI/SPI dashboards
├── kanban/          # Agile task boards
├── risk/            # RAID log & risk matrix (in dev)
├── bom/             # Bill of Materials
├── teams/           # Resource management
└── engineering/     # Engineering documents

src/types/evm.ts     # Earned Value Management formulas
src/types/risk.ts    # RAID data models
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/alazndy/UPH.git
    cd UPH
    ```

2.  **Install Dependencies**

    ```bash
    pnpm install
    ```

3.  **Run Development Server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3001](http://localhost:3001) to view the application.

---

Part of the **T-Ecosystem**.
