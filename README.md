# EduMerge CampusDesk — Student Support & Ticket Management System

> **Product Engineering Assessment — Assignment 4**
> A university-focused Student Support & Ticket Management platform with SLA tracking, escalation workflows, role-based views, ticket ageing analytics, and audit trails.

---

## 🎯 Overview

**EduMerge CampusDesk** is a university support and ticket management platform designed to streamline administrative support between students, staff, department heads, and management.

The system replaces fragmented support processes with a centralized workflow for creating, tracking, assigning, escalating, resolving, and monitoring student support requests.

The platform focuses on:

* Dynamic ticket categorization
* SLA-driven ticket management
* Automatic SLA pause/resume handling
* Ticket ageing analytics
* Multi-level escalation
* Student–staff communication
* Internal staff collaboration
* Role-based information visibility
* Resolution and CSAT workflows
* Audit logging and management reporting

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm 9+

### Installation

Clone the repository and install dependencies:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
npm install
```

### Run the development server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173/
```

### Build for production

```bash
npm run build
```

> **Windows compatibility:** The npm scripts use explicit Node/Vite execution to avoid command parsing issues when the project is located inside a directory containing spaces or special characters.

---

# 🌟 Multi-Persona Simulation

The application includes an interactive **Persona Switcher** that allows evaluators to test different workflows without requiring multiple accounts or separate login sessions.

| Persona              | Sample User       | Role                          | Example Workflows                                                          |
| -------------------- | ----------------- | ----------------------------- | -------------------------------------------------------------------------- |
| 🎓 Student           | Aarav Sharma      | B.Tech CSE Student            | Create tickets, track SLA, respond to document requests, rate resolutions  |
| 🧑‍💼 Staff Agent    | Priya Nair        | Senior Accounts & Fee Officer | Claim tickets, respond, update status, add internal notes, resolve tickets |
| 🏛️ Department HOD   | Prof. K. Sundaram | Head of Academic Affairs      | Review escalations, handle department-level approvals                      |
| 👔 Dean / Management | Dr. R. Ramanathan | Dean of Student Affairs       | Monitor SLA compliance, ageing, critical tickets, and export reports       |

---

# ⚡ Key Features

## 1. Dynamic Ticket Categorization

Different support categories collect different information based on the nature of the request.

### Fees & Financials

Captures information such as:

* Bank UTR reference
* Amount paid
* Semester
* Payment-related details

### Attendance & Medical Leave

Captures:

* Leave date range
* Hospitalization details
* Medical documentation
* Treating doctor information

### ID Cards & Access

Supports information such as:

* Lost ID / FIR details
* RFID or access-related failures
* Replacement requirements

### Documents & Certificates

Captures:

* Certificate/document type
* Intended purpose
* Delivery preference
* Supporting information

This approach allows the ticket creation workflow to dynamically adapt to the selected category.

---

# ⏱️ SLA Management Engine

The system provides priority-based SLA management.

| Priority      | First Response | Resolution |
| ------------- | -------------: | ---------: |
| P1 — Critical |        2 hours |   12 hours |
| P2 — High     |        4 hours |   24 hours |
| P3 — Medium   |        8 hours |   48 hours |
| P4 — Low      |       24 hours |   72 hours |

## Pending Student Action

One of the core features is the **Pending Student Action** SLA mechanism.

When a staff member requests additional information or documents:

```text
IN_PROGRESS
     ↓
PENDING_STUDENT
     ↓
SLA CLOCK PAUSED
     ↓
Student responds
     ↓
IN_PROGRESS
     ↓
SLA CLOCK RESUMED
```

The system calculates the exact duration for which the ticket remained pending and extends the resolution deadline by the same duration.

### Example

If:

```text
Original SLA deadline: 10:00 AM
Student-action pause: 5 hours
```

Then:

```text
New SLA deadline: 3:00 PM
```

The original ticket creation timestamp remains unchanged.

This separates **ticket age** from **active SLA processing time**.

---

# 🎨 SLA Status Indicators

The interface provides visual indicators for SLA health:

| Status    | Meaning      |
| --------- | ------------ |
| 🟢 Green  | On track     |
| 🟡 Amber  | At risk      |
| 🔴 Red    | SLA breached |
| 🟣 Purple | SLA paused   |

For breached tickets, the interface displays the corresponding overdue duration.

---

# 📊 Ticket Ageing Analytics

Active tickets are grouped into four operational ageing buckets:

```text
< 24 Hours
1 – 3 Days
4 – 7 Days
> 7 Days
```

This provides management users with a quick overview of ticket backlog and ageing distribution.

---

# 🚨 Multi-Level Escalation

CampusDesk supports a three-tier escalation workflow.

```text
Tier 1
Helpdesk / Staff Agent
        ↓
Tier 2
Department HOD
        ↓
Tier 3
Dean / Management
```

Escalation can be triggered through configured SLA thresholds or manually by authorized staff.

---

# 💬 Communication System

The platform supports two types of communication.

### Public Messages

Visible to both students and staff.

Used for:

* Clarifications
* Status updates
* Document requests
* Resolution communication

### Internal Staff Notes

Visible only to authorized staff users.

Used for:

* Internal coordination
* Escalation discussions
* Department-level notes
* Operational instructions

Internal messages are explicitly filtered from the Student view.

---

# 📝 Canned Responses

Staff can use predefined policy responses for frequently occurring requests.

Examples include:

* Bank payment / UTR verification
* Medical leave requirements
* Certificate processing
* ID card replacement
* Facilities-related procedures

This helps maintain consistency in staff communication.

---

# 🕒 Audit Trail

