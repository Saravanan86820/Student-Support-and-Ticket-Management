# Edge Cases & Validation Matrix: EduMerge CampusDesk

> **Document Version:** 1.0.0  
> **Author:** Candidate Assessment Submission — Pre-Drive Product Engineering  
> **Problem Statement:** Assignment 4 — Student Support & Ticket Management

---

## 1. Edge Cases & Defensive Engineering Decisions

### 1.1 The "SLA Clock Freeze" Edge Case (Pending Student Action)
* **The Problem:** Staff officers frequently request missing documentation (e.g. doctor's prescription seal or bank counterfoil). If the student takes 4 days to respond, traditional ticketing systems breach the staff SLA.
* **Our Solution:** 
  1. Setting status to `PENDING_STUDENT` locks the current elapsed time and records `slaPausedAt = now()`.
  2. While in this state, the ticket is classified as `PAUSED` in analytics; it is excluded from staff breach calculations.
  3. When the student submits a response or attaches a file, our state engine detects `currentUser.role === 'STUDENT'` and **automatically shifts status to `IN_PROGRESS`**, calculating the exact paused minutes and pushing `resolutionDueAt` forward by that duration.

### 1.2 The "Repeat Escalation Loop" Edge Case
* **The Problem:** A ticket is escalated to HOD (Level 2), who might push it back to the staff officer, who then escalates it again, causing an infinite bounce.
* **Our Solution:**
  1. Escalation levels are strictly hierarchical (`NONE` $\rightarrow$ `LEVEL_1_STAFF` $\rightarrow$ `LEVEL_2_HOD` $\rightarrow$ `LEVEL_3_DEAN`).
  2. De-escalation preserves the escalation history in the immutable audit trail (`activityLogs`).
  3. Re-escalation to the same tier requires a mandatory reason override, and tickets with `escalationLevel === 'LEVEL_3_DEAN'` cannot be escalated further; they must be resolved or closed by executive order.

### 1.3 The "Resolution Dispute & Zombie Ticket" Edge Case
* **The Problem:** Staff marks a ticket as "Resolved", but the student's problem wasn't actually solved. Alternatively, a resolved ticket sits indefinitely waiting for student confirmation.
* **Our Solution:**
  1. **Reopen Window:** Students have a 48-hour window from `resolvedAt` to dispute the resolution via the "Reopen Request" button with a mandatory reason.
  2. **Reopen Metrics:** Each reopen increments `reopenCount`. Tickets with `reopenCount >= 2` are automatically flagged with high risk on the Dean's dashboard to prevent staff from prematurely closing tickets to game their metrics.
  3. **Auto-Closure Inactivity:** After 48 hours without dispute, the system allows the ticket to be permanently closed.

### 1.4 Dynamic Priority Adjustment & Due Date Recalculation
* **The Problem:** A student files a bonafide certificate request with `LOW` priority (72h SLA), but later informs staff that their visa interview was moved to tomorrow morning.
* **Our Solution:**
  1. Staff can update priority to `CRITICAL` directly from the operational drawer.
  2. The system recalculates `resolutionDueAt = createdAt + 12 hours` dynamically.
  3. If the recalculated due date is in the past, the system immediately trips the SLA warning/breach watchdog and prompts for emergency escalation.

### 1.5 Information Leakage & Role Isolation (Security)
* **The Problem:** Staff write internal notes regarding suspected fake medical certificates or student disciplinary warnings; if rendered in the client bundle without filtering, students could inspect them via DOM tools.
* **Our Solution:**
  1. Internal messages are tagged with `isInternal: true`.
  2. In `TicketDetailDrawer.tsx`, the message rendering pipeline filters out internal notes when `currentUser.role === 'STUDENT'`:
     ```typescript
     const visibleMessages = selectedTicket.messages.filter(msg => {
       if (isStudent && msg.isInternal) return false;
       return true;
     });
     ```
  3. The checkbox to create internal notes is completely stripped from the Student Portal view.

---

## 2. Input Validation & Form Constraints

| Field / Action | Validation Rule | Error Prevention Behavior |
| :--- | :--- | :--- |
| **Ticket Title** | Min 5 chars, Max 120 chars | Prevents empty or meaningless submissions. |
| **Description** | Min 15 chars | Ensures sufficient context for staff triage. |
| **Bank UTR** | Alphanumeric (Min 8 chars) | Prevents dummy single-digit inputs during fee disputes. |
| **Medical Dates** | Start Date $\le$ End Date | Prevents chronological paradoxes in leave condonation. |
| **File Attachments** | PDF, PNG, JPG (Max 10MB) | Enforces acceptable document formats. |
| **Escalation Reason** | Mandatory textarea | Disallows silent or unrecorded staff escalations. |
| **Resolution Summary**| Mandatory textarea | Staff must record resolution actions before marking resolved. |

---

## 3. Resilience & Failure Recovery

1. **LocalStorage Corruption Fallback:**
   If `localStorage` data becomes corrupted or unparseable, the app gracefully traps the JSON parse error, logs the incident, and re-initializes from `generateSeedTickets()` without crashing the browser.
2. **One-Click Demo Reset:**
   A "Reset Demo Data" button is located on the top navigation bar, allowing interviewers to instantly clear test mutations and restore clean sample tickets.
3. **Reactive Interval Watchdog:**
   A background timer runs every 30 seconds to evaluate open tickets against `resolutionDueAt`, appending automated `SLA_BREACHED` audit events even when the user is idle.
