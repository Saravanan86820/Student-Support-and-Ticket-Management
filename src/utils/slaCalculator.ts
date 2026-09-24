import { Ticket, TicketPriority, AgeingBucket } from '../types';

export const PRIORITY_CONFIG: Record<TicketPriority, { firstResponseHours: number; resolutionHours: number; label: string; color: string }> = {
  CRITICAL: {
    firstResponseHours: 2,
    resolutionHours: 12,
    label: 'P1 - Critical',
    color: '#EF4444',
  },
  HIGH: {
    firstResponseHours: 4,
    resolutionHours: 24,
    label: 'P2 - High',
    color: '#F97316',
  },
  MEDIUM: {
    firstResponseHours: 8,
    resolutionHours: 48,
    label: 'P3 - Medium',
    color: '#3B82F6',
  },
  LOW: {
    firstResponseHours: 24,
    resolutionHours: 72,
    label: 'P4 - Low',
    color: '#10B981',
  },
};

export interface SLAStatusResult {
  state: 'HEALTHY' | 'WARNING' | 'BREACHED' | 'PAUSED' | 'RESOLVED_MET' | 'RESOLVED_BREACHED';
  label: string;
  timeRemainingMs: number;
  displayText: string;
  percentRemaining: number;
  isBreached: boolean;
}

export function computeSLAStatus(ticket: Ticket, now = new Date()): SLAStatusResult {
  // If ticket is resolved or closed
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : now.getTime();
    const dueTime = new Date(ticket.resolutionDueAt).getTime();
    const wasMet = resolvedTime <= dueTime;

    return {
      state: wasMet ? 'RESOLVED_MET' : 'RESOLVED_BREACHED',
      label: wasMet ? 'Resolved within SLA' : 'Resolved after Breach',
      timeRemainingMs: 0,
      displayText: wasMet ? 'Met SLA' : 'Breached SLA',
      percentRemaining: wasMet ? 100 : 0,
      isBreached: !wasMet,
    };
  }

  // If SLA is currently paused (Pending Student Action)
  if (ticket.isSlaPaused && ticket.status === 'PENDING_STUDENT') {
    return {
      state: 'PAUSED',
      label: 'SLA Paused (Awaiting Student)',
      timeRemainingMs: Math.max(0, new Date(ticket.resolutionDueAt).getTime() - (ticket.slaPausedAt ? new Date(ticket.slaPausedAt).getTime() : now.getTime())),
      displayText: 'Clock Paused',
      percentRemaining: 50,
      isBreached: false,
    };
  }

  const createdTime = new Date(ticket.createdAt).getTime();
  const dueTime = new Date(ticket.resolutionDueAt).getTime();
  const currentTime = now.getTime();
  const totalWindowMs = dueTime - createdTime;
  const remainingMs = dueTime - currentTime;

  if (remainingMs <= 0) {
    const overdueMs = Math.abs(remainingMs);
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueMins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      state: 'BREACHED',
      label: 'SLA Breached',
      timeRemainingMs: remainingMs,
      displayText: `Overdue by ${overdueHours}h ${overdueMins}m`,
      percentRemaining: 0,
      isBreached: true,
    };
  }

  const percentRemaining = Math.min(100, Math.max(0, (remainingMs / totalWindowMs) * 100));
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // Warning when less than 25% or under 4 hours remaining
  if (percentRemaining < 25 || remainingHours < 4) {
    return {
      state: 'WARNING',
      label: 'At Risk (Near Breach)',
      timeRemainingMs: remainingMs,
      displayText: `${remainingHours}h ${remainingMins}m left`,
      percentRemaining,
      isBreached: false,
    };
  }

  return {
    state: 'HEALTHY',
    label: 'Within SLA',
    timeRemainingMs: remainingMs,
    displayText: `${remainingHours}h ${remainingMins}m left`,
    percentRemaining,
    isBreached: false,
  };
}

export function computeAgeing(createdAt: string, now = new Date()): {
  totalHours: number;
  totalDays: number;
  displayText: string;
  bucket: AgeingBucket;
  bucketLabel: string;
  badgeClass: string;
} {
  const created = new Date(createdAt).getTime();
  const diffMs = Math.max(0, now.getTime() - created);
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let displayText = '';
  if (totalDays === 0) {
    displayText = `${totalHours}h ago`;
  } else {
    displayText = `${totalDays}d ${remainingHours}h ago`;
  }

  if (totalHours < 24) {
    return {
      totalHours,
      totalDays,
      displayText,
      bucket: 'UNDER_24_HOURS',
      bucketLabel: '< 24 Hours (Fresh)',
      badgeClass: 'ageing-fresh',
    };
  } else if (totalDays <= 3) {
    return {
      totalHours,
      totalDays,
      displayText,
      bucket: 'ONE_TO_THREE_DAYS',
      bucketLabel: '1 – 3 Days (Active)',
      badgeClass: 'ageing-active',
    };
  } else if (totalDays <= 7) {
    return {
      totalHours,
      totalDays,
      displayText,
      bucket: 'FOUR_TO_SEVEN_DAYS',
      bucketLabel: '4 – 7 Days (Lagging)',
      badgeClass: 'ageing-lagging',
    };
  } else {
    return {
      totalHours,
      totalDays,
      displayText,
      bucket: 'OVER_SEVEN_DAYS',
      bucketLabel: '> 7 Days (Critical Stale)',
      badgeClass: 'ageing-stale',
    };
  }
}

export function calculateDueDates(createdAt: Date, priority: TicketPriority) {
  const config = PRIORITY_CONFIG[priority];
  const firstResponseDueAt = new Date(createdAt.getTime() + config.firstResponseHours * 60 * 60 * 1000);
  const resolutionDueAt = new Date(createdAt.getTime() + config.resolutionHours * 60 * 60 * 1000);

  return {
    firstResponseDueAt: firstResponseDueAt.toISOString(),
    resolutionDueAt: resolutionDueAt.toISOString(),
  };
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatShortDate(isoString?: string): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}