Important ticket actions are recorded in the activity timeline, including:

* Ticket creation
* Assignment
* Reassignment
* Status changes
* SLA pause
* SLA resume
* Escalation
* Staff comments
* Internal notes
* Resolution
* Reopen events

Each event records relevant actor and timestamp information.

---

# ✅ Resolution & CSAT

The resolution workflow supports:

1. Staff resolution summary
2. Resolution document simulation
3. Student review
4. 5-star CSAT rating
5. 48-hour reopen window

Students can reopen a recently resolved ticket if the provided resolution does not completely address the issue.

---

# 🏗️ Architecture

The application follows a modular React + TypeScript architecture.

```text
src/
│
├── components/
│   ├── Common/
│   │   ├── StatusBadge
│   │   ├── PriorityBadge
│   │   ├── SLABadge
│   │   └── ToastContainer
│   │
│   ├── StudentPortal/
│   │   ├── StudentDashboard
│   │   ├── CreateTicketModal
│   │   └── CSATModal
│   │
│   ├── StaffWorkspace/
│   │   ├── StaffDashboard
│   │   ├── TicketCard
│   │   ├── TicketDetailDrawer
│   │   └── CannedResponsePicker
│   │
│   ├── ManagementDashboard/
│   │   ├── DeanDashboard
│   │   └── ExportModal
│   │
│   └── Navbar.tsx
│
├── context/
│   └── TicketContext.tsx
│
├── data/
│   └── seedData.ts
│
├── styles/
│   └── index.css
│
├── types/
│   └── index.ts
│
├── utils/
│   └── slaCalculator.ts
│
├── App.tsx
└── main.tsx
```

---

# 🧩 Core Modules

### `TicketContext.tsx`

Central application state and ticket operations.

Handles:

* Ticket creation
* Status transitions
* Assignment
* Messages
* Internal notes
* SLA pause/resume
* Local storage synchronization
* Audit events

### `slaCalculator.ts`

Contains the SLA calculation logic, including:

* First-response deadlines
* Resolution deadlines
* Remaining time
* Breach detection
* Pause duration
* Ageing classification
* Resolved-ticket SLA evaluation

### `seedData.ts`

Provides realistic demonstration data including:

* Tickets
* Users
* Categories
* Staff profiles
* Canned responses
* Activity logs

---

# 🔐 Role-Based Information Isolation

The application separates information according to the active persona.

For example:

```text
Student
  ├── Public ticket messages
  ├── Ticket status
  ├── SLA information
  └── Resolution details

Staff
  ├── Public messages
  ├── Internal notes
  ├── Assignment information
  └── Operational controls
```

Internal staff notes are not rendered in the Student interface.

---

# 🧪 Validation & Edge Cases

The implementation considers several operational edge cases:

* SLA pause while waiting for student information
* Student response after SLA pause
* Multiple pause/resume cycles
* Resolved tickets continuing to display incorrect SLA status
* Role-based visibility of internal messages
* Ticket reassignment
* Manual escalation
* SLA breach handling
* Ticket reopening
* Local storage persistence
* Invalid status transitions

Additional details are documented in:

* `APPROACH_AND_ARCHITECTURE.md`
* `EDGE_CASES_AND_VALIDATION.md`

---

# 🤖 AI-Assisted Development

AI tools were used during development as an engineering assistance tool for:

* Domain modeling
* State-machine design
* Initial component structures
* TypeScript interfaces
* Seed data generation
* UI styling
* SLA implementation ideas
* Debugging assistance

The generated implementation was reviewed, tested, modified, and debugged during development.

Particularly important engineering corrections included:

### SLA Terminal-State Evaluation

The initial SLA implementation continued evaluating resolved tickets against the current time.

This caused previously resolved tickets to incorrectly appear overdue.

The implementation was corrected to evaluate:

```text
resolvedAt <= resolutionDueAt
```

for resolved and closed tickets.

### Windows Command Execution

The development environment contained a project directory with spaces and an ampersand character.

This caused Windows command parsing issues with the initial npm scripts.

The scripts were modified to invoke Vite explicitly through Node.

---

# 📚 Documentation

Additional project documentation:

* **`APPROACH_AND_ARCHITECTURE.md`**
  Architecture, domain model, state machine, design decisions, and trade-offs.

* **`EDGE_CASES_AND_VALIDATION.md`**
  Edge cases, validation scenarios, security considerations, and failure handling.

* **`AI_USAGE_REPORT.md`**
  Detailed documentation of AI-assisted development and prompts used during implementation.

---

# 🛠️ Technology Stack

| Technology   | Purpose                              |
| ------------ | ------------------------------------ |
| React        | Frontend UI                          |
| TypeScript   | Type-safe application development    |
| Vite         | Development server and build tooling |
| CSS          | Responsive UI and visual design      |
| LocalStorage | Client-side persistence              |
| Node.js      | Development/runtime tooling          |

---

# 📌 Project Highlights

* Multi-persona university support simulation
* Dynamic category-specific ticket forms
* Priority-based SLA engine
* Mathematical SLA pause/resume mechanism
* Ticket ageing analytics
* Multi-level escalation
* Public/private communication channels
* Role-based information isolation
* Immutable activity timeline
* CSAT and ticket reopening workflow
* CSV/JSON management export
* Responsive enterprise dashboard UI

---

## 👨‍💻 Assignment

**Assignment:** Student Support & Ticket Management
**Track:** Pre-Drive Product Engineering Assessment
**Project:** EduMerge CampusDesk

Built as a product-engineering assessment demonstrating frontend architecture, state management, workflow design, SLA logic, debugging, role-based UI behavior, and product-oriented problem solving.
