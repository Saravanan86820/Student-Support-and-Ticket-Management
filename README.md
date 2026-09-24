# EduMerge CampusDesk — Student Support & Ticket Management System

> **Recruitment Drive Candidate Assessment Submission**  
> **Assignment 4: Student Support & Ticket Management**  
> **Candidate Track:** Pre-Drive Product Engineering  
> **Submission Deadline:** 9:00 AM, 25 September 2026  
> **Submission Email:** `tech_interview@edumerge.com`

---

## 🎯 Executive Overview

**EduMerge CampusDesk** is an enterprise-grade Student Support & Ticket Management platform engineered specifically for modern higher-education universities. Students face frequent administrative bottlenecks across tuition fee reconciliation, medical leave condonation, lost biometric ID cards, and degree/transcript verification. 

CampusDesk replaces disjointed physical counter visits, lost paper slips, and opaque delays with a **real-time, SLA-governed support ecosystem** featuring dynamic departmental routing, multi-tiered escalation matrices, automated SLA pause mechanics, ageing analytics, and executive oversight.

---

## 🚀 Quick Start (Running the Working Prototype)

The application is completely self-contained with pre-seeded realistic university tickets, staff personas, and activity logs.

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Launch
```bash
# 1. Clone or navigate to the project directory
cd "c:\Users\ADMIN\Desktop\Student Support & Ticket Management 1"

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server
npm run dev

# 4. Open browser at:
http://localhost:5173/
```

> **Note on Windows Environments:** If running on Windows paths containing spaces or ampersands (`&`), our `package.json` scripts are pre-configured to execute via explicit node wrappers (`node ./node_modules/vite/bin/vite.js`) to guarantee 100% reliable execution.

---

## 🌟 Interactive Multi-Persona Simulation Switcher

To allow evaluators to immediately test every workflow without logging in and out, the application includes a **top sticky Persona Switcher**:

| Persona | Name | Role & Scope | Key Workflows to Test |
| :--- | :--- | :--- | :--- |
| 🎓 **Student** | Aarav Sharma (`22BCS1048`) | B.Tech CSE (3rd Year) | Raise ticket with custom fields, track live SLA clock, respond to pending documents, rate CSAT (with confetti). |
| 🧑‍💼 **Staff Agent** | Priya Nair | Senior Accounts & Fee Officer | Claim tickets, update status, insert canned policy replies, add internal staff notes, mark resolved with attachments. |
| 🏛️ **Dept HOD** | Prof. K. Sundaram | Head of Academic Affairs | Handle Level 2 escalations, review medical condonation slips, approve attendance adjustments. |
| 👔 **Dean / Management** | Dr. R. Ramanathan | Dean of Student Affairs | Monitor institution-wide SLA compliance %, inspect Ageing Distribution heatmap, intervene in critical breaches, export CSV/JSON audit logs. |

---

## ⚡ Key System Features

### 1. Dynamic Category-Specific Ticket Ingestion
- **Fees & Financials:** Prompts for Bank UTR reference, amount paid, and semester for instant bank treasury matching.
- **Attendance & Leave:** Captures hospitalization/leave date range and treating doctor registration numbers.
- **ID Cards & Access:** Captures police lost property FIR numbers or RFID turnstile failure logs.
- **Documents & Certificates:** Captures intended purpose (e.g. Visa, Bank Loan, WES) and delivery preferences.

### 2. Live SLA Engine & Paused Clock Mechanics
- Priority-driven resolution windows:
  - **P1 Critical:** 2h First Response / 12h Resolution
  - **P2 High:** 4h First Response / 24h Resolution
  - **P3 Medium:** 8h First Response / 48h Resolution
  - **P4 Low:** 24h First Response / 72h Resolution
- **"Pending Student Action" Clock Pause:** When staff request additional documents, the SLA timer automatically pauses (`isSlaPaused = true`). When the student responds, the SLA deadline automatically extends by the exact paused duration. Staff are never penalized for student latency!
- **Color-Coded Dynamic Badges:** 
  - 🟢 Green: On-track
  - 🟡 Amber: At risk (< 25% or < 4h remaining)
  - 🔴 Red: SLA Breached (displays exact overdue time)
  - 🟣 Purple: Paused

### 3. Ticket Ageing Distribution Engine
Classifies active tickets into operational risk buckets:
- `< 24 Hours` (Fresh incoming requests)
- `1 – 3 Days` (Active processing)
- `4 – 7 Days` (Lagging attention)
- `> 7 Days` (Critical Stale / Bottleneck requiring Dean review)

### 4. Multi-Tier Escalation Matrix
- **Tier 1:** Helpdesk Operations Officer
- **Tier 2:** Department Head (HOD) — automated at 80% SLA elapsed or manual staff escalation
- **Tier 3:** Dean of Student Affairs / Registrar — automated on Critical SLA breach

### 5. Dual-Channel Communication & Audit Trail
- **Public Messages:** Two-way student-staff communication.
- **Internal Staff Notes:** Lock-badged yellow sticky notes hidden from students for inter-departmental collaboration.
- **Canned Responses:** One-click pre-approved university policy templates (e.g., UTR bank clearing, medical condonation bylaws).
- **Immutable Timeline:** Every reassignment, status transition, SLA pause, and comment is logged with actor role and timestamp.

### 6. Closed-Loop Resolution & CSAT Rating
- Resolution summary and downloadable digitally signed document simulation.
- 5-Star interactive CSAT rating dialog with celebratory confetti upon high ratings.
- 48-hour student reopen window if the resolution does not solve their issue.

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Common/              # StatusBadge, PriorityBadge, SLABadge, ToastContainer
│   │   ├── StudentPortal/       # StudentDashboard, CreateTicketModal, CSATModal
│   │   ├── StaffWorkspace/      # StaffDashboard, TicketCard, TicketDetailDrawer, CannedResponsePicker
│   │   ├── ManagementDashboard/ # DeanDashboard, ExportModal
│   │   └── Navbar.tsx           # Interactive role switcher and branding
│   ├── context/
│   │   └── TicketContext.tsx    # State store, localStorage sync, SLA timers & action handlers
│   ├── data/
│   │   └── seedData.ts          # Realistic university sample tickets, categories, canned templates
│   ├── styles/
│   │   └── index.css            # Enterprise CSS tokens, glassmorphism, animations, responsive grid
│   ├── types/
│   │   └── index.ts             # Complete TypeScript schemas for tickets, users, SLAs, and logs
│   ├── utils/
│   │   └── slaCalculator.ts     # SLA math, countdown formatters, ageing logic
│   ├── App.tsx                  # Root component with role routing
│   └── main.tsx                 # React entry point
├── APPROACH_AND_ARCHITECTURE.md # Detailed system design, data model, trade-offs
├── EDGE_CASES_AND_VALIDATION.md # Edge case handling, concurrency, failure modes
├── AI_USAGE_REPORT.md # Completed AI usage assessment report
└── package.json
```

---

## 📄 Accompanying Documentation
1. [APPROACH_AND_ARCHITECTURE.md](file:///c:/Users/ADMIN/Desktop/Student%20Support%20&%20Ticket%20Management%201/APPROACH_AND_ARCHITECTURE.md)
2. [EDGE_CASES_AND_VALIDATION.md](file:///c:/Users/ADMIN/Desktop/Student%20Support%20&%20Ticket%20Management%201/EDGE_CASES_AND_VALIDATION.md)
3. [AI_USAGE_REPORT.md](file:///c:/Users/ADMIN/Desktop/Student%20Support%20&%20Ticket%20Management%201/AI_USAGE_REPORT.md)
