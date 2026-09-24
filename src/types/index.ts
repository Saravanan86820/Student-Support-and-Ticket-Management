export type Role = 'STUDENT' | 'STAFF' | 'HOD' | 'DEAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  studentId?: string; // e.g. 22BCS1048
  course?: string; // e.g. B.Tech Computer Science & Eng.
  semester?: string; // e.g. Semester 5
  avatar: string;
}

export type TicketCategory = 
  | 'FEES_FINANCE'
  | 'ATTENDANCE_LEAVE'
  | 'ID_CARD_ACCESS'
  | 'DOCUMENTS_CERTIFICATES'
  | 'ADMIN_FACILITIES';

export interface CategoryConfig {
  id: TicketCategory;
  name: string;
  departmentId: string;
  departmentName: string;
  subcategories: string[];
  icon: string;
  description: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PriorityConfig {
  level: TicketPriority;
  label: string;
  color: string;
  firstResponseHours: number;
  resolutionHours: number;
  description: string;
}

export type TicketStatus = 
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_STUDENT'
  | 'PENDING_INTERNAL_REVIEW'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type EscalationLevel = 'NONE' | 'LEVEL_1_STAFF' | 'LEVEL_2_HOD' | 'LEVEL_3_DEAN';

export interface CustomFieldValues {
  transactionUtr?: string;
  feeAmount?: string;
  academicSemester?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  medicalDoctorName?: string;
  certificateType?: string;
  purpose?: string;
  hostelBlockRoom?: string;
  lostIdFirNumber?: string;
  [key: string]: string | undefined;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: 
    | 'CREATED'
    | 'STATUS_CHANGED'
    | 'PRIORITY_CHANGED'
    | 'ASSIGNED'
    | 'REASSIGNED'
    | 'ESCALATED'
    | 'STUDENT_COMMENT'
    | 'STAFF_REPLY'
    | 'INTERNAL_NOTE'
    | 'SLA_PAUSED'
    | 'SLA_RESUMED'
    | 'SLA_BREACHED'
    | 'RESOLVED'
    | 'REOPENED'
    | 'CLOSED'
    | 'CSAT_SUBMITTED';
  details: string;
  meta?: Record<string, any>;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  timestamp: string;
  isInternal: boolean; // True for internal staff notes
  attachments?: Attachment[];
}

export interface CSATRating {
  rating: number; // 1 to 5
  feedback?: string;
  submittedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. TKT-2026-1042
  title: string;
  description: string;
  category: TicketCategory;
  subcategory: string;
  departmentId: string;
  departmentName: string;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Student Information
  studentId: string;
  studentName: string;
  studentEnrollment: string;
  studentEmail: string;
  studentCourse: string;
  
  // Staff Ownership
  assigneeId?: string;
  assigneeName?: string;
  assigneeRole?: Role;
  
  // Custom metadata fields
  customFields?: CustomFieldValues;
  attachments?: Attachment[];

  // SLA Timelines & Engine
  createdAt: string;
  updatedAt: string;
  firstResponseDueAt: string;
  firstRespondedAt?: string;
  resolutionDueAt: string;
  resolvedAt?: string;
  closedAt?: string;
  
  // SLA Pause State (When PENDING_STUDENT)
  isSlaPaused: boolean;
  slaPausedAt?: string;
  totalPausedMinutes: number;

  // Escalation Info
  escalationLevel: EscalationLevel;
  escalatedAt?: string;
  escalatedTo?: string;
  escalationReason?: string;

  // Resolution Tracking
  resolutionSummary?: string;
  resolutionAttachment?: Attachment;
  reopenReason?: string;
  reopenCount: number;

  // Feedback
  csat?: CSATRating;

  // Messages & Activity History
  messages: TicketMessage[];
  activityLogs: ActivityLog[];
}

export type AgeingBucket = 'UNDER_24_HOURS' | 'ONE_TO_THREE_DAYS' | 'FOUR_TO_SEVEN_DAYS' | 'OVER_SEVEN_DAYS';

export interface CannedResponse {
  id: string;
  title: string;
  category: TicketCategory;
  body: string;
  shortcut: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  status: string;
  priority: string;
  departmentId: string;
  assignee: 'ALL' | 'MY_TICKETS' | 'UNASSIGNED';
  slaState: 'ALL' | 'HEALTHY' | 'WARNING' | 'BREACHED';
  ageingBucket: 'ALL' | AgeingBucket;
  sortBy: 'CREATED_DESC' | 'CREATED_ASC' | 'SLA_URGENT' | 'PRIORITY_DESC';
}
