import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { StatusBadge } from '../Common/StatusBadge';
import { PriorityBadge } from '../Common/PriorityBadge';
import { SLABadge } from '../Common/SLABadge';
import { CreateTicketModal } from './CreateTicketModal';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileText,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { formatDateTime, computeAgeing } from '../../utils/slaCalculator';

export const StudentDashboard: React.FC = () => {
  const { tickets, currentUser, selectTicket } = useTickets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'RESOLVED'>('ALL');

  // Filter student tickets (for demo Aarav, or tickets matching studentId)
  const studentTickets = tickets.filter(
    t => t.studentId === currentUser.id || t.studentEnrollment === currentUser.studentId
  );

  // Compute stats
  const activeCount = studentTickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const actionRequiredCount = studentTickets.filter(t => t.status === 'PENDING_STUDENT').length;
  const resolvedCount = studentTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  // Filtered tickets
  const filteredTickets = studentTickets.filter(t => {
    // Tab filter
    if (activeTab === 'ACTIVE' && ['RESOLVED', 'CLOSED'].includes(t.status)) return false;
    if (activeTab === 'ACTION_REQUIRED' && t.status !== 'PENDING_STUDENT') return false;
    if (activeTab === 'RESOLVED' && !['RESOLVED', 'CLOSED'].includes(t.status)) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.departmentName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Header and Call to Action */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            Student Support & Grievance Portal
          </h1>
          <p className="page-subtitle">
            Submit, monitor, and resolve administrative requests across fees, attendance, ID cards, and official certificates.
          </p>
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          <PlusCircle size={18} />
          <span>Raise New Request</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">My Total Requests</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-card-value">{studentTickets.length}</div>
          <div className="stat-card-hint">All time submissions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Active / In Processing</span>
            <div className="stat-card-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FCD34D' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-card-value">{activeCount}</div>
          <div className="stat-card-hint">Staff actively reviewing</div>
        </div>

        <div
          className="stat-card"
          style={actionRequiredCount > 0 ? { borderColor: 'rgba(244, 114, 182, 0.5)', background: 'rgba(244, 114, 182, 0.05)' } : {}}
        >
          <div className="stat-card-top">
            <span className="stat-card-label" style={actionRequiredCount > 0 ? { color: '#F472B6' } : {}}>
              Requires Your Action
            </span>
            <div className="stat-card-icon" style={{ background: 'rgba(244, 114, 182, 0.2)', color: '#F472B6' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={actionRequiredCount > 0 ? { color: '#F472B6' } : {}}>
            {actionRequiredCount}
          </div>
          <div className="stat-card-hint">
            {actionRequiredCount > 0 ? 'Staff requested info/documents' : 'No pending actions required'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Resolved & Closed</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-card-value">{resolvedCount}</div>
          <div className="stat-card-hint">Completed support cases</div>
        </div>
      </div>

      {/* Action Required Banner if student has pending action */}
      {actionRequiredCount > 0 && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid rgba(244, 114, 182, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(244, 114, 182, 0.25)',
                color: '#F472B6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FDF2F8' }}>
                University Staff are Waiting for Your Response!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#F9A8D4' }}>
                You have {actionRequiredCount} request in "Pending Student Action". SLA timers are paused until you reply or upload missing documents.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ACTION_REQUIRED')}
            className="btn-secondary"
            style={{ borderColor: 'rgba(244, 114, 182, 0.4)', color: '#FDF2F8' }}
          >
            Review Pending Requests
          </button>
        </div>
      )}

      {/* Search and Tab Navigation */}
      <div className="filter-bar">
        <div className="filter-row-top">
          <div className="search-input-box">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search by ticket #, keyword, subject, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-tabs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`filter-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All My Requests ({studentTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`filter-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          >
            In Processing ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('ACTION_REQUIRED')}
            className={`filter-tab-btn ${activeTab === 'ACTION_REQUIRED' ? 'active' : ''}`}
          >
            Pending Student Action ({actionRequiredCount})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`filter-tab-btn ${activeTab === 'RESOLVED' ? 'active' : ''}`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="ticket-list">
        {filteredTickets.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <HelpCircle size={40} style={{ color: '#4B5563', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No requests found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {search ? 'Try clearing your search filters' : 'You do not have any requests under this tab.'}
            </p>
            {!search && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
                style={{ margin: '16px auto 0' }}
              >
                <PlusCircle size={16} /> Raise Your First Ticket
              </button>
            )}
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const ageing = computeAgeing(ticket.createdAt);
            const isPendingStudent = ticket.status === 'PENDING_STUDENT';
            const isResolved = ticket.status === 'RESOLVED';

            return (
              <div
                key={ticket.id}
                onClick={() => selectTicket(ticket.id)}
                className={`ticket-item ${isPendingStudent ? 'paused-item' : ''}`}
              >
                <div className="ticket-item-top">
                  <div className="ticket-badges-left">
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#A5B4FC', fontWeight: 500 }}>
                      {ticket.departmentName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SLABadge ticket={ticket} />
                    <ChevronRight size={18} color="#6B7280" />
                  </div>
                </div>

                <div>
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-desc-snippet">{ticket.description}</p>
                </div>

                {/* Subcategory & Dynamic summary tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    📂 {ticket.subcategory}
                  </span>

                  {ticket.customFields?.transactionUtr && (
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: '#A5B4FC',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      UTR: {ticket.customFields.transactionUtr}
                    </span>
                  )}

                  {ticket.customFields?.medicalDoctorName && (
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: '#6EE7B7',
                      }}
                    >
                      Doctor: {ticket.customFields.medicalDoctorName}
                    </span>
                  )}
                </div>

                {/* Footer with ageing, messages, and action banner */}
                <div className="ticket-footer">
                  <div className="ticket-meta-left">
                    <span className="ticket-meta-item">
                      <Clock size={13} /> Created: {formatDateTime(ticket.createdAt)} ({ageing.displayText})
                    </span>
                    <span className="ticket-meta-item">
                      <MessageSquare size={13} /> {ticket.messages.length} messages
                    </span>
                    {ticket.assigneeName && (
                      <span className="ticket-meta-item" style={{ color: '#818CF8' }}>
                        Officer: {ticket.assigneeName}
                      </span>
                    )}
                  </div>

                  {isPendingStudent && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#F472B6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertCircle size={13} /> Action Required: Click to upload/reply
                    </span>
                  )}

                  {isResolved && !ticket.csat && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#34D399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} /> Resolved! Click to review & rate
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for creating a ticket */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
