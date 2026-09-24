import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Ticket, 
  User, 
  Role, 
  TicketStatus, 
  TicketPriority, 
  EscalationLevel, 
  FilterOptions, 
  Attachment,
  CSATRating
} from '../types';
import { DEMO_USERS, CATEGORIES, generateSeedTickets } from '../data/seedData';
import { calculateDueDates } from '../utils/slaCalculator';

const LOCAL_STORAGE_KEY = 'edumerge_tickets_v1';
const LOCAL_STORAGE_USER_KEY = 'edumerge_active_user_v1';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message?: string;
}

interface TicketContextType {
  tickets: Ticket[];
  currentUser: User;
  selectedTicket: Ticket | null;
  filters: FilterOptions;
  toasts: ToastMessage[];
  switchUser: (role: Role) => void;
  selectTicket: (ticketId: string | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  createTicket: (data: {
    title: string;
    description: string;
    category: any;
    subcategory: string;
    priority: TicketPriority;
    customFields?: Record<string, string>;
    attachments?: Attachment[];
  }) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;
  assignTicket: (ticketId: string, assignee: User) => void;
  escalateTicket: (ticketId: string, level: EscalationLevel, reason: string, targetAssignee?: User) => void;
  resolveTicket: (ticketId: string, resolutionSummary: string, attachment?: Attachment) => void;
  reopenTicket: (ticketId: string, reason: string) => void;
  closeTicket: (ticketId: string) => void;
  submitCSAT: (ticketId: string, rating: number, feedback?: string) => void;
  addMessage: (ticketId: string, content: string, isInternal: boolean, attachments?: Attachment[]) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority, reason?: string) => void;
  resetToDemoData: () => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const defaultFilters: FilterOptions = {
  searchQuery: '',
  category: 'ALL',
  status: 'ALL',
  priority: 'ALL',
  departmentId: 'ALL',
  assignee: 'ALL',
  slaState: 'ALL',
  ageingBucket: 'ALL',
  sortBy: 'SLA_URGENT',
};

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load tickets from localStorage or generate seed
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading tickets from storage', e);
    }
    return generateSeedTickets();
  });

  // Current active persona
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        const found = DEMO_USERS.find(u => u.role === savedUser);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return DEMO_USERS[0]; // Student Aarav Sharma by default
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist tickets whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed saving tickets to storage', e);
    }
  }, [tickets]);

  // Periodic SLA check: log breach if newly breached
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTickets(prev => {
        let changed = false;
        const updated = prev.map(t => {
          if (t.status === 'RESOLVED' || t.status === 'CLOSED' || t.isSlaPaused) {
            return t;
          }
          const due = new Date(t.resolutionDueAt).getTime();
          if (now.getTime() > due && t.status !== 'ESCALATED') {
            // Check if breach is already logged
            const hasBreachLog = t.activityLogs.some(l => l.action === 'SLA_BREACHED');
            if (!hasBreachLog) {
              changed = true;
              return {
                ...t,
                activityLogs: [
                  ...t.activityLogs,
                  {
                    id: `log-breach-${Date.now()}`,
                    timestamp: now.toISOString(),
                    actorId: 'SYSTEM',
                    actorName: 'CampusDesk SLA Watchdog',
                    actorRole: 'STAFF' as Role,
                    action: 'SLA_BREACHED' as const,
                    details: `Resolution SLA limit (${t.priority}) was exceeded.`,
                  },
                ],
              };
            }
          }
          return t;
        });
        return changed ? updated : prev;
      });
    }, 30000); // Check every 30s

    return () => clearInterval(timer);
  }, []);

  const showToast = (type: 'success' | 'warning' | 'info' | 'error', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchUser = (role: Role) => {
    const targetUser = DEMO_USERS.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, role);
      showToast('info', `Switched Persona to ${targetUser.name}`, `Now viewing workspace as ${role}`);
    }
  };

  const selectTicket = (ticketId: string | null) => {
    setSelectedTicketId(ticketId);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const createTicket = (data: {
    title: string;
    description: string;
    category: any;
    subcategory: string;
    priority: TicketPriority;
    customFields?: Record<string, string>;
    attachments?: Attachment[];
  }): Ticket => {
    const now = new Date();
    const categoryConfig = CATEGORIES.find(c => c.id === data.category) || CATEGORIES[0];
    const { firstResponseDueAt, resolutionDueAt } = calculateDueDates(now, data.priority);
    const newNumber = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: Ticket = {
      id: `TKT-${Date.now()}`,
      ticketNumber: newNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      departmentId: categoryConfig.departmentId,
      departmentName: categoryConfig.departmentName,
      priority: data.priority,
      status: 'OPEN',
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEnrollment: currentUser.studentId || '22BCS1048',
      studentEmail: currentUser.email,
      studentCourse: currentUser.course || 'B.Tech Computer Science',
      customFields: data.customFields || {},
      attachments: data.attachments || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      firstResponseDueAt,
      resolutionDueAt,
      isSlaPaused: false,
      totalPausedMinutes: 0,
      escalationLevel: 'NONE',
      reopenCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: newNumber,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          content: data.description,
          timestamp: now.toISOString(),
          isInternal: false,
          attachments: data.attachments,
        },
      ],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: now.toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'CREATED',
          details: `Ticket logged by ${currentUser.name} under ${categoryConfig.name} (${data.priority} priority).`,
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    showToast('success', 'Ticket Raised Successfully', `Reference ID: ${newNumber}`);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, nextStatus: TicketStatus, note?: string) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        const prevStatus = ticket.status;
        if (prevStatus === nextStatus) return ticket;

        let isSlaPaused = ticket.isSlaPaused;
        let slaPausedAt = ticket.slaPausedAt;
        let totalPausedMinutes = ticket.totalPausedMinutes;
        let resolutionDueAt = ticket.resolutionDueAt;

        const newLogs = [...ticket.activityLogs];

        // If transitioning TO PENDING_STUDENT: Pause SLA clock!
        if (nextStatus === 'PENDING_STUDENT' && prevStatus !== 'PENDING_STUDENT') {
          isSlaPaused = true;
          slaPausedAt = now.toISOString();
          newLogs.push({
            id: `log-${Date.now()}-pause`,
            timestamp: now.toISOString(),
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: 'SLA_PAUSED',
            details: `Status set to Pending Student Action. SLA countdown paused.`,
          });
        }

        // If transitioning FROM PENDING_STUDENT to active status: Resume SLA and extend due date!
        if (prevStatus === 'PENDING_STUDENT' && nextStatus !== 'PENDING_STUDENT') {
          if (slaPausedAt) {
            const pausedDurationMs = Math.max(0, now.getTime() - new Date(slaPausedAt).getTime());
            const pausedMinutes = Math.round(pausedDurationMs / (1000 * 60));
            totalPausedMinutes += pausedMinutes;

            // Extend SLA resolution due date by paused duration
            const currentDueMs = new Date(resolutionDueAt).getTime();
            resolutionDueAt = new Date(currentDueMs + pausedDurationMs).toISOString();

            newLogs.push({
              id: `log-${Date.now()}-resume`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'SLA_RESUMED',
              details: `SLA resumed after ${pausedMinutes} mins. Resolution deadline adjusted accordingly.`,
            });
          }
          isSlaPaused = false;
          slaPausedAt = undefined;
        }

        newLogs.push({
          id: `log-${Date.now()}-status`,
          timestamp: now.toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'STATUS_CHANGED',
          details: `Status changed from ${prevStatus} to ${nextStatus}${note ? ` (${note})` : ''}.`,
        });

        return {
          ...ticket,
          status: nextStatus,
          updatedAt: now.toISOString(),
          isSlaPaused,
          slaPausedAt,
          totalPausedMinutes,
          resolutionDueAt,
          activityLogs: newLogs,
        };
      })
    );

    showToast('info', 'Status Updated', `Ticket status transitioned to ${nextStatus}`);
  };

  const assignTicket = (ticketId: string, assignee: User) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;
        const nextStatus = ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status;

        return {
          ...ticket,
          assigneeId: assignee.id,
          assigneeName: assignee.name,
          assigneeRole: assignee.role,
          status: nextStatus,
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-assign-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'ASSIGNED',
              details: `Assigned to ${assignee.name} (${assignee.role}).`,
            },
          ],
        };
      })
    );
    showToast('success', 'Ticket Assigned', `Ownership assigned to ${assignee.name}`);
  };

  const escalateTicket = (ticketId: string, level: EscalationLevel, reason: string, targetAssignee?: User) => {
    const now = new Date();
    const deanUser = DEMO_USERS.find(u => u.role === 'DEAN')!;
    const hodUser = DEMO_USERS.find(u => u.role === 'HOD')!;

    const assignedTo = targetAssignee || (level === 'LEVEL_3_DEAN' ? deanUser : hodUser);

    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        return {
          ...ticket,
          status: 'ESCALATED',
          escalationLevel: level,
          escalatedAt: now.toISOString(),
          escalatedTo: `${assignedTo.name} (${level})`,
          escalationReason: reason,
          assigneeId: assignedTo.id,
          assigneeName: assignedTo.name,
          assigneeRole: assignedTo.role,
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-esc-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'ESCALATED',
              details: `Escalated to ${level} (${assignedTo.name}). Reason: ${reason}`,
            },
          ],
        };
      })
    );
    showToast('warning', 'Ticket Escalated', `Escalated to ${assignedTo.name}`);
  };

  const resolveTicket = (ticketId: string, resolutionSummary: string, attachment?: Attachment) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        return {
          ...ticket,
          status: 'RESOLVED',
          resolvedAt: now.toISOString(),
          resolutionSummary,
          resolutionAttachment: attachment,
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-res-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'RESOLVED',
              details: `Resolved by ${currentUser.name}. Deliverables and resolution summary provided.`,
            },
          ],
        };
      })
    );
    showToast('success', 'Ticket Resolved', 'Student has been notified to verify and rate resolution.');
  };

  const reopenTicket = (ticketId: string, reason: string) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        return {
          ...ticket,
          status: 'REOPENED',
          reopenCount: ticket.reopenCount + 1,
          reopenReason: reason,
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-reopen-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'REOPENED',
              details: `Ticket reopened by ${currentUser.name}. Reason: ${reason}`,
            },
          ],
        };
      })
    );
    showToast('warning', 'Ticket Reopened', 'Ticket moved back to active queue for further action.');
  };

  const closeTicket = (ticketId: string) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;
        return {
          ...ticket,
          status: 'CLOSED',
          closedAt: now.toISOString(),
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-close-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'CLOSED',
              details: `Closed by ${currentUser.name}. Process concluded.`,
            },
          ],
        };
      })
    );
    showToast('info', 'Ticket Closed', 'Case closed successfully.');
  };

  const submitCSAT = (ticketId: string, rating: number, feedback?: string) => {
    const now = new Date();
    const csat: CSATRating = {
      rating,
      feedback,
      submittedAt: now.toISOString(),
    };

    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;
        return {
          ...ticket,
          csat,
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-csat-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'CSAT_SUBMITTED',
              details: `Satisfaction rating: ${rating}/5 stars.${feedback ? ` Feedback: "${feedback}"` : ''}`,
            },
          ],
        };
      })
    );
    showToast('success', 'Thank You!', 'Your feedback helps improve university support services.');
  };

  const addMessage = (ticketId: string, content: string, isInternal: boolean, attachments?: Attachment[]) => {
    const now = new Date();
    const newMsg = {
      id: `msg-${Date.now()}`,
      ticketId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: now.toISOString(),
      isInternal,
      attachments,
    };

    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;

        const newLogs = [...ticket.activityLogs];
        newLogs.push({
          id: `log-msg-${Date.now()}`,
          timestamp: now.toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: isInternal ? 'INTERNAL_NOTE' : currentUser.role === 'STUDENT' ? 'STUDENT_COMMENT' : 'STAFF_REPLY',
          details: isInternal
            ? `Added internal private note for staff.`
            : `Posted reply: "${content.substring(0, 45)}${content.length > 45 ? '...' : ''}"`,
        });

        // Record first response time if this is the first staff response
        let firstRespondedAt = ticket.firstRespondedAt;
        if (!firstRespondedAt && !isInternal && currentUser.role !== 'STUDENT') {
          firstRespondedAt = now.toISOString();
        }

        // Auto-resume SLA if student replied while ticket was PENDING_STUDENT
        let status = ticket.status;
        let isSlaPaused = ticket.isSlaPaused;
        let slaPausedAt = ticket.slaPausedAt;
        let totalPausedMinutes = ticket.totalPausedMinutes;
        let resolutionDueAt = ticket.resolutionDueAt;

        if (currentUser.role === 'STUDENT' && ticket.status === 'PENDING_STUDENT') {
          status = 'IN_PROGRESS';
          if (slaPausedAt) {
            const pausedDurationMs = Math.max(0, now.getTime() - new Date(slaPausedAt).getTime());
            const pausedMins = Math.round(pausedDurationMs / (1000 * 60));
            totalPausedMinutes += pausedMins;
            const currentDueMs = new Date(resolutionDueAt).getTime();
            resolutionDueAt = new Date(currentDueMs + pausedDurationMs).toISOString();

            newLogs.push({
              id: `log-auto-resume-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: 'SYSTEM',
              actorName: 'CampusDesk SLA Watchdog',
              actorRole: 'STAFF' as Role,
              action: 'SLA_RESUMED',
              details: `Student submitted requested information. SLA clock automatically resumed (adjusted by ${pausedMins} mins).`,
            });
          }
          isSlaPaused = false;
          slaPausedAt = undefined;
        }

        return {
          ...ticket,
          messages: [...ticket.messages, newMsg],
          activityLogs: newLogs,
          firstRespondedAt,
          status,
          isSlaPaused,
          slaPausedAt,
          totalPausedMinutes,
          resolutionDueAt,
          updatedAt: now.toISOString(),
        };
      })
    );

    showToast('info', isInternal ? 'Internal Note Added' : 'Message Sent');
  };

  const updateTicketPriority = (ticketId: string, newPriority: TicketPriority, reason?: string) => {
    const now = new Date();
    setTickets(prev =>
      prev.map(ticket => {
        if (ticket.id !== ticketId) return ticket;
        const oldPriority = ticket.priority;
        const { resolutionDueAt } = calculateDueDates(new Date(ticket.createdAt), newPriority);

        return {
          ...ticket,
          priority: newPriority,
          resolutionDueAt,
          updatedAt: now.toISOString(),
          activityLogs: [
            ...ticket.activityLogs,
            {
              id: `log-prio-${Date.now()}`,
              timestamp: now.toISOString(),
              actorId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              action: 'PRIORITY_CHANGED',
              details: `Priority changed from ${oldPriority} to ${newPriority}${reason ? `. Reason: ${reason}` : ''}. SLA recalculation applied.`,
            },
          ],
        };
      })
    );
    showToast('info', 'Priority Changed', `Updated to ${newPriority}`);
  };

  const resetToDemoData = () => {
    const fresh = generateSeedTickets();
    setTickets(fresh);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    showToast('success', 'Reset Complete', 'Demo database reloaded with fresh tickets and audit logs.');
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  return (
    <TicketContext.Provider
      value={{
        tickets,
        currentUser,
        selectedTicket,
        filters,
        toasts,
        switchUser,
        selectTicket,
        setFilters,
        resetFilters,
        createTicket,
        updateTicketStatus,
        assignTicket,
        escalateTicket,
        resolveTicket,
        reopenTicket,
        closeTicket,
        submitCSAT,
        addMessage,
        updateTicketPriority,
        resetToDemoData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
