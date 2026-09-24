import React from 'react';
import { Ticket } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { StatusBadge } from '../Common/StatusBadge';
import { PriorityBadge } from '../Common/PriorityBadge';
import { SLABadge } from '../Common/SLABadge';
import { computeSLAStatus, computeAgeing, formatDateTime } from '../../utils/slaCalculator';
import { 
  UserCheck, 
  MessageSquare, 
  Lock, 
  Paperclip, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { currentUser, selectTicket, assignTicket } = useTickets();
  const sla = computeSLAStatus(ticket);
  const ageing = computeAgeing(ticket.createdAt);

  const internalNotesCount = ticket.messages.filter(m => m.isInternal).length;
  const isAssignedToMe = ticket.assigneeId === currentUser.id;
  const isUnassigned = !ticket.assigneeId;

  let cardModifier = '';
  if (sla.state === 'BREACHED') cardModifier = 'breached-item';
  else if (sla.state === 'WARNING') cardModifier = 'warning-item';
  else if (sla.state === 'PAUSED') cardModifier = 'paused-item';

  const handleSelfAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    assignTicket(ticket.id, currentUser);
  };

  return (
    <div
      onClick={() => selectTicket(ticket.id)}
      className={`ticket-item ${cardModifier}`}
    >
      <div className="ticket-item-top">
        <div className="ticket-badges-left">
          <span className="ticket-number">{ticket.ticketNumber}</span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className={`badge-ageing ${ageing.badgeClass}`}>
            Ageing: {ageing.displayText}
          </span>
          {ticket.escalationLevel !== 'NONE' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#F87171',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              <AlertTriangle size={11} /> {ticket.escalationLevel.replace('_', ' ')}
            </span>
          )}
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

      {/* Meta tags & Department info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
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
            🏛️ {ticket.departmentName}
          </span>
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
            📋 {ticket.subcategory}
          </span>
        </div>

        {/* Quick Assign Button */}
        {isUnassigned && currentUser.role !== 'STUDENT' && (
          <button
            onClick={handleSelfAssign}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#A5B4FC',
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UserCheck size={12} /> Claim Ticket
          </button>
        )}
      </div>

      {/* Footer details */}
      <div className="ticket-footer">
        <div className="ticket-meta-left">
          <span>Student: <strong style={{ color: '#E2E8F0' }}>{ticket.studentName}</strong> ({ticket.studentEnrollment})</span>
          <span>•</span>
          <span>Logged: {formatDateTime(ticket.createdAt)}</span>
          {ticket.assigneeName ? (
            <span style={{ color: isAssignedToMe ? '#818CF8' : '#94A3B8' }}>
              • Assignee: {ticket.assigneeName} {isAssignedToMe ? '(You)' : ''}
            </span>
          ) : (
            <span style={{ color: '#F59E0B' }}>• Unassigned</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#9CA3AF' }}>
          {ticket.attachments && ticket.attachments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Paperclip size={12} /> {ticket.attachments.length}
            </span>
          )}
          {internalNotesCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#FCD34D' }}>
              <Lock size={12} /> {internalNotesCount} notes
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MessageSquare size={12} /> {ticket.messages.length}
          </span>
        </div>
      </div>
    </div>
  );
};
