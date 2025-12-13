# 🚀 UPH: Unified Project Hub

**UPH** (Unified Project Hub) is a comprehensive ERP/PMS solution designed to bridge the gap between technical design and project management. It integrates directly with **Weave** (Schematic Design) and **ENV-I** (Inventory) to provide a single source of truth for engineering projects.

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-purple)
![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Recharts%20%7C%20Gantt--Task-black)

## ✨ Key Features

- **📊 Project Management**:
  - **Dashboard**: High-level overview of active projects, budget burn-rate, and tasks.
  - **Gantt Timeline**: Interactive timeline view powered by `gantt-task-react` for scheduling and dependency tracking.
  - **Kanban Board**: Drag-and-drop task management for agile workflows.
- **💰 Financial Intelligence**:
  - **Real-time Costing**: Automatically calculates project costs based on BOM (Bill of Materials) and inventory assignments.
  - **Financial Dashboard**: Pie charts for cost breakdown (Material vs Labor) and Bar charts for Budget vs Actuals using `recharts`.
  - **Profitability Analysis**: Tracks Contract Value, Margins, and Net Profit.
- **🔌 Engineering Integration**:
  - **BOM Automation**: Import BOMs directly from Weave designs and auto-deduct from stock.
  - **Design Viewer**: Preview Weave schematics, PCB designs, and 3D models directly within the project context.
- **GitHub Integration**: Link commits and PRs to project tasks.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14/15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Visualization**:
  - `recharts`: Financial Charts
  - `gantt-task-react`: Project Timeline
- **Backend**: [Firebase](https://firebase.google.com/) (Firestore)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **pnpm**

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd UPH-main
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file with your Firebase configuration.

4.  **Run the development server:**

    ```bash
    pnpm dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
UPH-main/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (dashboard)/     # Main app layout routes
│   │   │   ├── dashboard/   # Executive summary
│   │   │   ├── projects/    # Project list & details
│   │   │   └── settings/    # System settings
│   ├── components/          # UI Components
│   │   ├── projects/        # Project-specific (Gantt, Financials, Kanban)
│   │   ├── weave-viewer/    # Design file renderers
│   │   └── ui/              # Base components
│   ├── stores/              # Zustand Stores (project-store, inventory-store)
│   ├── services/            # Business Logic (BOM Service, Github Service)
│   └── types/               # TypeScript Definitions
└── ...
```

## 🧩 Modules Detail

### Timeline (Gantt)

Located in the **Timeline** tab of a project. It visualizes task sequences. Tasks without specific dates default safely relative to the project start date.

### Financials

Located in the **Financials** tab. It aggregates:

- **Material Cost**: Sum of price \* quantity of all linked inventory items.
- **Labor/Overhead**: Calculated as (Total Spent - Material Cost).
- **Projections**: Estimates profit based on a configurable margin (default 25%).

## 📄 License

This project is licensed under the MIT License.
