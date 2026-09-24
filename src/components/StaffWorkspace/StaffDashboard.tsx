import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { CATEGORIES } from '../../data/seedData';
import { TicketCard } from './TicketCard';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { computeSLAStatus, computeAgeing } from '../../utils/slaCalculator';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Flame,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { tickets, currentUser, filters, setFilters, resetFilters } = useTickets();
  const [activeQueueTab, setActiveQueueTab] = useState<'ALL' | 'MY_TICKETS' | 'UNASSIGNED' | 'PENDING_STUDENT' | 'URGENT'>('ALL');

  // Compute operational department metrics
  const isHod = currentUser.role === 'HOD';
  const myDeptTickets = tickets.filter(t => 
    !currentUser.departmentId || t.departmentId === currentUser.departmentId || isHod
  );

  const myAssignedCount = tickets.filter(t => t.assigneeId === currentUser.id && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const unassignedCount = tickets.filter(t => !t.assigneeId && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const pendingStudentCount = tickets.filter(t => t.status === 'PENDING_STUDENT').length;
  const urgentBreachedCount = tickets.filter(t => {
    if (['RESOLVED', 'CLOSED', 'PENDING_STUDENT'].includes(t.status)) return false;
    const sla = computeSLAStatus(t);
    return sla.state === 'BREACHED' || sla.state === 'WARNING' || t.priority === 'CRITICAL';
  }).length;

  // Filter pipeline
  const filteredTickets = tickets.filter(ticket => {
    // Queue tab filter
    if (activeQueueTab === 'MY_TICKETS' && ticket.assigneeId !== currentUser.id) return false;
    if (activeQueueTab === 'UNASSIGNED' && (ticket.assigneeId || ['RESOLVED', 'CLOSED'].includes(ticket.status))) return false;
    if (activeQueueTab === 'PENDING_STUDENT' && ticket.status !== 'PENDING_STUDENT') return false;
    if (activeQueueTab === 'URGENT') {
      const sla = computeSLAStatus(ticket);
      const isUrgent = sla.state === 'BREACHED' || sla.state === 'WARNING' || ticket.priority === 'CRITICAL';
      if (!isUrgent || ['RESOLVED', 'CLOSED'].includes(ticket.status)) return false;
    }

    // Category filter
    if (filters.category !== 'ALL' && ticket.category !== filters.category) return false;

    // Status filter
    if (filters.status !== 'ALL' && ticket.status !== filters.status) return false;

    // Priority filter
    if (filters.priority !== 'ALL' && ticket.priority !== filters.priority) return false;

    // Department filter
    if (filters.departmentId !== 'ALL' && ticket.departmentId !== filters.departmentId) return false;

    // Ageing filter
    if (filters.ageingBucket !== 'ALL') {
      const ageing = computeAgeing(ticket.createdAt);
      if (ageing.bucket !== filters.ageingBucket) return false;
    }

    // SLA State filter
    if (filters.slaState !== 'ALL') {
      const sla = computeSLAStatus(ticket);
      if (filters.slaState === 'BREACHED' && sla.state !== 'BREACHED') return false;
      if (filters.slaState === 'WARNING' && sla.state !== 'WARNING') return false;
      if (filters.slaState === 'HEALTHY' && sla.state !== 'HEALTHY') return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.title.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        ticket.studentName.toLowerCase().includes(q) ||
        ticket.studentEnrollment.toLowerCase().includes(q) ||
        (ticket.customFields?.transactionUtr && ticket.customFields.transactionUtr.toLowerCase().includes(q)) ||
        (ticket.customFields?.medicalDoctorName && ticket.customFields.medicalDoctorName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Sorting
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (filters.sortBy === 'SLA_URGENT') {
      // Tickets closer to due date come first, breached on top
      const dueA = new Date(a.resolutionDueAt).getTime();
      const dueB = new Date(b.resolutionDueAt).getTime();
      return dueA - dueB;
    }
    if (filters.sortBy === 'CREATED_DESC') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'CREATED_ASC') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'PRIORITY_DESC') {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            Helpdesk Queue & Operations Console
          </h1>
          <p className="page-subtitle">
            Triaging requests for <strong>{currentUser.departmentName || 'All Campus Queues'}</strong>. Active officer: <strong>{currentUser.name}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">My Assigned Cases</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="stat-card-value">{myAssignedCount}</div>
          <div className="stat-card-hint">Assigned directly to you</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Unassigned Pool</span>
            <div className="stat-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-card-value">{unassignedCount}</div>
          <div className="stat-card-hint">Awaiting staff ownership</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">SLA At Risk / Breached</span>
            <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: urgentBreachedCount > 0 ? '#F87171' : undefined }}>
            {urgentBreachedCount}
          </div>
          <div className="stat-card-hint">Critical or breached deadline</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Pending Student Action</span>
            <div className="stat-card-icon" style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#F472B6' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-card-value">{pendingStudentCount}</div>
          <div className="stat-card-hint">SLA clock is paused</div>
        </div>
      </div>

      {/* Filter and Queue Tabs */}
      <div className="filter-bar">
        <div className="filter-row-top">
          {/* Search Box */}
          <div className="search-input-box">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search by student, ID, ticket #, UTR, keyword..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          {/* Department Filter */}
          <select
            className="filter-select"
            value={filters.departmentId}
            onChange={e => setFilters(prev => ({ ...prev, departmentId: e.target.value }))}
          >
            <option value="ALL">All Departments</option>
            {CATEGORIES.map(c => (
              <option key={c.departmentId} value={c.departmentId}>
                {c.departmentName}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="filter-select"
            value={filters.priority}
            onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">P1 - Critical</option>
            <option value="HIGH">P2 - High</option>
            <option value="MEDIUM">P3 - Medium</option>
            <option value="LOW">P4 - Low</option>
          </select>

          {/* Ageing Filter */}
          <select
            className="filter-select"
            value={filters.ageingBucket}
            onChange={e => setFilters(prev => ({ ...prev, ageingBucket: e.target.value as any }))}
          >
            <option value="ALL">All Ageing</option>
            <option value="UNDER_24_HOURS">&lt; 24h (Fresh)</option>
            <option value="ONE_TO_THREE_DAYS">1 – 3 Days</option>
            <option value="FOUR_TO_SEVEN_DAYS">4 – 7 Days</option>
            <option value="OVER_SEVEN_DAYS">&gt; 7 Days (Stale)</option>
          </select>

          {/* Sort By */}
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="SLA_URGENT">Sort: SLA Urgency</option>
            <option value="PRIORITY_DESC">Sort: Priority (Critical first)</option>
            <option value="CREATED_DESC">Sort: Newest Logged</option>
            <option value="CREATED_ASC">Sort: Oldest (Ageing)</option>
          </select>

          {/* Reset button */}
          <button onClick={resetFilters} className="btn-ghost-sm" title="Clear all search and dropdown filters">
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Preset Workflow Queue Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setActiveQueueTab('ALL')}
            className={`filter-tab-btn ${activeQueueTab === 'ALL' ? 'active' : ''}`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveQueueTab('MY_TICKETS')}
            className={`filter-tab-btn ${activeQueueTab === 'MY_TICKETS' ? 'active' : ''}`}
          >
            Assigned to Me ({myAssignedCount})
          </button>
          <button
            onClick={() => setActiveQueueTab('UNASSIGNED')}
            className={`filter-tab-btn ${activeQueueTab === 'UNASSIGNED' ? 'active' : ''}`}
          >
            Unassigned Queue ({unassignedCount})
          </button>
          <button
            onClick={() => setActiveQueueTab('URGENT')}
            className={`filter-tab-btn ${activeQueueTab === 'URGENT' ? 'active' : ''}`}
          >
            🔥 SLA Risk & Breached ({urgentBreachedCount})
          </button>
          <button
            onClick={() => setActiveQueueTab('PENDING_STUDENT')}
            className={`filter-tab-btn ${activeQueueTab === 'PENDING_STUDENT' ? 'active' : ''}`}
          >
            ⏸️ Pending Student Action ({pendingStudentCount})
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="ticket-list">
        {sortedTickets.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={40} style={{ color: '#10B981', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Queue is Clear!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              No tickets match your active queue filter or search parameters.
            </p>
            <button onClick={resetFilters} className="btn-secondary" style={{ margin: '16px auto 0' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          sortedTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>

      {/* Ticket Detail Drawer Side-Panel */}
      <TicketDetailDrawer />
    </div>
  );
};
